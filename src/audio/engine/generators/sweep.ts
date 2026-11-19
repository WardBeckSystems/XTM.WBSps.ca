/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Logarithmic 20 Hz - 20 kHz sine sweep (8 s), repeated every 9 s.
 */

import type { XtmAudioEngine } from '../../audio-engine';

const SWEEP_START_HZ = 20;
const SWEEP_END_HZ = 20000;
const SWEEP_SECONDS = 8;
const SWEEP_REPEAT_MS = 9000;

function scheduleSweep(osc: OscillatorNode, ctx: AudioContext): void {
  osc.frequency.setValueAtTime(SWEEP_START_HZ, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(SWEEP_END_HZ, ctx.currentTime + SWEEP_SECONDS);
}

export function startSweep(engine: XtmAudioEngine, ctx: AudioContext, dest: AudioNode): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  scheduleSweep(osc, ctx);
  osc.connect(dest);
  osc.start();
  engine.testOsc = osc;

  // Repeat sweep every 9s
  engine.sweepTimer = setInterval(() => {
    if (engine.sourceType === 'test' && engine.testType === 'sweep' && engine.testOsc) {
      try {
        const o = engine.testOsc as OscillatorNode;
        o.frequency.cancelScheduledValues(ctx.currentTime);
        scheduleSweep(o, ctx);
      } catch (_) {}
    }
  }, SWEEP_REPEAT_MS);
  return osc;
}
