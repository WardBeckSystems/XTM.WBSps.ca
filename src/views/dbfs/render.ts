/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { XtmModel } from '../../models/xtm-model';
import type { MeterFrameTelemetry } from '../../types/telemetry';
import { extractLiveLevels, trackSignal } from './live-levels';
import { computeLayout } from './layout';
import { drawGraph } from './graph';
import { drawZoomOverlay } from './zoom-overlay';
import { drawCursorTrace, drawLeadingDots } from './leading-edge';
import { updateHudReadout, drawSignalLossWarning } from './hud-readout';

/* Per-frame render: push the live sample, refresh the offscreen graph, blit, draw live overlays + HUD. */

export function renderFrame(v: DbfsView, _model: XtmModel, levels: MeterFrameTelemetry): void {
  if (!v.ctx || !v.w || !v.h) return;

  // Extract live levels
  const live = extractLiveLevels(levels);

  // Track signal presence for 10-second loss of signal warning
  const now = performance.now();
  trackSignal(v, levels, live, now);

  v.push(live.liveL, live.liveR, live.liveLufsM, live.liveLufsS, live.livePhase, live.liveSum, live.liveDiff, live.liveLufsI);

  const W = v.w;
  const H = v.h;
  if (!v.graphCanvas || v.graphCanvas.width !== W || v.graphCanvas.height !== H) {
    if (!v.graphCanvas) v.graphCanvas = document.createElement('canvas');
    v.graphCanvas.width = W;
    v.graphCanvas.height = H;
    v.graphCtx = v.graphCanvas.getContext('2d', { alpha: false });
    v.graphDirty = true;
  }

  if (v.isHoveringLime !== v._lastHoveringLime) {
    v.graphDirty = true;
    v._lastHoveringLime = v.isHoveringLime;
  }

  // Graph is drawn at 1/2 frame rate (~30 FPS) since it displays historical audio.
  // The leading dots on the right edge update at full 100% frame rate (60/120 FPS).
  v.renderFrameCount = (v.renderFrameCount || 0) + 1;
  const shouldUpdateGraph = v.graphDirty || (v.renderFrameCount % 2 === 0);

  const L = computeLayout(v);

  if (shouldUpdateGraph && !drawGraph(v, L)) return;

  // Blit pre-rendered graph from offscreen canvas at 1/2 frame rate
  if (!v.ctx || !v.graphCanvas) return;
  v.ctx.drawImage(v.graphCanvas, 0, 0);
  const ctx = v.ctx;

  drawZoomOverlay(v, ctx, L);
  drawCursorTrace(v, ctx, L);
  drawLeadingDots(v, ctx, L);
  // Note: Canvas color key legend removed per user request (colors are on the hover HUD)
  updateHudReadout(v, live, L.bufLen);
  drawSignalLossWarning(v, ctx, L, now);
}
