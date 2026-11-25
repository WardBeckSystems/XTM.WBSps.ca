/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * MONITOR level knob: a small knurled rotary pot beside the INPUT SELECTOR.
 * - Drives the speaker (HW 1) level, the same value as Settings → Monitor Volume
 *   and the router's Speakers fader.
 * - Only on the panel while the Ward-Beck Audio Tap (localhost:8467) is online.
 * - Drag up / down or scroll to turn, double-click for the default, arrow keys when focused.
 * - Colours come from the --mk-* tokens in css/components/monitor-knob.css (one set per theme);
 *   its position per theme is set there too.
 */

/** Pointer sweep: 0 at -135°, full at +135° (7 o'clock to 5 o'clock). */
const SWEEP = 135;
const ARC_R = 22;

const angleOf = (level: number): number => -SWEEP + 2 * SWEEP * Math.max(0, Math.min(1, level));

const polar = (r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
};

/** Arc path at radius r from angle a0 to a1 (degrees, clockwise from 12 o'clock). */
function arcPath(r: number, a0: number, a1: number): string {
  if (a1 - a0 < 0.5) return '';
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** Knurled barrel outline (count ribs). */
function knurlPath(r: number, depth: number, count: number): string {
  const n = count * 12;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const rr = r - depth * (0.5 - 0.5 * Math.cos(count * t));
    d += `${i ? 'L' : 'M'} ${(rr * Math.sin(t)).toFixed(2)} ${(-rr * Math.cos(t)).toFixed(2)} `;
  }
  return d + 'Z';
}

/** SVG for the knob (hidden until the TAP is online). */
export function renderMonitorKnob(): string {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => {
    const a = angleOf(p);
    const [x0, y0] = polar(ARC_R + 3, a);
    const [x1, y1] = polar(ARC_R + 6, a);
    return `<line x1="${x0.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${x1.toFixed(2)}" y2="${y1.toFixed(2)}"/>`;
  }).join('');
  return `
    <g id="xtm_monitor_knob" class="xtm-monitor-knob" role="slider" tabindex="0"
       aria-label="Monitor level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="70"
       font-family="'Helvetica Neue', Helvetica, Arial, sans-serif">
      <title>Monitor level (drag or scroll, double-click for default)</title>
      <defs>
        <radialGradient id="mk_skirt_grad" cx="40%" cy="32%" r="75%">
          <stop offset="0%" class="mk-skirt-hi"/><stop offset="100%" class="mk-skirt-lo"/>
        </radialGradient>
        <linearGradient id="mk_body_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" class="mk-body-hi"/><stop offset="100%" class="mk-body-lo"/>
        </linearGradient>
        <radialGradient id="mk_cap_grad" cx="38%" cy="30%" r="80%">
          <stop offset="0%" class="mk-cap-hi"/><stop offset="100%" class="mk-cap-lo"/>
        </radialGradient>
      </defs>
      <circle class="mk-hit" r="30"/>
      <path class="mk-track" d="${arcPath(ARC_R, -SWEEP, SWEEP)}"/>
      <path class="mk-arc" id="xtm_monitor_knob_arc" d=""/>
      <g class="mk-ticks">${ticks}</g>
      <circle class="mk-skirt" r="17" fill="url(#mk_skirt_grad)"/>
      <g class="mk-rotor" id="xtm_monitor_knob_rotor">
        <path class="mk-body" fill="url(#mk_body_grad)" d="${knurlPath(14, 1.6, 20)}"/>
        <circle class="mk-cap" r="10.5" fill="url(#mk_cap_grad)"/>
        <path class="mk-glint" d="M -7 -5 A 9 9 0 0 1 4 -9"/>
        <line class="mk-pointer" x1="0" y1="-4" x2="0" y2="-15.5"/>
      </g>
      <text class="mk-label" x="0" y="34" text-anchor="middle">MONITOR</text>
    </g>`;
}

