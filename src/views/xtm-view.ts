/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM Pure Precision Visualizer & SVG Renderer
 * High-performance 60+ FPS architecture with GPU-accelerated needle transforms
 * and direct DOM element updates (zero full-DOM teardown on animation frames).
 * Meters:
 *   - Meter 0: Channel A VU (Warm Amber dial)
 *   - Meter 1: Channel A Black PPM (European Black dial with Luminous Yellow needle)
 *   - Meter 2: Channel B VU (Warm Amber dial)
 *   - Meter 3: Channel B Black PPM (European Black dial with Luminous Yellow needle)
 *   - Center Console: Green WBS highlight frame, VFD display, 8-LED Phase bar,
 *     and interactive buttons.
 *
 * The SVG and per-frame work live in ./xtm/ (layout, lib, faces, skins, meter,
 * shell, runtime); this class owns the DOM caches and change-detection state.
 */

import type { MeterFrameTelemetry, MeterStyle } from '../types/telemetry';
import type { XtmModel } from '../models/xtm-model';
import * as L from './xtm/layout/wbs-layout';
import { MC_WIN } from './xtm/layout/mccurdy-layout';
import * as scale from './xtm/lib/scale-math';
import type { PolarFn, ArcFn } from './xtm/lib/svg';
import { renderDotMatrix } from './xtm/lib/dot-matrix';
import { renderSevenSeg } from './xtm/lib/seven-seg';
import { renderAltPpmFace, altPpmFace } from './xtm/faces/ppm/index';
import { renderMeterShell } from './xtm/meter/meter-shell';
import { getCenterPlatePath } from './xtm/skins/wbs/center-plate';
import { renderMcCurdyPanel } from './xtm/skins/mccurdy/panel';
import { renderMcCurdyCenter } from './xtm/skins/mccurdy/center';
import { mcRangeText, renderMcRangeDigits } from './xtm/skins/mccurdy/range';
import { buildShellSvg } from './xtm/shell/build-shell';
import { needleAngles, applyNeedleAngles } from './xtm/runtime/needles';
import { phaseLedKey, paintPhaseLeds } from './xtm/runtime/phase-leds';
import { hasSignal, SIGNAL_LOSS_MS } from './xtm/runtime/signal';
import { vfdFrame, renderVfd, modeTitle } from './xtm/runtime/vfd';
import type { ButtonElementBundle } from './xtm/runtime/buttons';
import { queryButtonEls, paintButtons } from './xtm/runtime/buttons';
import { attachPointerEvents } from './xtm/runtime/pointer';

export { WBS_LOGO_PATH } from './xtm/lib/wbs-logo';
export type { ButtonElementBundle } from './xtm/runtime/buttons';

export class XtmView {
  container: HTMLElement | null;
  isBuilt: boolean = false;
  private _eventsAttached: boolean = false;

  // Button tracking
  heldButton: string | null = null;

  // Responsive canvas geometry, meter windows, pivots and centre console (see xtm/layout)
  readonly VW: number = L.VW;
  readonly VH: number = L.VH;
  readonly MW: number = L.MW;
  readonly MH: number = L.MH;
  readonly MX: readonly number[] = L.MX;
  readonly MYc: number = L.MYc;
  readonly py: number = L.PY;
  readonly R: number = L.R;
  readonly DISP: { readonly x: number; readonly y: number; readonly w: number; readonly h: number } = L.DISP;
  readonly BX: Record<string, number> = L.BX;
  readonly BW: number = L.BW;
  readonly BH: number = L.BH;
  readonly BY: number = L.BY;

  currentMeterStyle: MeterStyle = 'simpson';

  /** PPM ballistics standard chosen in Settings; selects the PPM face in WBS mode. */
  ppmStandard: string = 'type2';

  // Signal presence tracking for 10-second loss of signal warning
  lastAudioTime: number = performance.now();
  hasSignalLost: boolean = false;
  lastSignalLostState: boolean = false;

