/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/* Raw-sample tap for the SAMPLES time scale: two AnalyserNodes hung off the engine's
 * high-pass node (post trim + HPF, the same point the meters read). Created lazily the
 * first time SAMPLES is shown and re-attached if the audio context changes. */

export const TAP_SIZE = 2048;

interface Tap {
  ctx: AudioContext;
  src: AudioNode;
  aL: AnalyserNode;
  aR: AnalyserNode;
  bufL: Float32Array;
  bufR: Float32Array;
}

let tap: Tap | null = null;

/** Latest TAP_SIZE samples per channel, or null when no audio graph is running. */
export function readSampleTap(engine: any): { l: Float32Array; r: Float32Array; rate: number } | null {
  const ctx: AudioContext | null = engine?.ctx || null;
  const src: AudioNode | null = engine?.hpfNode || null;
  if (!ctx || !src) return null;

  if (!tap || tap.ctx !== ctx || tap.src !== src) {
    try {
      const split = ctx.createChannelSplitter(2);
      const aL = ctx.createAnalyser();
      const aR = ctx.createAnalyser();
      aL.fftSize = TAP_SIZE;
      aR.fftSize = TAP_SIZE;
      src.connect(split);
      split.connect(aL, 0);
      split.connect(aR, 1);
      tap = { ctx, src, aL, aR, bufL: new Float32Array(TAP_SIZE), bufR: new Float32Array(TAP_SIZE) };
    } catch {
      return null;
    }
  }
  tap.aL.getFloatTimeDomainData(tap.bufL as any);
  tap.aR.getFloatTimeDomainData(tap.bufR as any);
  return { l: tap.bufL, r: tap.bufR, rate: ctx.sampleRate };
}
