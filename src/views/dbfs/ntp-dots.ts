/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import type { VisibleNtpDot } from '../../time/ntp-types';
import { ntpService } from '../../time/ntp-service';
import { isWarpedMode } from './time-modes';

/**
 * Draw a 4-pointed diamond star sparkle (✦) of precision clocking.
 * Used for atomic clocking glints, jitter dispersion scintillations,
 * and quantum time sync visualization.
 */
export function drawSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  opacity: number,
  col: string,
  rot: number = 0
): void {
  if (size <= 0.2 || opacity <= 0.01) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (rot !== 0) ctx.rotate(rot);
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  ctx.fillStyle = col;

  // 4-pointed diamond star body
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.closePath();
  ctx.fill();

  // Subtle cross-flare rays for bright sparkles
  if (size >= 2.0 && opacity >= 0.4) {
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(0.6, size * 0.14);
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.4);
    ctx.lineTo(0, size * 1.4);
    ctx.moveTo(-size * 1.4, 0);
    ctx.lineTo(size * 1.4, 0);
    ctx.stroke();
  }

  // Brilliant starlight white core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0.6, size * 0.26), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw NTP Event Dots & Sparkles of Clocking along the dBFS Scope Graph Timeline.
 * Each NTP sync event appears as an interactive precision marker with receipts,
 * surrounded by animated sparkles representing picosecond clocking quanta,
 * timing stability, and atomic frequency lock.
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

  // -------------------------------------------------------------
  // 1. Sparkles of Clocking at Timeline Leading Edge (NOW / Active Clock)
  // -------------------------------------------------------------
  const nowTickSec = (nowMs % 1000) / 1000;
  const leadingPulse = Math.sin(nowTickSec * Math.PI * 2);
  const leadingY = Math.round(padT + plotH - 14 * dpr);
  const nowSparkleCol = (Math.floor(nowMs / 800) % 2 === 0) ? '#facc15' : '#38bdf8';
  const nowSparkleSize = (2.4 + Math.max(0, leadingPulse) * 2.2) * dpr;
  drawSparkle(ctx, maxX, leadingY, nowSparkleSize, 0.75 + leadingPulse * 0.25, nowSparkleCol, nowMs * 0.002);

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

    // 2. Vertical Event Hairline
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

    // 3. Sparkles of Clocking along the Vertical Time Hairline
    const hairSparkleCount = isHovered ? 5 : 3;
    for (let h = 0; h < hairSparkleCount; h++) {
      const seedH = h * 73 + (receipt.timestamp % 1000);
      const progress = ((nowMs * 0.0005 + seedH * 0.12) % 1.0);
      const hy = padT + plotH * (1 - progress);
      const flickerH = Math.sin(nowMs * 0.007 + seedH);
      if (flickerH > -0.1) {
        const hSize = (1.8 + (flickerH + 0.1) * 1.5) * dpr;
        const hCol = (h % 3 === 0) ? '#38bdf8' : ((h % 3 === 1) ? '#facc15' : '#ffffff');
        const hRot = nowMs * 0.002 * (h % 2 === 0 ? 1 : -1) + seedH;
        drawSparkle(ctx, x, hy, hSize, (flickerH + 0.2) * 0.7, hCol, hRot);
      }
    }

    // 4. Animated Pulse Wave for New or Hovered Events
    if (isNew || isHovered) {
      const pulseT = ((nowMs - receipt.timestamp) % 1200) / 1200;
      const pulseR = (6 + pulseT * 14) * dpr;
      ctx.beginPath();
      ctx.arc(x, dotY, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = isHovered 
        ? `rgba(56, 189, 248, ${(1 - pulseT) * 0.9})`
        : `rgba(239, 68, 68, ${(1 - pulseT) * 0.8})`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    }

    // 5. NTP Event Dot Outer Ring / Halo
    const outerR = (isHovered ? 6.5 : 4.8) * dpr;
    ctx.beginPath();
    ctx.arc(x, dotY, outerR, 0, Math.PI * 2);
    ctx.fillStyle = isHovered 
      ? '#38bdf8' 
      : (receipt.server.includes('chu') ? '#f59e0b' : '#ef4444');
    ctx.fill();

    // 6. NTP Event Dot Inner Core
    const innerR = (isHovered ? 3.5 : 2.4) * dpr;
    ctx.beginPath();
    ctx.arc(x, dotY, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 7. Sparkles of Clocking: Constellation Orbiting the NTP Dot
    const sparkleCount = isHovered ? 11 : 6;
    for (let s = 0; s < sparkleCount; s++) {
      const seed = (s * 53 + (receipt.timestamp % 997)) * 0.15;
      const dir = (s % 2 === 0) ? 1 : -1;
      const orbitSpeed = (isHovered ? 0.0035 : 0.0018);
      const angle = nowMs * orbitSpeed * dir + seed;
      const baseDist = (8 + (s % 4) * 4.5 + Math.sin(nowMs * 0.004 + seed) * 3) * dpr;
      const orbitDist = isHovered ? baseDist * 1.35 : baseDist;
      const sx = x + Math.cos(angle) * orbitDist;
      const sy = dotY + Math.sin(angle) * (orbitDist * 0.65); // graceful perspective oval

      const flicker = Math.sin(nowMs * 0.009 + seed * 2.2);
      if (flicker > -0.25) {
        const sSize = ((isHovered ? 3.2 : 2.0) + flicker * 1.4) * dpr;
        const opacity = Math.max(0.15, (flicker + 0.3) / 1.3) * (isHovered ? 0.95 : 0.8);
        const col = (s % 4 === 0) ? '#ffffff' : ((s % 4 === 1) ? '#38bdf8' : ((s % 4 === 2) ? '#facc15' : '#f87171'));
        drawSparkle(ctx, sx, sy, sSize, opacity, col, angle * 1.5);
      }
    }

    // 8. Timeline Badge Label
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
      const bgY = dotY - 14 * dpr;

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