export interface MonitorKnobHost {
  /** Current speaker level 0..1 */
  level(): number;
  /** Turn the speaker level (0..1) */
  setLevel(v: number): void;
  /** Ward-Beck Audio Tap reachable */
  online(): boolean;
  /** Level used by double-click / Home-reset */
  defaultLevel: number;
  /** Subscribe to level / TAP changes */
  subscribe?(cb: () => void): void;
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const snap = (v: number): number => Math.round(clamp01(v) * 100) / 100;

/**
 * Wire the knob inside the XTM stage. Events are delegated on the container, so the
 * knob keeps working after the view rebuilds its SVG; sync() repaints whatever copy is live.
 */
export function bindMonitorKnob(container: HTMLElement, host: MonitorKnobHost): { sync(): void } {
  let shownLevel = -1;
  let shownOnline: boolean | null = null;
  let shownEl: Element | null = null;
  let drag: { y: number; v: number; id: number } | null = null;

  const knobOf = (t: EventTarget | null): Element | null =>
    (t instanceof Element ? t.closest('.xtm-monitor-knob') : null);

  const paint = (el: Element, level: number): void => {
    const a = angleOf(level);
    el.querySelector('#xtm_monitor_knob_rotor')?.setAttribute('transform', `rotate(${a.toFixed(1)})`);
    el.querySelector('#xtm_monitor_knob_arc')?.setAttribute('d', arcPath(ARC_R, -SWEEP, a));
    const pct = Math.round(level * 100);
    el.setAttribute('aria-valuenow', String(pct));
    el.setAttribute('aria-valuetext', `${pct}%`);
    const title = el.querySelector('title');
    if (title) title.textContent = `Monitor level ${pct}% (drag or scroll, double-click for default)`;
  };

  const sync = (): void => {
    const el = container.querySelector('#xtm_monitor_knob');
    if (!el) return;
    const online = host.online();
    const level = drag ? shownLevel : snap(host.level());
    if (el !== shownEl) { shownEl = el; shownOnline = null; shownLevel = -1; }
    if (online !== shownOnline) {
      shownOnline = online;
      el.classList.toggle('is-online', online);
      if (!online && document.activeElement === el) (el as SVGElement).blur();
    }
    if (level !== shownLevel) { shownLevel = level; paint(el, level); }
  };

  const turnTo = (v: number): void => {
    const lvl = snap(v);
    if (lvl === snap(host.level()) && lvl === shownLevel) return;
    host.setLevel(lvl);
    const el = container.querySelector('#xtm_monitor_knob');
    if (el) { shownLevel = lvl; paint(el, lvl); }
  };

  container.addEventListener('pointerdown', (e: PointerEvent) => {
    const el = knobOf(e.target);
    if (!el || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    // Ctrl-click (⌘ on macOS): straight to 0 (see docs/CTRL-CLICK.md)
    if (e.ctrlKey || e.metaKey) { turnTo(0); sync(); return; }
    (el as SVGElement).focus({ preventScroll: true });
    drag = { y: e.clientY, v: snap(host.level()), id: e.pointerId };
    el.classList.add('is-turning');
    try { (el as SVGElement).setPointerCapture(e.pointerId); } catch { /* not capturable */ }
  });

  container.addEventListener('pointermove', (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    // 200 px for the full sweep; Shift for fine trim
    const perPx = e.shiftKey ? 0.001 : 0.005;
    turnTo(drag.v + (drag.y - e.clientY) * perPx);
  });

  const endDrag = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    container.querySelector('#xtm_monitor_knob')?.classList.remove('is-turning');
    sync();
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  container.addEventListener('wheel', (e: WheelEvent) => {
    if (!knobOf(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY === 0) return;
    turnTo(host.level() + (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 0.01 : 0.02));
  }, { passive: false });

  container.addEventListener('dblclick', (e: MouseEvent) => {
    if (!knobOf(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    turnTo(host.defaultLevel);
  });

  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!knobOf(e.target)) return;
    const v = host.level();
    const step = e.shiftKey ? 0.01 : 0.02;
    let next: number | null = null;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = v + step;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = v - step;
    else if (e.key === 'PageUp') next = v + 0.1;
    else if (e.key === 'PageDown') next = v - 0.1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 1;
    else if (e.key === 'Enter' || e.key === ' ') next = host.defaultLevel;
    if (next === null) return;
    // keep the panel's global ▲/▼ shortcuts off while the knob has focus
    e.preventDefault();
    e.stopPropagation();
    turnTo(next);
  });

  host.subscribe?.(sync);
  // The router has no event for every TAP flip and the view may rebuild its SVG: a cheap poll catches both
  setInterval(sync, 1000);
  sync();
  return { sync };
}
