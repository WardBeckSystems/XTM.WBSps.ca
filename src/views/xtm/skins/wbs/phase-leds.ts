/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Phase correlation LED row (8 lamps, 0 deg .. 180 deg). Each position carries both
 * the WBS round lamp (xphase_led_N, wbs-only) and the McCurdy rectangular segment
 * (xphase_ledr_N, mc-only), so the skin can switch by CSS alone.
 */
import { PHASE_LED } from '../../layout/wbs-layout';

/** WBS lamp colours by position: red (0-1), amber (2-3), green (4-7) */
export function wbsPhaseColors(i: number): { lit: string; off: string } {
  return {
    lit: i <= 1 ? '#ff4d36' : (i <= 3 ? '#ffb43a' : '#9dff3a'),
    off: i <= 1 ? '#3a1810' : (i <= 3 ? '#3a2810' : '#142e17')
  };
}

export function renderPhaseLedRow(): string {
  let ps = '';
  for (let i = 0; i < PHASE_LED.count; i++) {
    const cx = PHASE_LED.x0 + i * PHASE_LED.pitch;
    const cy = PHASE_LED.cy;
    ps += `
              <circle class="wbs-only" cx="${cx}" cy="${cy}" r="22" fill="#08090a" stroke="#25282f" stroke-width="2"/>
              <circle class="wbs-only" id="xphase_led_${i}" cx="${cx}" cy="${cy}" r="17" fill="#142e17"/>`;
  }
  return ps;
}
