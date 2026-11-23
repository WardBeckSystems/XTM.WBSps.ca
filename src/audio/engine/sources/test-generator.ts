/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Built-in signal generator source for testing and calibration
 * ('sine1k', 'sine400', 'pink', 'sweep').
 */

import type { XtmAudioEngine } from '../../audio-engine';
import { startSineTone } from '../generators/sine';
import { startPinkNoise } from '../generators/pink-noise';
import { startSweep } from '../generators/sweep';
import { resumeAudio } from '../autoplay';

const isCalTone = (type: string): boolean => type === 'sine1k' || type === 'sine400';

export function startTestGenerator(engine: XtmAudioEngine, type = 'sine1k'): void {
  resumeAudio(engine.ctx);
  engine.stopCurrentSource();
  engine.sourceType = 'test';
  engine.testType = type;

  const ctx = engine.ctx;
  if (!ctx) return;
  engine.testGain = ctx.createGain();
  const gainVal = isCalTone(type) ? Math.pow(10, engine.toneCalDb / 20) : (type === 'pink' ? 0.35 : 0.5);
  engine.testGain.gain.value = gainVal;

  if (isCalTone(type)) {
    engine.testOsc = startSineTone(ctx, engine.testGain, type === 'sine1k' ? 1000 : 400);
  } else if (type === 'pink') {
    engine.testOsc = startPinkNoise(ctx, engine.testGain);
  } else if (type === 'sweep') {
    engine.testOsc = startSweep(engine, ctx, engine.testGain);
  }

  engine.setupAudioGraph(engine.testGain, true);
  if (engine.onStatusChange) engine.onStatusChange({ type: 'test', label: `Test Generator (${type})` });
}

/**
 * Set 1 kHz Test Tone Calibration Level (-24, -20, -18, -14, -12, -6, 0 dBFS)
 */
export function setToneCalibration(engine: XtmAudioEngine, calDb: number): void {
  engine.toneCalDb = calDb;
  if (engine.testGain && engine.ctx && isCalTone(engine.testType)) {
    const lin = Math.pow(10, calDb / 20);
    try {
      engine.testGain.gain.cancelScheduledValues(engine.ctx.currentTime);
      engine.testGain.gain.linearRampToValueAtTime(lin, engine.ctx.currentTime + 0.05);
    } catch (_) {
      engine.testGain.gain.value = lin;
    }
  }
}
