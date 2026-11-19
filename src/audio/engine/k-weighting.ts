/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * ITU-R BS.1770 K-weighting pre-filter: stage 1 high shelf + stage 2 RLB high pass.
 */

import type { XtmAudioEngine } from '../audio-engine';
import type { BiquadState } from './types';

/** ITU-R BS.1770 K-Weighting Filter Coefficients */
export function computeKWeightingCoefficients(engine: XtmAudioEngine, fs: number): void {
  const dbK = 3.9998438;
  const f0_shelf = 1681.9744509555319;
  const G = Math.pow(10, dbK / 20);
  const K_shelf = Math.tan(Math.PI * f0_shelf / fs);
  const K2_shelf = K_shelf * K_shelf;
  const sqrt2 = Math.SQRT2;
  const a0_s = 1 + sqrt2 * K_shelf + K2_shelf;
  engine.kShelf_b0 = (G + sqrt2 * Math.sqrt(G) * K_shelf + K2_shelf) / a0_s;
  engine.kShelf_b1 = 2 * (K2_shelf - G) / a0_s;
  engine.kShelf_b2 = (G - sqrt2 * Math.sqrt(G) * K_shelf + K2_shelf) / a0_s;
  engine.kShelf_a1 = 2 * (K2_shelf - 1) / a0_s;
  engine.kShelf_a2 = (1 - sqrt2 * K_shelf + K2_shelf) / a0_s;

  const f0_hp = 38.13547087602444;
  const Q_hp = 0.5003270373238773;
  const K_hp = Math.tan(Math.PI * f0_hp / fs);
  const K2_hp = K_hp * K_hp;
  const a0_hp = 1 + (K_hp / Q_hp) + K2_hp;
  engine.kHp_b0 = 1.0 / a0_hp;
  engine.kHp_b1 = -2.0 / a0_hp;
  engine.kHp_b2 = 1.0 / a0_hp;
  engine.kHp_a1 = 2 * (K2_hp - 1) / a0_hp;
  engine.kHp_a2 = (1 - (K_hp / Q_hp) + K2_hp) / a0_hp;
}

/** K-weighting Stage 1: High shelf */
export function kShelfStep(engine: XtmAudioEngine, s: BiquadState, x: number): number {
  const y = engine.kShelf_b0 * x + engine.kShelf_b1 * s.x1 + engine.kShelf_b2 * s.x2 - engine.kShelf_a1 * s.y1 - engine.kShelf_a2 * s.y2;
  s.x2 = s.x1; s.x1 = x;
  s.y2 = s.y1; s.y1 = y;
  return y;
}

/** K-weighting Stage 2: High pass (RLB) */
export function kHighPassStep(engine: XtmAudioEngine, s: BiquadState, x: number): number {
  const y = engine.kHp_b0 * x + engine.kHp_b1 * s.x1 + engine.kHp_b2 * s.x2 - engine.kHp_a1 * s.y1 - engine.kHp_a2 * s.y2;
  s.x2 = s.x1; s.x1 = x;
  s.y2 = s.y1; s.y1 = y;
  return y;
}
