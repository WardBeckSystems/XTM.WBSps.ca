/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import { applyThemePalette } from './palette';
import { activeGridDbs } from './grid-levels';
import { drawTimeAxis } from './time-axis';
import { computeTraceWindow } from './trace-window';
import { computeTraceStyles } from './trace-styles';
import { drawTraces } from './traces';
import { drawPhasePlot } from './phase-plot';
import { drawLoudnessZone, drawReferenceLines } from './reference-lines';

/* Offscreen graph layer (redrawn at ~1/2 frame rate): background, time axis, traces, phase, grid. */

/** Returns false when there is no graph context (render must stop, as before). */
export function drawGraph(v: DbfsView, L: ScopeLayout): boolean {
  const ctx = v.graphCtx;
  if (!ctx) return false;
  v.graphDirty = false;

  // Palette follows the page mode (McCurdy = cream paper)
  const mc = applyThemePalette(v);

  // Clear canvas before drawing (enables translucent / transparent scope background over hammered chassis)
  ctx.clearRect(0, 0, L.W, L.H);
  if (v.PAL.bg && v.PAL.bg !== 'transparent') {
    ctx.fillStyle = v.PAL.bg;
    ctx.fillRect(0, 0, L.W, L.H);
  }

  const grid = activeGridDbs(v);

  // Active time scale span
  const capSec = v.getActiveSpanSec();
  const beta = v.beta || (v.timeMode === 'super_log' ? 60 : 15);
  const logBetaDenom = v.logBetaDenom || Math.log(1 + beta);

  drawTimeAxis(v, ctx, L, capSec, beta, logBetaDenom);

  // ── Calculate Visible Rolling Sample Range ──
  const win = computeTraceWindow(v, L, capSec, beta, logBetaDenom);
  if (win) {
    const styles = computeTraceStyles(v, ctx, L);
    drawTraces(v, ctx, L, win, styles, mc);
    if (v.plotPhase && win.minX < L.maxX) drawPhasePlot(v, ctx, L, win, mc);
  }

  drawLoudnessZone(ctx, L, mc);
  drawReferenceLines(v, ctx, L, grid, mc);
  return true;
}
