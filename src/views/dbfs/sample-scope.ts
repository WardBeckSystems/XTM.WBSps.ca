/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import { applyThemePalette } from './palette';
import { readSampleTap, TAP_SIZE } from './sample-tap';

/* SAMPLES time scale: the individual audio samples (amplitude -1..+1), newest window
 * triggered on a rising zero crossing of Ch A so steady tones stand still. Each sample
 * is a stem + dot when there is room, otherwise a connected trace. */

const AMP_LINES = [
  { a: 1.0, label: '0 dBFS' },
  { a: 0.5012, label: '-6 dBFS' },
  { a: 0.1259, label: '-18 dBFS' },
];

export function drawSampleScope(v: DbfsView, L: ScopeLayout): void {
  const ctx = v.ctx;
  if (!ctx) return;
  applyThemePalette(v);
  const P = v.PAL;
  const dpr = L.dpr;

  ctx.fillStyle = P.bg;
  ctx.fillRect(0, 0, L.W, L.H);

  const midY = L.padT + L.plotH / 2;
  const half = L.plotH / 2 - 2 * dpr;
  const ampToY = (a: number) => midY - Math.max(-1.05, Math.min(1.05, a)) * half;

  // Amplitude grid (labelled in dBFS on the left)
  ctx.font = `${10 * dpr}px monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 1;
  for (const g of AMP_LINES) {
    for (const s of [1, -1]) {
      const y = Math.round(ampToY(g.a * s)) + 0.5;
      ctx.strokeStyle = g.a === 1 ? P.gridClip : g.a < 0.2 ? P.gridRef : P.grid;
      ctx.setLineDash(g.a === 1 ? [] : [4 * dpr, 4 * dpr]);
      ctx.beginPath();
      ctx.moveTo(L.padL, y);
      ctx.lineTo(L.maxX, y);
      ctx.stroke();
      ctx.fillStyle = P.textMuted;
      ctx.fillText(g.label, L.padL - 8 * dpr, y);
    }
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = P.grid;
  ctx.beginPath();
  ctx.moveTo(L.padL, Math.round(midY) + 0.5);
  ctx.lineTo(L.maxX, Math.round(midY) + 0.5);
  ctx.stroke();

  const tapData = readSampleTap(v.audioEngine);
  if (!tapData) {
    ctx.fillStyle = P.textMuted;
    ctx.textAlign = 'center';
    ctx.font = `${12 * dpr}px monospace`;
    ctx.fillText('NO AUDIO', L.padL + L.plotW / 2, midY - 14 * dpr);
    return;
  }

  // Window: as many samples as fit at >= 5 px each (power of two, 32 .. TAP_SIZE/2)
  let n = 32;
  while (n * 2 <= TAP_SIZE / 2 && L.plotW / (n * 2) >= 5 * dpr) n *= 2;

  // Trigger: last rising zero crossing of Ch A that still leaves n samples after it
  const { l, r, rate } = tapData;
  let start = TAP_SIZE - n;
  for (let i = TAP_SIZE - n; i > 0; i--) {
    if (l[i - 1] < 0 && l[i] >= 0) { start = i; break; }
  }
  const dx = L.plotW / (n - 1);
  const xOf = (i: number) => L.padL + i * dx;

  // Time grid: 8 divisions, labelled in samples and ms
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let d = 0; d <= 8; d++) {
    const i = (d / 8) * n;
    const x = Math.round(xOf(Math.min(i, n - 1))) + 0.5;
    ctx.strokeStyle = P.gridTime;
    ctx.beginPath();
    ctx.moveTo(x, L.padT);
    ctx.lineTo(x, L.padT + L.plotH);
    ctx.stroke();
    ctx.fillStyle = P.textMuted;
    ctx.fillText(d === 8 ? `${n} smp · ${((n / rate) * 1000).toFixed(2)} ms` : `${i}`, Math.min(x, L.maxX - 60 * dpr), L.padT + L.plotH + 6 * dpr);
  }

  const stems = dx >= 5 * dpr;
  const drawCh = (buf: Float32Array, color: string, offset: number) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, dpr);
    if (stems) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = xOf(i) + offset;
        ctx.moveTo(x, midY);
        ctx.lineTo(x, ampToY(buf[start + i]));
      }
      ctx.globalAlpha = 0.45;
      ctx.stroke();
      ctx.globalAlpha = 1;
      const rad = Math.min(3 * dpr, dx * 0.28);
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.arc(xOf(i) + offset, ampToY(buf[start + i]), rad, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const y = ampToY(buf[start + i]);
        if (i === 0) ctx.moveTo(xOf(i), y); else ctx.lineTo(xOf(i), y);
      }
      ctx.stroke();
    }
  };
  // Offset Ch B by a third of a sample so coincident L/R samples stay visible
  drawCh(r, P.lineR, stems ? dx / 3 : 0);
  drawCh(l, P.lineL, 0);
}