  // DOM Element Caches for zero-allocation 60 FPS updates
  needleEls: (SVGElement | null)[] = [null, null, null, null];
  phaseLedEls: (SVGElement | null)[] = [];      // WBS round lamps
  phaseLedRectEls: (SVGElement | null)[] = [];  // McCurdy rectangular segments
  vfdEl: SVGElement | null = null;
  modeTitleEl: SVGElement | null = null;
  btnEls: Record<string, ButtonElementBundle> = {};
  winkEls: (SVGElement | null)[] = [null, null, null, null, null];

  // Change detection caches
  lastAngles: [number, number, number, number] = [-999, -999, -999, -999];
  lastPhaseLed: number = -999;
  lastDisplayText: string = '';
  lastModeTitle: string = '';
  lastHeldButton: string | null = null;
  lastActiveInput: number = -999;
  lastMcRangeMode: string = '';
  lastMcAttenuatorStep: number = -999;

  /* 2-digit red 7-segment RANGE readout for McCurdy mode */
  readonly MC_WIN = MC_WIN;
  lastMcDigits: string = '';

  // Callbacks
  onButtonPressed: ((name: string) => void) | null = null;
  onButtonReleased: ((name: string) => void) | null = null;

  constructor(containerEl: HTMLElement | null) {
    this.container = containerEl;
  }

  /* ---------------- Rendering helpers (delegates to xtm/) ---------------- */
  getCenterPlatePath(): string { return getCenterPlatePath(); }
  vuFrac(db: number): number { return scale.vuFrac(db); }
  vuAngle(p: number, isSifam = false): number { return scale.vuAngle(p, isSifam); }
  ppmFrac(db: number | null): number { return scale.ppmFrac(db); }
  ppmAngle(q: number, isSifam = false): number { return scale.ppmAngle(q, isSifam); }

  renderDotMatrix(text: string, x: number, y: number, pitch: number, onColor: string, offColor: string): string {
    return renderDotMatrix(text, x, y, pitch, onColor, offColor);
  }

  renderAltPpmFace(P: PolarFn, arc: ArcFn, ink: string, isSifam: boolean): string {
    return renderAltPpmFace(altPpmFace(this.ppmStandard), P, arc, ink, isSifam);
  }

  renderMeterShell(id: number, cx: number, cy: number, kind: 'vu' | 'ppm', isPowered: boolean, dialLamp: string, isBlackPpm = false, meterStyle = 'simpson'): string {
    return renderMeterShell(id, cx, cy, kind, isPowered, dialLamp, isBlackPpm, meterStyle, this.ppmStandard);
  }

  renderMcCurdyPanel(): string { return renderMcCurdyPanel(); }
  renderMcCurdyCenter(): string { return renderMcCurdyCenter(); }
  renderSevenSeg(text: string): string { return renderSevenSeg(text, this.MC_WIN); }
  mcRangeText(model: XtmModel): string { return mcRangeText(model); }

  /* ---------------- Build Complete Base SVG Shell ---------------- */
  buildShell(model: XtmModel): string {
    this.currentMeterStyle = model?.meterStyle || 'simpson';
    return buildShellSvg({
      power: model.power,
      dialLamp: model.dialLamp,
      meterStyle: model.meterStyle,
      ppmStandard: this.ppmStandard
    });
  }

  /* ---------------- Explicit Shell Build Method ---------------- */
  build(model: XtmModel): void {
    if (!this.container) return;

    this.container.innerHTML = this.buildShell(model);
    this.initDom();
    this.lastMcDigits = '';
    this.lastPhaseLed = -999;
    this.lastActiveInput = -999;
    this.lastMcRangeMode = '';
    this.lastMcAttenuatorStep = -999;
    this.isBuilt = true;
  }

