/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * AudioContext bootstrap, AudioWorklet module loading and WASM DSP initialisation.
 */

import type { XtmAudioEngine } from '../audio-engine';
import { INLINE_WORKLET_CODE, WORKLET_MODULE_URLS } from './worklet-source';
import { calculateCoefficients } from './coefficients';

/**
 * Initializes or resumes the AudioContext
 */
export async function ensureContext(engine: XtmAudioEngine): Promise<AudioContext> {
  if (!engine.ctx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    engine.ctx = new AudioCtx({ latencyHint: 'interactive' });
  }
  // Return early if suspended so the caller can handle user gesture
  if (engine.ctx.state === 'suspended') {
    return engine.ctx;
  }

  calculateCoefficients(engine);
  await initWorklet(engine);
  await engine.wasmDsp.load();
  if (engine.ctx && engine.wasmDsp.ready) {
    engine.wasmDsp.init(engine.ctx.sampleRate, engine.refLevelDb, engine.peakSensTrim);
    // Re-apply the reference WITH its digital/analog flag. Without it a digital
    // -18 dBFS reference was re-read as analog dBu after every source change,
    // adding ~22 dB of gain and pinning the needles until SENS was touched.
    engine.wasmDsp.setRefLevel(engine.refLevelDb, engine.isRefDigital);
    engine.wasmDsp.setPeakTrim(engine.peakSensTrim);
  }
  return engine.ctx;
}

/**
 * Loads the AudioWorklet module for modern, low-latency audio-thread metering
 */
export async function initWorklet(engine: XtmAudioEngine): Promise<void> {
  if (engine.workletLoaded || !engine.ctx || !engine.ctx.audioWorklet) return;
  const [urlA, urlB, urlC] = WORKLET_MODULE_URLS;
  try {
    try {
      await engine.ctx.audioWorklet.addModule(urlA);
    } catch {
      try {
        await engine.ctx.audioWorklet.addModule(urlB);
      } catch {
        await engine.ctx.audioWorklet.addModule(urlC);
      }
    }
    engine.workletLoaded = true;
  } catch (_) {
    try {
      const blob = new Blob([INLINE_WORKLET_CODE], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      await engine.ctx.audioWorklet.addModule(blobUrl);
      URL.revokeObjectURL(blobUrl);
      engine.workletLoaded = true;
    } catch (err) {
      engine.workletLoaded = false;
    }
  }
}
