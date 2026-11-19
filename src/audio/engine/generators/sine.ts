/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Fixed-frequency sine test tones (1 kHz and 400 Hz alignment tones).
 */

export function startSineTone(ctx: AudioContext, dest: AudioNode, freqHz: number): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqHz, ctx.currentTime);
  osc.connect(dest);
  osc.start();
  return osc;
}
