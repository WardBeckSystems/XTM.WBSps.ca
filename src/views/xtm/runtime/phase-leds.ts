/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Per-frame phase correlation LED paint (WBS round lamps or McCurdy red segments). */
import { wbsPhaseColors } from '../skins/wbs/phase-leds';
import { MC_PHASE_ON, MC_PHASE_OFF } from '../skins/mccurdy/phase-window';

/** Change-detection key: lit position, offset by skin */
export function phaseLedKey(led: number, mc: boolean): number {
  return led + (mc ? 100 : 0);
}

export function paintPhaseLeds(els: (SVGElement | null)[], led: number, on: boolean, mc: boolean): void {
  for (let i = 0; i < 8; i++) {
    const el = els[i];
    if (!el) continue;
    const isLit = on && i === led;
    const wbs = wbsPhaseColors(i);
    const litColor = mc ? MC_PHASE_ON : wbs.lit;
    const offColor = mc ? MC_PHASE_OFF : wbs.off;
    el.setAttribute('fill', isLit ? litColor : offColor);
    if (isLit) el.setAttribute('filter', 'url(#xledglow)');
    else el.removeAttribute('filter');
  }
}
