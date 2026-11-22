/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * VU meter movement ballistics (ANSI C16.5-1942 electromechanical 2nd-order ODE),
 * discretised with the bilinear transform. Simpson / Sifam movement styles and
 * presets from the VU ballistics library.
 */

import type { XtmAudioEngine } from '../../audio-engine';
import type { VuCoeffConfig, VuStateChannel } from '../types';
import { VU_BALLISTICS_LIBRARY } from '../../ballistics-library';

/** Fallback movement when the active style has no coefficients. */
export const DEFAULT_VU_MOVEMENT: VuCoeffConfig = { f0: 2.16, zeta: 0.815 };

/** VU scale factor precisely calibrated to 0.000 VU at -18 dBFS reference level */
export const VU_K_AVG = 8.8458296;

export function activeVuMovement(engine: XtmAudioEngine): VuCoeffConfig {
  return engine.vuCoeffs[engine.vuStyle] || { f0: DEFAULT_VU_MOVEMENT.f0, zeta: DEFAULT_VU_MOVEMENT.zeta };
}

/**
 * Calculates ballistic biquad coefficients for the VU movement
 */
export function computeVuCoefficients(engine: XtmAudioEngine, fs: number): void {
  const dt = 1.0 / fs;
  const K = 2.0 / dt;
  const cfg = activeVuMovement(engine);
  const w0 = 2.0 * Math.PI * cfg.f0;
  const a0 = K * K + 2.0 * cfg.zeta * w0 * K + w0 * w0;

  engine.vuB0 = (w0 * w0) / a0;
  engine.vuB1 = (2.0 * w0 * w0) / a0;
  engine.vuB2 = engine.vuB0;
  engine.vuA1 = (2.0 * (w0 * w0 - K * K)) / a0;
  engine.vuA2 = (K * K - 2.0 * cfg.zeta * w0 * K + w0 * w0) / a0;
}

/**
 * Advance one VU channel by one sample of rectified, calibrated input.
 */
export function vuStep(engine: XtmAudioEngine, st: VuStateChannel, vuIn: number): void {
  const yn = engine.vuB0 * vuIn + engine.vuB1 * st.x1 + engine.vuB2 * st.x2
              - engine.vuA1 * st.y1 - engine.vuA2 * st.y2;
  st.x2 = st.x1;
  st.x1 = vuIn;
  st.y2 = st.y1;
  st.y1 = yn;
  st.p = Math.max(-0.03, Math.min(1.15, yn));
}

/** Needle deflection fraction to VU dB (0.708 = 0 VU). */
export function vuDbOf(p: number): number {
  return p > 0.005 ? 20 * Math.log10(p) + 3 : -Infinity;
}

/**
 * Set VU Movement Style: 'simpson' (classic amber 300ms) or 'sifam' (crisp 200ms)
 */
export function setVuStyle(engine: XtmAudioEngine, style: 'simpson' | 'sifam' | string): void {
  if (style !== 'simpson' && style !== 'sifam') return;
  engine.vuStyle = style;
  engine.calculateCoefficients();
  const cfg = activeVuMovement(engine);
  if (engine.wasmDsp && engine.wasmDsp.ready) {
    engine.wasmDsp.setVuBallistics(cfg.f0, cfg.zeta);
  }
}

/**
 * Set VU Ballistics Preset (sourced from LikeDotAudio / APK.softapp.TEST.AUDIO.VuAnalog)
 */
export function setVuBallisticPreset(engine: XtmAudioEngine, presetKey: string): void {
  const preset = VU_BALLISTICS_LIBRARY[presetKey] || VU_BALLISTICS_LIBRARY.standard_vu;
  engine.vuBallisticPreset = preset.id;
  engine.vuCoeffs[engine.vuStyle] = { f0: preset.f0, zeta: preset.zeta };
  engine.calculateCoefficients();
  if (engine.wasmDsp && engine.wasmDsp.ready) {
    engine.wasmDsp.setVuBallistics(preset.f0, preset.zeta);
  }
}
