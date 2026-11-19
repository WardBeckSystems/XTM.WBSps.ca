/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * VU dial lamp palette (dialLamp): amber (default), white, parchment.
 * Gradient defs are emitted once in the shell <defs>; faces reference them by id.
 */

export type DialLamp = 'amber' | 'white' | 'parchment';

export const AMBER_GRADIENT = `<radialGradient id="xamber" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="18%" stop-color="#ffdf7a"/>
          <stop offset="42%" stop-color="#fbb024"/>
          <stop offset="68%" stop-color="#ea7a08"/>
          <stop offset="90%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#692802"/>
        </radialGradient>`;

export const WHITE_GRADIENT = `<radialGradient id="xwhite" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f8fafc"/>
          <stop offset="65%" stop-color="#e2e8f0"/>
          <stop offset="90%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>`;

export const PARCHMENT_GRADIENT = `<radialGradient id="xparchment" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fffdf5"/>
          <stop offset="22%" stop-color="#fef3d6"/>
          <stop offset="55%" stop-color="#f5e1ad"/>
          <stop offset="85%" stop-color="#d6b372"/>
          <stop offset="100%" stop-color="#8f692d"/>
        </radialGradient>`;

/** Warm incandescent filament halo drawn behind non-white VU scales */
export const INCAND_BLOOM_GRADIENT = `<radialGradient id="xincand_bloom" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff8db" stop-opacity="0.55"/>
          <stop offset="35%" stop-color="#fed766" stop-opacity="0.32"/>
          <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>`;

/** Powered VU face fill for the lamp colour (unknown values fall back to amber) */
export function lampFill(dialLamp: string): string {
  if (dialLamp === 'white') return 'url(#xwhite)';
  if (dialLamp === 'parchment') return 'url(#xparchment)';
  return 'url(#xamber)';
}

/** Whether the lamp gets the incandescent bloom ellipse */
export function lampHasBloom(dialLamp: string): boolean {
  return dialLamp !== 'white';
}
