/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import { type TraceWindow, kAtX } from './trace-window';
import { pyrSample } from './pyramid';

/* Phase over time: its own scale band layered over the bottom of the dBFS range (-46 .. -60 dBFS).
   Same convention as the front-panel phase LEDs (in phase lights the 180 deg end):
   in phase (r = +1) at the top = 180, 90 in the middle, out of phase (r = -1) at the bottom = 0. */

export function drawPhasePlot(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout, win: TraceWindow, mc: boolean): void {
  const { dpr, padL, plotW, maxX, bufLen, dbToY } = L;
  const { minX, targetSamples, startIdx } = win;
  const yTop = dbToY(-46), yBot = dbToY(-60);   // half-height band at the bottom
  const degToY = (deg: number) => yBot - (deg / 180) * (yBot - yTop);
  const phaseCol = 'rgba(168, 85, 247, 0.85)';

  // Band, guide lines and scale
  ctx.save();
  ctx.fillStyle = mc ? 'rgba(168, 85, 247, 0.06)' : 'rgba(168, 85, 247, 0.05)';
  ctx.fillRect(padL, yTop, plotW, yBot - yTop);
  ctx.setLineDash([3 * dpr, 4 * dpr]);
  ctx.lineWidth = 1 * dpr;
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
  for (const d of [0, 90, 180]) {
    const y = Math.round(degToY(d)) + 0.5;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.font = `bold ${Math.round(10 * dpr)}px ui-monospace, "SF Mono", monospace`;
  ctx.textAlign = 'right';
  ctx.fillStyle = phaseCol;
  const xr = padL + plotW - 4 * dpr;
  ctx.textBaseline = 'top';    ctx.fillText('180° PHASE', xr, yTop + 2 * dpr);
  ctx.textBaseline = 'middle'; ctx.fillText('90°', xr, degToY(90));
  ctx.textBaseline = 'bottom'; ctx.fillText('0°', xr, yBot - 2 * dpr);
  ctx.restore();

  // Trace (smoothed like the level lines when the history is squeezed)
  const kAt = (x: number): number => kAtX(v, L, win, x)[0];
  const absBase = v.absCount - targetSamples;
  const usePyr = v.pyr.has(v.histPhase) && v.pyrFor === v.histL;
  ctx.beginPath();
  const numCols = maxX - minX;
  for (let c = 0; c <= numCols; c++) {
    const px = maxX - c;
    const k = kAt(px);
    const spp = kAt(px + 0.5) - kAt(px - 0.5);
    let r: number;
    if (usePyr && spp > 1.5) {
      const pos = 1 - Math.max(0, Math.min(1, (px - padL) / plotW));
      r = pyrSample(v, v.histPhase, absBase + k, spp, pos, true);
    } else {
      const k0 = Math.floor(k), k1 = Math.min(targetSamples - 1, k0 + 1), f = k - k0;
      r = v.histPhase[(startIdx + k0) % bufLen]! * (1 - f) + v.histPhase[(startIdx + k1) % bufLen]! * f;
    }
    const deg = 180 - Math.acos(Math.max(-1, Math.min(1, r))) * 180 / Math.PI;
    const y = degToY(deg);
    if (c === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
  }
  ctx.strokeStyle = phaseCol;
  ctx.lineWidth = 1.4 * dpr;
  ctx.stroke();
}
