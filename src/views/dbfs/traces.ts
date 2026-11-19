/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import type { TraceWindow } from './trace-window';
import type { TraceStyles } from './trace-styles';
import { drawCurve } from './draw-curve';

/* Level and loudness traces in back-to-front order. */

export function drawTraces(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout, win: TraceWindow, s: TraceStyles, mc: boolean): void {
  const dpr = L.dpr;
  const curve = (hist: Float32Array, stroke: string | CanvasGradient | null, fill: string | CanvasGradient | null,
                 lineW: number, doFill: boolean = true, fade: boolean = false, histNorm: Float32Array | null = null) =>
    drawCurve(v, ctx, L, win, hist, stroke, fill, lineW, doFill, fade, histNorm);

  // 1. Channel B (Right Peak - Red)
  if (v.showChB) {
    curve(v.histR, s.strokeB, s.fillB, 1.5, true, s.doFade, v.histNormR);
  }

  // 2. Channel A (Left Peak - White)
  if (v.showChA) {
    curve(v.histL, s.strokeA, s.fillA, 1.5, true, s.doFade, v.histNormL);
  }

  // 3. Left + Right Mono Sum (Forest Green)
  if (v.showSum) {
    curve(v.histSum, s.strokeSum, s.fillSum, 1.8, true, s.doFade, v.histNormSum);
  }

  // 4. L + (-R) Difference / Side (Cyan)
  if (v.showDiff) {
    curve(v.histDiff, s.strokeDiff, s.fillDiff, 1.8, true, s.doFade, v.histNormDiff);
  }

  // 5. Perceived Loudness (Momentary LUFS - Orange Glow, NEVER FADES, EXACT)
  if (v.showLufs) {
    ctx.save();
    if (!mc) {
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12 * dpr;
    }
    // Ambient neon glow stroke (dark mode); McCurdy: just the fill, no halo
    curve(v.histLufsM, mc ? null : 'rgba(249, 115, 22, 0.45)', s.fillLufs, 5.0, true, false);
    // Sharp luminous core (100% solid edge-to-edge)
    curve(v.histLufsM, '#fb923c', null, 2.6, false, false);
    ctx.restore();
  }

  // 6. Short-Term Loudness S (3.0s - Purple #c084fc)
  if (v.showLufsS) {
    curve(v.histLufsS, v.PAL.textLufsS, null, 2.0, false, false);
  }

  // 7. Integrated Loudness I (Mint Green #34d399)
  if (v.showLufsI) {
    curve(v.histLufsI, v.PAL.textInteg, null, 2.0, false, false);
  }
}