  /* ---------------- Fast Direct DOM Binding ---------------- */
  initDom(): void {
    if (!this.container) return;
    for (let i = 0; i < 4; i++) {
      this.needleEls[i] = this.container.querySelector<SVGElement>(`#xtm_needle_${i}`);
    }
    this.phaseLedEls = [];
    for (let i = 0; i < 8; i++) {
      this.phaseLedEls[i] = this.container.querySelector<SVGElement>(`#xphase_led_${i}`);
      this.phaseLedRectEls[i] = this.container.querySelector<SVGElement>(`#xphase_ledr_${i}`);
    }
    this.vfdEl = this.container.querySelector<SVGElement>('#xvfd_group');
    this.modeTitleEl = this.container.querySelector<SVGElement>('#xtm_mode_title');
    queryButtonEls(this.container, this.btnEls);

    this.winkEls = [null];
    for (let i = 1; i <= 4; i++) {
      this.winkEls.push(this.container.querySelector<SVGElement>(`#wink_btn_${i}`));
    }

    this.attachEvents();
  }

  /* ---------------- Event Delegation Attached Once ---------------- */
  attachEvents(): void {
    if (this._eventsAttached || !this.container) return;
    this._eventsAttached = true;
    attachPointerEvents(this.container, this);
  }

  /* ---------------- Priority 1: Needle Processing ---------------- */
  updateNeedles(levels: MeterFrameTelemetry, on: boolean = true, isSifam?: boolean): void {
    if (!this.container || !this.isBuilt) return;
    const sifam = isSifam !== undefined ? isSifam : (this.currentMeterStyle === 'sifam');
    applyNeedleAngles(needleAngles(levels, on, sifam), this.lastAngles, this.needleEls);
  }

