/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
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

// Canonical 11-point Canadian Maple Leaf vector path (centered at 0, 0, ~22x22 units)
const MAPLE_LEAF_PATH = new Path2D(`
  M 0 -11
  L 1.6 -6.8
  L 4.6 -7.5
  L 4.9 -4.2
  L 3.2 -3.7
  L 7.6 -3.9
  L 10.8 -0.6
  L 8.4 1.4
  L 4.3 0.9
  L 6.5 4.0
  L 2.4 4.3
  L 0.8 9.8
  L -0.8 9.8
  L -2.4 4.3
  L -6.5 4.0
  L -4.3 0.9
  L -8.4 1.4
  L -10.8 -0.6
  L -7.6 -3.9
  L -3.2 -3.7
  L -4.9 -4.2
  L -4.6 -7.5
  L -1.6 -6.8
  Z
`);

/**
 * Draw NTP Event Markers along the dBFS Scope Graph Timeline.
 * Renders purely as a traveling Canadian Maple Leaf (🍁) icon for authentic
 * Canadian broadcast time reference, free of distracting sparkles and clutter.
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

    // 1. Vertical Event Hairline (shown only when hovered)
    if (isHovered) {
      ctx.beginPath();
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.strokeStyle = isMcCurdy ? 'rgba(220, 38, 38, 0.85)' : 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Traveling Canadian Maple Leaf (pure leaf, no sparkles or rings)
    ctx.save();
    ctx.translate(x, dotY);
    const leafScale = (isHovered ? 0.85 : 0.65) * dpr;
    ctx.scale(leafScale, leafScale);

    const leafFill = isHovered 
      ? '#f87171' 
      : (isMcCurdy ? '#dc2626' : (receipt.server.includes('chu') ? '#f59e0b' : '#ef4444'));
    ctx.fillStyle = leafFill;
    ctx.fill(MAPLE_LEAF_PATH);

    if (isHovered) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2 / leafScale;
      ctx.stroke(MAPLE_LEAF_PATH);
    }
    ctx.restore();

    // 3. Hover Tooltip Details Card
    if (isHovered) {
      ctx.font = `bold ${Math.round(10.5 * dpr)}px ui-monospace, "SF Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

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
    }

    ctx.restore();
  }
}
