/* Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import { isWarpedMode } from './time-modes';
import { drawSparkle } from './ntp-dots';

/**
 * Draw vertical minute lines with sparkles of clocking along the dBFS Scope Graph Timeline.
 * At every minute boundary (:00 seconds), a vertical dashed hairline with animated sparkles
 * moves across the screen in perfect lockstep with the waveform, compressing on the log scale.
 */
export function drawMinuteMarkers(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout, nowMs: number): void {
  const { dpr, padL, padT, plotW, plotH, maxX } = L;
  const capSec = v.getActiveSpanSec();
  const beta = v.beta || (v.timeMode === 'super_log' ? 60 : 15);
  const logBetaDenom = v.logBetaDenom || Math.log(1 + beta);
  const warped = isWarpedMode(v.timeMode);

  const isMcCurdy = document.body.classList.contains('theme-mccurdy') ||
                    document.body.classList.contains('theme-mccurdy-light');

  // Maximum age of samples currently recorded in the ring buffer
  const maxRecordedAgeSec = (v.count > 0 && v.captureSpeed > 0) ? (v.count / v.captureSpeed) : 0;

  // Find all minute boundaries (:00) within the active capture window [nowMs - capSec * 1000, nowMs]
  const startMs = nowMs - capSec * 1000;
  const firstMinuteMs = Math.ceil(startMs / 60000) * 60000;
  const lastMinuteMs = Math.floor(nowMs / 60000) * 60000;

  for (let mMs = firstMinuteMs; mMs <= lastMinuteMs; mMs += 60000) {
    const ageSec = (nowMs - mMs) / 1000;
    if (ageSec < 0 || ageSec > capSec) continue;
    // If audio buffer is still filling up, don't draw markers past the recorded wavefront
    if (v.count < v.bufferSize && ageSec > maxRecordedAgeSec + 0.5) continue;

    // Calculate exact X screen position matching the scope time mode
    const tau = Math.max(0, Math.min(1, ageSec / capSec));
    let x: number;
    if (!warped) {
      x = Math.round(padL + plotW * (1 - tau));
    } else {
      const u = tau <= 0.00001 ? 0 : Math.log(1 + beta * tau) / logBetaDenom;
      x = Math.round(padL + plotW * (1 - u));
    }

    if (x < padL || x > maxX) continue;

    ctx.save();

    // 1. Vertical Minute Hairline
    ctx.beginPath();
    ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.strokeStyle = isMcCurdy ? 'rgba(185, 28, 28, 0.45)' : 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.0 * dpr;
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Sparkles of Clocking along the Vertical Minute Hairline
    // Sparkles drift gracefully and twinkle as the minute marker compresses to the left
    const hairSparkleCount = 4;
    for (let h = 0; h < hairSparkleCount; h++) {
      const seedH = h * 79 + (mMs % 10000);
      const progress = ((nowMs * 0.0004 + seedH * 0.15) % 1.0);
      const hy = padT + plotH * (1 - progress);
      const flickerH = Math.sin(nowMs * 0.006 + seedH);
      if (flickerH > -0.2) {
        const hSize = (1.8 + (flickerH + 0.2) * 1.5) * dpr;
        const hCol = isMcCurdy
          ? ((h % 3 === 0) ? '#b91c1c' : ((h % 3 === 1) ? '#d97706' : '#78350f'))
          : ((h % 3 === 0) ? '#38bdf8' : ((h % 3 === 1) ? '#facc15' : '#ffffff'));
        const hRot = nowMs * 0.002 * (h % 2 === 0 ? 1 : -1) + seedH;
        drawSparkle(ctx, x, hy, hSize, (flickerH + 0.3) * 0.75, hCol, hRot);
      }
    }

    // 3. Minute Tick Mark and Wall-Clock Timestamp at the bottom axis
    const d = new Date(mMs);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const timeLabel = `${hh}:${mm}:${ss}`;

    ctx.strokeStyle = isMcCurdy ? 'rgba(185, 28, 28, 0.7)' : 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath();
    ctx.moveTo(x, padT + plotH);
    ctx.lineTo(x, padT + plotH + 5 * dpr);
    ctx.stroke();

    // Only render the minute label if it has breathing room from edges
    if (maxX - x > 32 * dpr && x - padL > 24 * dpr) {
      ctx.font = `bold ${Math.round(9.5 * dpr)}px ui-monospace, "SF Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isMcCurdy ? '#7f1d1d' : '#38bdf8';
      ctx.fillText(timeLabel, x, padT + plotH + 6 * dpr);
    }

    ctx.restore();
  }
}
