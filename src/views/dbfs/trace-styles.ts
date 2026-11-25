/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';

/* Stroke / fill styles per peak trace: solid palette colours, or left-edge fade gradients (Req 14). */

type Paint = string | CanvasGradient;

export interface TraceStyles {
  strokeA: Paint; fillA: Paint;
  strokeB: Paint; fillB: Paint;
  strokeSum: Paint; fillSum: Paint;
  strokeDiff: Paint; fillDiff: Paint;
  fillLufs: string;
  doFade: boolean;
}

function fadeGrad(ctx: CanvasRenderingContext2D, x0: number, x1: number, rgb: string, alpha: string): CanvasGradient {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, `rgba(${rgb}, 0)`);
  g.addColorStop(1, `rgba(${rgb}, ${alpha})`);
  return g;
}

export function computeTraceStyles(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout): TraceStyles {
  // Dynamic Fade Distance (Requirement 14):
  // If fade is shut off or slider is 100%, show everything without any fading
  const doFade = v.enableFade && (v.hfFadeDistance < 100);
  const fillLufs = v.PAL.fillLufs;

  if (doFade) {
    const fadeDistancePct = Math.max(10, Math.min(95, v.hfFadeDistance || 50));
    const fadeFrac = fadeDistancePct / 100;
    const xFade0 = Math.round(L.padL + L.plotW * (1 - fadeFrac));
    const xFade1 = Math.round(L.padL + L.plotW * (1 - fadeFrac * 0.5));
    return {
      strokeA: fadeGrad(ctx, xFade0, xFade1, '255, 255, 255', '1'),
      fillA: fadeGrad(ctx, xFade0, xFade1, '255, 255, 255', '0.08'),
      strokeB: fadeGrad(ctx, xFade0, xFade1, '239, 68, 68', '1'),
      fillB: fadeGrad(ctx, xFade0, xFade1, '239, 68, 68', '0.08'),
      strokeSum: fadeGrad(ctx, xFade0, xFade1, '34, 197, 94', '1'),
      fillSum: fadeGrad(ctx, xFade0, xFade1, '34, 197, 94', '0.09'),
      strokeDiff: fadeGrad(ctx, xFade0, xFade1, '6, 182, 212', '1'),
      fillDiff: fadeGrad(ctx, xFade0, xFade1, '6, 182, 212', '0.08'),
      fillLufs,
      doFade
    };
  }

  // 100% Full View / Fade Shut-off - Solid colors across entire display
  return {
    strokeA: v.PAL.lineL, fillA: v.PAL.fillL,
    strokeB: v.PAL.lineR, fillB: v.PAL.fillR,
    strokeSum: v.PAL.lineSum, fillSum: v.PAL.fillSum,
    strokeDiff: v.PAL.lineDiff, fillDiff: v.PAL.fillDiff,
    fillLufs,
    doFade
  };
}
