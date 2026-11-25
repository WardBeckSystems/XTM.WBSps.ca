/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import type { GridLevel } from './grid-levels';

/* Loudness target zone and the solid reference lines + left-margin labels drawn over the traces. */

/** Orange loudness zone: light band between -24 LUFS (broadcast) and -14 LUFS (streaming). */
export function drawLoudnessZone(ctx: CanvasRenderingContext2D, L: ScopeLayout, mc: boolean): void {
  const zTop = L.dbToY(-14), zBot = L.dbToY(-24);
  ctx.save();
  ctx.fillStyle = mc ? 'rgba(249, 115, 22, 0.08)' : 'rgba(249, 115, 22, 0.06)';
  ctx.fillRect(L.padL, zTop, L.plotW, zBot - zTop);
  ctx.restore();
}

/** Solid Reference Lines OVER the Graph: Subtle, Elegant & Less Intense. */
export function drawReferenceLines(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout, grid: GridLevel[], mc: boolean): void {
  const { dpr, padL, plotW, dbToY } = L;
  ctx.save();
  ctx.font = `${Math.round(10 * dpr)}px ui-monospace, "SF Mono", monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.setLineDash([]); // 100% Solid Lines

  // Short graphs (e.g. phone in landscape): thin the grid so labels never overlap.
  // Important (bold) lines win first; ordinary lines are kept only where there is room,
  // and a skipped ordinary line is dropped entirely (line + label).
  const minGap = 13 * dpr;
  const keptY: number[] = [];
  const showLabel = new Set<number>();
  const ranked = [...grid].sort((p, q) => Number(q.bold) - Number(p.bold));
  for (const g of ranked) {
    const yy = dbToY(g.db);
    if (keptY.every(k => Math.abs(k - yy) >= minGap)) { keptY.push(yy); showLabel.add(g.db); }
  }

  grid.forEach(g => {
    const y = Math.round(dbToY(g.db));
    const isLimeLine = (g.db === -20);
    if (!showLabel.has(g.db) && !g.bold && !isLimeLine) return; // no room: skip this ordinary line

    ctx.save();
    ctx.setLineDash([]); // Solid lines
    ctx.strokeStyle = isLimeLine && v.isHoveringLime ? '#4ade80' : g.lineCol;
    ctx.lineWidth = isLimeLine ? (v.isHoveringLime ? 2.0 * dpr : 1.2 * dpr) : 1.0 * dpr;

    if (isLimeLine && v.isHoveringLime && !mc) {
      ctx.shadowColor = 'rgba(74, 222, 128, 0.8)';
      ctx.shadowBlur = 6 * dpr;
    }

    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();
    ctx.restore();

    // Left margin label with crisp shadow for high legibility
    ctx.save();
    // Dark mode: soft shadow for legibility. McCurdy (cream paper): crisp, no shadow.
    if (!mc) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 3 * dpr;
    }
    ctx.fillStyle = (g.bold || isLimeLine) ? g.labelCol : (mc ? '#4a4740' : '#94a3b8');
    if (showLabel.has(g.db)) ctx.fillText(g.label, padL - 10 * dpr, y);
    ctx.restore();
  });
  ctx.restore();
  ctx.setLineDash([]);
}