  /* ---------------- Priority 2: Secondary Visual Elements ---------------- */
  renderSecondary(model: XtmModel, levels: MeterFrameTelemetry): void {
    if (!this.container) return;
    if (!this.isBuilt) {
      this.build(model);
    }

    const on = model.power;

    // 2. Phase Correlation LEDs (McCurdy mode: all-red rectangular segments in one window)
    const led = on ? levels.phaseLed : -1;
    const mc = document.body.classList.contains('theme-mccurdy') || document.body.classList.contains('theme-mccurdy-dark');
    const ledKey = phaseLedKey(led, mc);
    if (ledKey !== this.lastPhaseLed) {
      this.lastPhaseLed = ledKey;
      paintPhaseLeds(mc ? this.phaseLedRectEls : this.phaseLedEls, led, on, mc);
    }

    // 3. Signal Presence Tracking & 10s Loss of Signal Warning
    const now = performance.now();
    if (hasSignal(levels)) {
      this.lastAudioTime = now;
      this.hasSignalLost = false;
    } else if (now - this.lastAudioTime >= SIGNAL_LOSS_MS) {
      this.hasSignalLost = true;
    }

    // VFD Dot-Matrix Display: Alternating telemetry or 10s Loss of Signal warning
    const vfd = vfdFrame(model, levels, now, this.hasSignalLost);
    if ((vfd.txt !== this.lastDisplayText || this.hasSignalLost !== this.lastSignalLostState) && this.vfdEl) {
      this.lastDisplayText = vfd.txt;
      this.lastSignalLostState = this.hasSignalLost;
      this.vfdEl.innerHTML = renderVfd(vfd);
    }

    // McCurdy RANGE readout (only visible in McCurdy mode, kept current in both)
    const mcTxt = mcRangeText(model);
    if (mcTxt !== this.lastMcDigits && this.container) {
      const g = this.container.querySelector<SVGElement>('#xmc_digits');
      if (g) { g.innerHTML = renderMcRangeDigits(mcTxt); this.lastMcDigits = mcTxt; }
    }

    // 4. Status Title
    const title = modeTitle(model, this.hasSignalLost);
    if (title !== this.lastModeTitle && this.modeTitleEl) {
      this.lastModeTitle = title;
      this.modeTitleEl.textContent = title;
    }

    // 5. Button Press Visual Feedback
    if (this.heldButton !== this.lastHeldButton) {
      this.lastHeldButton = this.heldButton;
      paintButtons(this.btnEls, this.heldButton);
    }

    // 6. Ward-Beck.ca Wink Switch Selector Animation & State
    const activeInput = on ? model.getSelectedInput() : 0;
    if (activeInput !== this.lastActiveInput) {
      this.lastActiveInput = activeInput;
      for (let i = 1; i <= 4; i++) {
        const el = this.winkEls[i];
        if (el) {
          const isOpen = (i === activeInput);
          el.classList.toggle('wink-open', isOpen);
          el.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
        }
      }
    }

    // 7. McCurdy Range Selector Switch & 31-Step Attenuator Sync
    const mcMode = model.mcRangeMode || 'outer';
    const mcStep = model.mcAttenuatorStep ?? 15;
    if (mcMode !== this.lastMcRangeMode || mcStep !== this.lastMcAttenuatorStep) {
      this.lastMcRangeMode = mcMode;
      this.lastMcAttenuatorStep = mcStep;

      // Update bat-handle switch stick (-24° Outer, 0° CAL, +24° Inner)
      const stick = this.container?.querySelector<SVGElement>('#mc_toggle_stick_rotor');
      if (stick) {
        const deg = mcMode === 'outer' ? -24 : (mcMode === 'inner' ? 24 : 0);
        stick.setAttribute('transform', `rotate(${deg})`);
      }

      // Update silkscreen toggle labels
      const lblOuter = this.container?.querySelector<SVGElement>('#mc_toggle_lbl_outer');
      const subOuter = this.container?.querySelector<SVGElement>('#mc_toggle_sub_outer');
      const lblCal = this.container?.querySelector<SVGElement>('#mc_toggle_lbl_cal');
      const lblInner = this.container?.querySelector<SVGElement>('#mc_toggle_lbl_inner');
      const subInner = this.container?.querySelector<SVGElement>('#mc_toggle_sub_inner');

      const isOuter = mcMode === 'outer';
      const isInner = mcMode === 'inner';
      const isCal = mcMode === 'cal';

      if (lblOuter) lblOuter.setAttribute('fill', isOuter ? '#fbbf24' : '#64748b');
      if (subOuter) {
        subOuter.setAttribute('fill', isOuter ? '#fbbf24' : '#64748b');
        subOuter.setAttribute('fill-opacity', isOuter ? '1' : '0.5');
      }
      if (lblCal) lblCal.setAttribute('fill', isCal ? '#fbbf24' : '#94a3b8');
      if (lblInner) lblInner.setAttribute('fill', isInner ? '#fbbf24' : '#64748b');
      if (subInner) {
        subInner.setAttribute('fill', isInner ? '#fbbf24' : '#64748b');
        subInner.setAttribute('fill-opacity', isInner ? '1' : '0.5');
      }

      // Highlight active scale ring on main attenuator dial
      const scaleOuter = this.container?.querySelector<SVGElement>('#mc_scale_outer_group');
      const scaleInner = this.container?.querySelector<SVGElement>('#mc_scale_inner_group');
      if (scaleOuter) {
        scaleOuter.style.transition = 'opacity 0.2s ease';
        scaleOuter.style.opacity = isOuter ? '1' : '0.35';
      }
      if (scaleInner) {
        scaleInner.style.transition = 'opacity 0.2s ease';
        scaleInner.style.opacity = isInner ? '1' : '0.35';
      }

      // Update main attenuator knob rotor pointer position
      const rotor = this.container?.querySelector<SVGElement>('#mccurdy_vintage_knob_rotor');
      if (rotor) {
        const cx = rotor.getAttribute('data-cx') || '1580';
        const cy = rotor.getAttribute('data-cy') || '215';
        const angle = (mcStep - 15) * 9;
        rotor.setAttribute('transform', `translate(${cx}, ${cy}) rotate(${angle.toFixed(1)})`);
      }
    }
  }

  /* ---------------- Unified 60 FPS Direct Update Engine ---------------- */
  render(model: XtmModel, levels: MeterFrameTelemetry): void {
    if (!this.container) return;

    if (!this.isBuilt) {
      this.container.innerHTML = this.buildShell(model);
      this.initDom();
      this.isBuilt = true;
    }

    // 1. NEEDLES PROCESSED FIRST
    const isSifam = model ? (model.meterStyle === 'sifam') : false;
    this.updateNeedles(levels, model ? model.power : true, isSifam);

    // 2. SECONDARY PROCESSING AFTER
    this.renderSecondary(model, levels);
  }
}
