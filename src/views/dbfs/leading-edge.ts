/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';

/* Per-frame overlays at full frame rate: cursor trace hairline and the leading-edge dots. */

/** Cursor Trace Hairline (Requirement 5). */
export function drawCursorTrace(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout): void {
  const { dpr, padL, padT, plotW, plotH } = L;
  if (v.showCursorTrace && v.hoverX !== null && v.hoverX >= padL && v.hoverX <= padL + plotW) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1 * dpr;
    ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.beginPath();
    ctx.moveTo(v.hoverX, padT);
    ctx.lineTo(v.hoverX, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string): void {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Leading Edge Instantaneous Indicators. */
export function drawLeadingDots(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout): void {
  const { dpr, bufLen, dbToY } = L;
  const curX = L.maxX;
  const lastHeadIdx = (v.head - 1 + bufLen) % bufLen;
  const curYL = dbToY(v.histL[lastHeadIdx]);
  const curYR = dbToY(v.histR[lastHeadIdx]);
  const curYM = dbToY(v.histLufsM[lastHeadIdx]);

  // Ch B Peak Dot
  if (v.showChB) dot(ctx, curX, curYR, 3.2 * dpr, v.PAL.lineR);
  // Ch A Peak Dot (White)
  if (v.showChA) dot(ctx, curX, curYL, 3.2 * dpr, v.PAL.lineL);
  // Left + Right Sum Dot (Forest Green)
  if (v.showSum) dot(ctx, curX, dbToY(v.histSum[lastHeadIdx]), 3.5 * dpr, v.PAL.lineSum);
  // L + (-R) Difference Dot (Cyan)
  if (v.showDiff) dot(ctx, curX, dbToY(v.histDiff[lastHeadIdx]), 3.5 * dpr, v.PAL.lineDiff);

  // Loudness Leading Halo & Dot
  if (v.showLufs) {
    dot(ctx, curX, curYM, 7 * dpr, 'rgba(244, 144, 44, 0.35)');
    dot(ctx, curX, curYM, 4.2 * dpr, v.PAL.lineLufs);
    dot(ctx, curX, curYM, 1.8 * dpr, '#ffffff');
  }

  // S (3.0s) Loudness Leading Dot (Purple)
  if (v.showLufsS) dot(ctx, curX, dbToY(v.histLufsS[lastHeadIdx]), 3.8 * dpr, v.PAL.textLufsS);
  // INTEG (I) Loudness Leading Dot (Mint Green)
  if (v.showLufsI) dot(ctx, curX, dbToY(v.histLufsI[lastHeadIdx]), 3.8 * dpr, v.PAL.textInteg);
}
