/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import { type TraceWindow, kAtX } from './trace-window';
import { pyrSample } from './pyramid';

/* One history trace drawn per fixed pixel column (no vertex drift), optional fill to the floor. */

export function drawCurve(
  v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout, win: TraceWindow,
  hist: Float32Array, strokeCol: string | CanvasGradient | null, fillCol: string | CanvasGradient | null,
  lineW: number, doFill: boolean = true, _fadeChannels: boolean = false, histNorm: Float32Array | null = null
): void {
  const { dpr, padL, padT, plotW, plotH, maxX, bufLen, dbToY } = L;
  const { minX, targetSamples, startIdx, capSec } = win;
  ctx.beginPath();
  if (minX >= maxX) return;

  const numCols = maxX - minX;

  // Fixed pixel-column rendering with continuous sub-sample linear interpolation.
  // Guarantees zero horizontal vertex drift, zero decimation aliasing, and 100% rock-solid stability.
  const absBase = v.absCount - targetSamples; // absolute index of k = 0
  const levelsReady = v.pyr.has(hist) && v.pyrFor === v.histL;

  for (let c = 0; c <= numCols; c++) {
    const px = maxX - c;
    const [kClamped, u] = kAtX(v, L, win, px);
    // Column covers [px - 0.5, px + 0.5] on screen -> [kLo, kHi] in samples
    const kLo = kAtX(v, L, win, px - 0.5)[0];
    const kHi = kAtX(v, L, win, px + 0.5)[0];
    const spp = kHi - kLo;                         // samples per pixel at this column
    const compressed = levelsReady && spp > 1.5;
    const posX = 1 - Math.max(0, Math.min(1, (px - padL) / plotW)); // 0 = right/newest, 1 = left/oldest
    const aMid = absBase + kClamped;

    const k0 = Math.floor(kClamped);
    const k1 = Math.min(targetSamples - 1, k0 + 1);
    const frac = kClamped - k0;
    const idx0 = (startIdx + k0) % bufLen;
    const idx1 = (startIdx + k1) % bufLen;

    // Compressed columns: whole-slice max from fixed absolute blocks (no shimmer).
    // Uncompressed columns (<= 2 samples/px): sub-sample interpolation as before.
    let val = compressed
      ? pyrSample(v, hist, aMid, spp, posX)
      : hist[idx0] * (1 - frac) + hist[idx1] * frac;
    const normAt = (hn: Float32Array): number => compressed && v.pyr.has(hn)
      ? pyrSample(v, hn, aMid, spp, posX)
      : hn[idx0] * (1 - frac) + hn[idx1] * frac;

    if (histNorm) {
      if (win.warped) {
        // Log & Super-Log Mode:
        // Uncompressed right zone (u <= 0.05, recent audio): 100% instantaneous transient peaks.
        // As signal compresses to the left (u > 0.05): Smoothstep blend into the 400ms time-normalized stream.
        if (u > 0.05) {
          const b = Math.min(1.0, (u - 0.05) / 0.35);
          const smoothB = b * b * (3 - 2 * b);
          const normVal = normAt(histNorm);
          val = val * (1 - smoothB) + normVal * smoothB;
        }
      } else {
        // Linear Mode:
        // For long durations (10m - 60m), blend into normalized stream if samples exceed screen pixels.
        const samplesPerPx = (capSec * v.captureSpeed) / plotW;
        if (samplesPerPx > 4) {
          const b = Math.min(1.0, (samplesPerPx - 4) / 8);
          const normVal = normAt(histNorm);
          val = val * (1 - b) + normVal * b;
        }
      }
    }

    if (c === 0) {
      ctx.moveTo(px, dbToY(val));
    } else {
      ctx.lineTo(px, dbToY(val));
    }
  }

  if (strokeCol) {
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = lineW * dpr;
    ctx.stroke();
  }

  if (doFill && fillCol) {
    const bottomY = padT + plotH;
    ctx.lineTo(minX, bottomY);
    ctx.lineTo(maxX, bottomY);
    ctx.closePath();
    ctx.fillStyle = fillCol;
    ctx.fill();
  }
}
