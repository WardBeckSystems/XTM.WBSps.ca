/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import type { VisibleNtpDot } from '../../time/ntp-types';
import { ntpService } from '../../time/ntp-service';
import { isWarpedMode } from './time-modes';

/**
 * Draw NTP Event Dots & Markers along the dBFS Scope Graph Timeline.
 * Each NTP sync event appears as an interactive precision marker with receipts.
 * As time advances, the dot continuously rolls across the timeline from NOW
 * into the past with sub-pixel alignment matching the audio waveform.
 */
export function drawNtpDots(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout, nowMs: number): void {
  const { dpr, padL, padT, plotW, plotH, maxX } = L;
  const capSec = v.getActiveSpanSec();
  const beta = v.beta || (v.timeMode === 'super_log' ? 60 : 15);
  const logBetaDenom = v.logBetaDenom || Math.log(1 + beta);
  const warped = isWarpedMode(v.timeMode);

  // Clear visible dots cache for current frame
  v.visibleNtpDots = [];

  const receipts = ntpService.getRecentReceipts(capSec * 1000);
  if (!receipts || receipts.length === 0) return;

  const dotY = Math.round(padT + plotH - 14 * dpr);
  const isMcCurdy = document.body.classList.contains('theme-mccurdy') ||
                    document.body.classList.contains('theme-mccurdy-light');

  for (const receipt of receipts) {
    const ageSec = (nowMs - receipt.timestamp) / 1000;
    if (ageSec < 0 || ageSec > capSec) continue;

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

    const isHovered = (v.hoveredNtpReceipt?.id === receipt.id);
    const isNew = (nowMs - receipt.timestamp < 4000); // Created in last 4 seconds

    // Record for hit-testing in pointer-input
    const hitRadius = 16 * dpr;
    const dotRecord: VisibleNtpDot = {
      receipt,
      x,
      y: dotY,
      radius: hitRadius,
      ageSec
    };
    v.visibleNtpDots.push(dotRecord);

    ctx.save();

    // 1. Vertical Event Hairline
    ctx.beginPath();
    ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.strokeStyle = isHovered 
      ? (isMcCurdy ? 'rgba(220, 38, 38, 0.9)' : 'rgba(56, 189, 248, 0.85)')
      : (isMcCurdy ? 'rgba(185, 28, 28, 0.35)' : 'rgba(56, 189, 248, 0.35)');
    ctx.lineWidth = (isHovered ? 1.8 : 1.0) * dpr;
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Animated Pulse Wave for New or Hovered Events
    if (isNew || isHovered) {
      const pulseT = ((nowMs - receipt.timestamp) % 1200) / 1200;
      const pulseR = (6 + pulseT * 12) * dpr;
      ctx.beginPath();
      ctx.arc(x, dotY, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = isHovered 
        ? `rgba(56, 189, 248, ${(1 - pulseT) * 0.9})`
        : `rgba(239, 68, 68, ${(1 - pulseT) * 0.8})`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    }

    // 3. NTP Event Dot Outer Ring / Halo
    const outerR = (isHovered ? 6.5 : 4.8) * dpr;
    ctx.beginPath();
    ctx.arc(x, dotY, outerR, 0, Math.PI * 2);
    ctx.fillStyle = isHovered 
      ? '#38bdf8' 
      : (receipt.server.includes('chu') ? '#f59e0b' : '#ef4444');
    ctx.fill();

    // 4. NTP Event Dot Inner Core
    const innerR = (isHovered ? 3.5 : 2.4) * dpr;
    ctx.beginPath();
    ctx.arc(x, dotY, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 5. Timeline Badge Label
    ctx.font = `bold ${Math.round((isHovered ? 10.5 : 9) * dpr)}px ui-monospace, "SF Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    if (isHovered) {
      // Expanded tooltip hint when hovered directly on the canvas
      const badgeText = `🍁 NRC NTP · ${receipt.server} (${receipt.offsetMs >= 0 ? '+' : ''}${receipt.offsetMs.toFixed(2)}ms)`;
      const textMetrics = ctx.measureText(badgeText);
      const bgW = textMetrics.width + 12 * dpr;
      const bgH = 18 * dpr;
      const bgX = Math.max(padL + bgW / 2, Math.min(maxX - bgW / 2, x));
      const bgY = dotY - 12 * dpr;

      ctx.fillStyle = isMcCurdy ? 'rgba(254, 252, 243, 0.96)' : 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.roundRect(bgX - bgW / 2, bgY - bgH, bgW, bgH, 4 * dpr);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isMcCurdy ? '#0f172a' : '#38bdf8';
      ctx.fillText(badgeText, bgX, bgY - 4 * dpr);
    } else {
      // Compact label above the dot
      ctx.fillStyle = isMcCurdy ? '#7f1d1d' : '#f87171';
      ctx.fillText('🍁 NTP', x, dotY - 7 * dpr);
    }

    ctx.restore();
  }
}
