/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * POD-22 direct DOM layer: element cache binding and changed-segment-only
 * attribute mutation (zero teardown per frame).
 */

import type { LitMap } from './ballistics';
import { LED_OFF_FILL } from './colors';

export type SegCache<T> = [Record<number, T>, Record<number, T>];

export interface Pod22DomCache {
  ledEls: SegCache<SVGElement | null>;
  glowEls: SegCache<SVGElement | null>;
  lastLit: SegCache<boolean | null>;
}

/* ---------------- Fast Direct DOM Binding ---------------- */
export function bindPod22Dom(container: HTMLElement, cache: Pod22DomCache, minP: number, maxP: number): void {
  cache.ledEls = [{}, {}];
  cache.glowEls = [{}, {}];
  cache.lastLit = [{}, {}];
  for (let row = 0; row < 2; row++) {
    for (let p = minP; p <= maxP; p++) {
      const rowLed = cache.ledEls[row];
      const rowGlow = cache.glowEls[row];
      const rowLast = cache.lastLit[row];
      if (rowLed && rowGlow && rowLast) {
        rowLed[p] = container.querySelector<SVGElement>(`#pod_led_${row}_${p}`);
        rowGlow[p] = container.querySelector<SVGElement>(`#pod_core_${row}_${p}`);
        rowLast[p] = null;
      }
    }
  }
}

/** Direct DOM property mutation only on changed segments (Zero teardown). */
export function applyLit(
  cache: Pod22DomCache,
  lit: LitMap,
  minP: number,
  maxP: number,
  colorOf: (p: number) => string
): void {
  for (let row = 0; row < 2; row++) {
    const rowLit = lit[row];
    const rowLast = cache.lastLit[row];
    const rowLed = cache.ledEls[row];
    const rowGlow = cache.glowEls[row];
    if (!rowLit || !rowLast || !rowLed || !rowGlow) continue;

    for (let p = minP; p <= maxP; p++) {
      const isLit = rowLit[p] ?? false;
      if (rowLast[p] !== isLit) {
        rowLast[p] = isLit;
        const led = rowLed[p];
        const core = rowGlow[p];
        if (!led) continue;

        if (isLit) {
          led.setAttribute('fill', colorOf(p));
          led.setAttribute('opacity', '0.88');
          led.setAttribute('filter', 'url(#smokyglow)');
          if (core) core.setAttribute('opacity', '0.24');
        } else {
          led.setAttribute('fill', LED_OFF_FILL);
          led.setAttribute('opacity', '0.15');
          led.removeAttribute('filter');
          if (core) core.setAttribute('opacity', '0');
        }
      }
    }
  }
}
