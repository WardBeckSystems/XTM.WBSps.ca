/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { XtmModel } from '../../models/xtm-model';
import type { MeterFrameTelemetry } from '../../types/telemetry';
import { extractLiveLevels, trackSignal } from './live-levels';
import { computeLayout } from './layout';
import { drawGraph } from './graph';
import { drawZoomOverlay } from './zoom-overlay';
import { drawCursorTrace, drawLeadingDots } from './leading-edge';
import { drawMinuteMarkers } from './minute-markers';
import { drawNtpDots } from './ntp-dots';
import { updateHudReadout, drawSignalLossWarning } from './hud-readout';
import { drawSampleScope } from './sample-scope';

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

  // Graph and leading indicators update synchronously every frame for rock-solid stability and zero flicker.
  v.renderFrameCount = (v.renderFrameCount || 0) + 1;
  const shouldUpdateGraph = true;

  const L = computeLayout(v);

  // SAMPLES: individual audio samples instead of the level history
  if (v.timeMode === 'samples') {
    drawSampleScope(v, L);
    updateHudReadout(v, live, L.bufLen);
    return;
  }

  if (shouldUpdateGraph && !drawGraph(v, L)) return;

  // Blit pre-rendered graph from offscreen canvas at 1/2 frame rate
  if (!v.ctx || !v.graphCanvas) return;
  v.ctx.drawImage(v.graphCanvas, 0, 0);
  const ctx = v.ctx;

  drawMinuteMarkers(v, ctx, L, Date.now());
  drawZoomOverlay(v, ctx, L);
  drawCursorTrace(v, ctx, L);
  drawLeadingDots(v, ctx, L);
  drawNtpDots(v, ctx, L, Date.now());
  // Note: Canvas color key legend removed per user request (colors are on the hover HUD)
  updateHudReadout(v, live, L.bufLen);
  drawSignalLossWarning(v, ctx, L, now);
}
