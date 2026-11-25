/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';

/* Lime line interactive scroll-zoom badge / hint (floats over the graph). */

function drawBadge(ctx: CanvasRenderingContext2D, text: string, bX: number, bY: number, bW: number, bH: number,
                   fill: string, stroke: string, lineW: number, textCol: string): void {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineW;
  ctx.beginPath();
  ctx.rect(bX, bY, bW, bH);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = textCol;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bX + bW / 2, bY + bH / 2);
}

export function drawZoomOverlay(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout): void {
  const { dpr, padL, plotW, limeY } = L;
  if (v.zoomFeedbackTime && (performance.now() - v.zoomFeedbackTime < 1900)) {
    const elapsed = performance.now() - v.zoomFeedbackTime;
    const alpha = Math.max(0, Math.min(1, 1 - (elapsed - 1100) / 800));
    ctx.save();
    ctx.globalAlpha = alpha;
    const bText = v.zoomFeedbackText || `ZOOM: ${v.formatDuration(v.captureLength)}`;
    ctx.font = `bold ${Math.round(11 * dpr)}px ui-monospace, "SF Mono", monospace`;
    const txtW = ctx.measureText(bText).width;
    const bW = txtW + 20 * dpr;
    const bH = 22 * dpr;
    const bX = Math.round(padL + (plotW - bW) / 2);
    const bY = Math.round(limeY - bH / 2);
    drawBadge(ctx, bText, bX, bY, bW, bH, 'rgba(11, 15, 23, 0.94)', '#22c55e', 1.5 * dpr, '#4ade80');
    ctx.restore();
  } else if (v.isHoveringLime) {
    ctx.save();
    const hintText = `↕ SCROLL TO ZOOM TIME (${v.formatDuration(v.captureLength)})`;
    ctx.font = `bold ${Math.round(9.5 * dpr)}px ui-monospace, "SF Mono", monospace`;
    const txtW = ctx.measureText(hintText).width;
    const bW = txtW + 16 * dpr;
    const bH = 18 * dpr;
    const bX = Math.round(padL + plotW - bW - 10 * dpr);
    const bY = Math.round(limeY - bH / 2);
    drawBadge(ctx, hintText, bX, bY, bW, bH, 'rgba(11, 15, 23, 0.88)', 'rgba(34, 197, 94, 0.6)', 1 * dpr, '#86efac');
    ctx.restore();
  }
}
