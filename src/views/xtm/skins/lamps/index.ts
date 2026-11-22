/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * VU dial lamp registry (dialLamp): amber, amber_bottom, tungsten, golden,
 * parchment, white, warm_white, green_glow, dark_night, unlit.
 * Gradient defs are emitted once in the shell <defs>; faces reference them by id.
 */
import type { LampVariant } from './lamp-types';
import { AMBER_LAMP, AMBER_BOTTOM_LAMP } from './amber';
import { WHITE_LAMP, WARM_WHITE_LAMP } from './white';
import { PARCHMENT_LAMP } from './parchment';
import { TUNGSTEN_LAMP, GOLDEN_LAMP } from './tungsten';
import {
  GREEN_GLOW_LAMP,
  DARK_NIGHT_LAMP,
  UNLIT_LAMP,
  DUAL_BOTTOM_LAMP_GRADIENTS,
  DIAL_BG_GRADIENTS
} from './extra-lamps';

export type { LampVariant } from './lamp-types';
export {
  AMBER_LAMP,
  AMBER_BOTTOM_LAMP,
  WHITE_LAMP,
  WARM_WHITE_LAMP,
  PARCHMENT_LAMP,
  TUNGSTEN_LAMP,
  GOLDEN_LAMP,
  GREEN_GLOW_LAMP,
  DARK_NIGHT_LAMP,
  UNLIT_LAMP,
  DUAL_BOTTOM_LAMP_GRADIENTS,
  DIAL_BG_GRADIENTS
};

/** Warm incandescent filament halo drawn behind non-white VU scales (top/center) */
export const INCAND_BLOOM_GRADIENT = `<radialGradient id="xincand_bloom" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff8db" stop-opacity="0.55"/>
          <stop offset="35%" stop-color="#fed766" stop-opacity="0.32"/>
          <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>`;

/** Lamp registry map */
const ALL_LAMPS: Record<string, LampVariant> = {
  amber: AMBER_LAMP,
  amber_bottom: AMBER_BOTTOM_LAMP,
  tungsten: TUNGSTEN_LAMP,
  golden: GOLDEN_LAMP,
  parchment: PARCHMENT_LAMP,
  white: WHITE_LAMP,
  warm_white: WARM_WHITE_LAMP,
  green_glow: GREEN_GLOW_LAMP,
  dark_night: DARK_NIGHT_LAMP,
  unlit: UNLIT_LAMP
};

/** Lamp for a dialLamp value (unknown values fill with amber) */
export function lampVariant(dialLamp: string): LampVariant {
  return ALL_LAMPS[dialLamp] ?? AMBER_LAMP;
}

/** Powered VU face fill for the lamp colour */
export function lampFill(dialLamp: string): string {
  return `url(#${lampVariant(dialLamp).gradientId})`;
}

/**
 * Whether the lamp gets the incandescent bloom ellipse.
 */
export function lampHasBloom(dialLamp: string): boolean {
  return lampVariant(dialLamp).bloom;
}

/** Bloom position: 'top' or 'bottom' */
export function lampBloomPos(dialLamp: string): 'top' | 'bottom' {
  return lampVariant(dialLamp).bloomPos ?? 'top';
}
