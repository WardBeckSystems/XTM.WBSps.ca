/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import type { LiveLevels } from './live-levels';
import { timeModeSpec } from './time-modes';

/* Floating hover HUD telemetry text and the on-canvas 10 s loss-of-signal warning. */

const fmt = (x: number) => (x > -60 ? x.toFixed(1) : '-INF');
const fmtSigned = (x: number) => (x > -60 ? (x > 0 ? '+' : '') + x.toFixed(1) : '-INF');

export function updateHudReadout(v: DbfsView, live: LiveLevels, bufLen: number): void {
  if (!v.hudChA) return;
  const last = (v.head - 1 + bufLen) % bufLen;
  const latestL = v.histL[last];
  const latestR = v.histR[last];

  v.hudChA.textContent = fmt(latestL) + ' dBFS';
  if (v.hudChB) v.hudChB.textContent = fmt(latestR) + ' dBFS';
  if (v.hudSum) v.hudSum.textContent = fmtSigned(v.histSum[last]) + ' dBFS';
  if (v.hudDiff) v.hudDiff.textContent = fmtSigned(v.histDiff[last]) + ' dBFS';
  if (v.hudLufsM) v.hudLufsM.textContent = fmt(live.liveLufsM) + ' LUFS';
  if (v.hudLufsS) v.hudLufsS.textContent = fmt(live.liveLufsS) + ' LUFS';
  if (v.hudLufsI) v.hudLufsI.textContent = fmt(live.liveLufsI) + ' LUFS';
  if (v.hudLra) v.hudLra.textContent = (live.liveLra > 0 ? live.liveLra.toFixed(1) : '0.0') + ' LU';
  if (v.hudMax) v.hudMax.textContent = `L ${fmt(v.peakMaxL)} | R ${fmt(v.peakMaxR)}`;

  if (v.hudTimeMode) {
    if (v.hasSignalLost) {
      v.hudTimeMode.textContent = `⚠ LOSS OF SIGNAL (SILENCE > 10s)`;
      v.hudTimeMode.style.color = '#fbbf24';
    } else {
      v.hudTimeMode.textContent = `ITU-R BS.1770-4 · ${timeModeSpec(v.timeMode).label}`;
      v.hudTimeMode.style.color = '';
    }
  }

  if (v.clipCountL > 0 || v.clipCountR > 0) {
    if (v.hudClipRow) v.hudClipRow.style.display = 'flex';
    if (v.hudClips) v.hudClips.textContent = String(v.clipCountL + v.clipCountR);
  } else if (v.hudClipRow) {
    v.hudClipRow.style.display = 'none';
  }
}

/** 10s Loss of Signal Warning on Scope Screen (flashing). */
export function drawSignalLossWarning(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout, now: number): void {
  if (!v.hasSignalLost) return;
  const flashOn = Math.floor((now % 1200) / 600) === 0;
  if (!flashOn) return;
  ctx.save();
  ctx.font = `bold ${Math.round(11 * L.dpr)}px ui-monospace, monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('⚠ LOSS OF SIGNAL (>10s)', L.W - 32 * L.dpr, L.padT + 8 * L.dpr);
  ctx.restore();
}
