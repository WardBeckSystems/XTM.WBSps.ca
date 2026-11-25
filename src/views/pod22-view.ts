/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * WBS POD-22 Stereo Loudness Meter - Pure Borderless View & SVG Renderer
 * High-performance 60+ FPS direct DOM update engine with smoked acrylic diffuser lens.
 * Zero DOM teardown per frame.
 *
 * Thin facade over the modules in ./pod22/ (scale, positions, colours,
 * SVG shell, ballistics, DOM); the public API is unchanged.
 */

import type { MeterFrameTelemetry } from '../types/telemetry';
import type { XtmModel } from '../models/xtm-model';
import {
  SCALE_STD, THRESHOLDS_STD, SCALE_EXT, THRESHOLDS_EXT,
  minPos, maxPos, scaleFor, thresholdsFor, dbToSegmentIndex,
  type Pod22DipSwitch
} from './pod22/scale';
import { POD22_PW, POD22_PH, segX } from './pod22/positions';
import { segColor, scaleNumColor } from './pod22/colors';
import { buildPod22Shell } from './pod22/svg-shell';
import { computeLit, frameDt } from './pod22/ballistics';
import { bindPod22Dom, applyLit } from './pod22/dom';

export { WBS_LOGO_PATH } from './xtm/lib/wbs-logo';
export type { Pod22DipSwitch } from './pod22/scale';

export class Pod22View {
  container: HTMLElement | null;
  isBuilt: boolean = false;
  heldPeak: [number, number] = [-1, -1];
  holdTimer: [number, number] = [0, 0];
  dip: Pod22DipSwitch = { BS0: 0, BS1: 1 };

  readonly PW: number = POD22_PW;
  readonly PH: number = POD22_PH;

  readonly SCALE_STD: readonly string[] = SCALE_STD;
  readonly THRESHOLDS_STD: readonly number[] = THRESHOLDS_STD;
  readonly SCALE_EXT: readonly string[] = SCALE_EXT;
  readonly THRESHOLDS_EXT: readonly number[] = THRESHOLDS_EXT;

  extendedLed22: boolean = true;
  scaleMode: 'log' | 'vu' | 'peak' = 'log';
  decayType: string = 'type2';
  smoothDb: [number, number] = [-100, -100];
  lastTime: number = performance.now();

  // DOM Element Cache
  ledEls: [Record<number, SVGElement | null>, Record<number, SVGElement | null>] = [{}, {}];
  glowEls: [Record<number, SVGElement | null>, Record<number, SVGElement | null>] = [{}, {}];
  lastLit: [Record<number, boolean | null>, Record<number, boolean | null>] = [{}, {}];

  constructor(containerEl: HTMLElement | null) {
    this.container = containerEl;
  }

  get minP(): number {
    return minPos(this.extendedLed22);
  }

  get maxP(): number {
    return maxPos(this.extendedLed22);
  }

  get SCALE(): readonly string[] {
    return scaleFor(this.extendedLed22);
  }

  get DB_THRESHOLDS(): readonly number[] {
    return thresholdsFor(this.extendedLed22);
  }

  setDecay(decay: string): void {
    this.decayType = decay;
    this.dip.BS0 = (decay === 'type1' ? 1 : 0);
  }

  setExtendedRange(enabled: boolean): void {
    if (this.extendedLed22 !== enabled) {
      this.extendedLed22 = enabled;
      this.isBuilt = false;
      this.heldPeak = [-1, -1];
      this.holdTimer = [0, 0];
      if (this.container) {
        this.container.innerHTML = this.buildShell();
        this.initDom();
        this.isBuilt = true;
      }
    }
  }

  segX(p: number): number {
    return segX(p);
  }

  segColor(p: number): string {
    return segColor(p, this.maxP);
  }

  scaleNumColor(p: number, _lb?: string): string {
    return scaleNumColor(p, this.maxP);
  }

  dbToSegmentIndex(db: number): number {
    return dbToSegmentIndex(db, this.extendedLed22, this.DB_THRESHOLDS);
  }

  /* ---------------- Build Static Base SVG Shell Once ---------------- */
  buildShell(): string {
    return buildPod22Shell(this);
  }

  /* ---------------- Fast Direct DOM Binding ---------------- */
  initDom(): void {
    if (!this.container) return;
    bindPod22Dom(this.container, this, this.minP, this.maxP);
  }

  /* ---------------- 60 FPS Direct Fast Update ---------------- */
  render(model: XtmModel, levels: MeterFrameTelemetry): void {
    if (!this.container) return;

    if (!this.isBuilt) {
      this.container.innerHTML = this.buildShell();
      this.initDom();
      this.isBuilt = true;
    }

    const now = performance.now();
    const dt = frameDt(now, this.lastTime);
    this.lastTime = now;

    const lit = computeLit(this, levels, model.power, dt);
    applyLit(this, lit, this.minP, this.maxP, (p) => this.segColor(p));
  }
}
