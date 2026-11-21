/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * VU dial lamp registry (dialLamp): amber (default), white, parchment.
 * Gradient defs are emitted once in the shell <defs>; faces reference them by id.
 */
import type { LampVariant } from './lamp-types';
import { AMBER_LAMP } from './amber';
import { WHITE_LAMP } from './white';
import { PARCHMENT_LAMP } from './parchment';

export type { LampVariant } from './lamp-types';
export { AMBER_LAMP, WHITE_LAMP, PARCHMENT_LAMP };

/** Warm incandescent filament halo drawn from the bottom rim behind non-white VU scales */
export const INCAND_BLOOM_GRADIENT = `<radialGradient id="xincand_bloom" cx="50%" cy="98%" r="85%">
          <stop offset="0%" stop-color="#fff8db" stop-opacity="0.68"/>
          <stop offset="28%" stop-color="#fed766" stop-opacity="0.42"/>
          <stop offset="65%" stop-color="#f59e0b" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>`;

/** Lamp for a dialLamp value (unknown values fill with amber) */
export function lampVariant(dialLamp: string): LampVariant {
  if (dialLamp === 'white') return WHITE_LAMP;
  if (dialLamp === 'parchment') return PARCHMENT_LAMP;
  return AMBER_LAMP;
}

/** Powered VU face fill for the lamp colour */
export function lampFill(dialLamp: string): string {
  return `url(#${lampVariant(dialLamp).gradientId})`;
}

/**
 * Whether the lamp gets the incandescent bloom ellipse. Any value other than
 * 'white' blooms (an unknown value keeps its own name in the bloom's class).
 */
export function lampHasBloom(dialLamp: string): boolean {
  return dialLamp !== 'white';
}
