/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import { isWarpedMode } from './time-modes';

/* Visible rolling sample range and the age <-> screen-x mapping shared by every trace. */

export interface TraceWindow {
  capSec: number;
  beta: number;
  logBetaDenom: number;
  warped: boolean;
  targetSamples: number;
  startIdx: number;
  minX: number;
}

/** Returns null when fewer than 2 samples are visible (nothing to draw). */
export function computeTraceWindow(v: DbfsView, L: ScopeLayout, capSec: number, beta: number, logBetaDenom: number): TraceWindow | null {
  const maxSpanSamples = Math.round(capSec * v.captureSpeed);
  const targetSamples = Math.min(v.count, maxSpanSamples);
  if (targetSamples < 2) return null;

  const bufLen = L.bufLen;
  const startIdx = (v.head - targetSamples + bufLen) % bufLen;
  const warped = isWarpedMode(v.timeMode);

  const ageToX = (tau: number): number => {
    if (!warped) {
      return L.padL + L.plotW * (1 - tau);
    } else {
      const u = tau <= 0.00001 ? 0 : Math.log(1 + beta * tau) / logBetaDenom;
      return L.padL + L.plotW * (1 - u);
    }
  };

  // Oldest visible sample position on screen
  const oldestAgeSec = (targetSamples - 1) / v.captureSpeed;
  const oldestTau = Math.max(0, Math.min(1, oldestAgeSec / capSec));
  const minX = Math.round(ageToX(oldestTau));

  return { capSec, beta, logBetaDenom, warped, targetSamples, startIdx, minX };
}

/** Sample position k (0 = oldest visible) at screen x, plus the warp coordinate u (0 in linear mode). */
export function kAtX(v: DbfsView, L: ScopeLayout, win: TraceWindow, x: number): [number, number] {
  const normX = Math.max(0, Math.min(1, (x - L.padL) / L.plotW));
  let tau;
  let u = 0;
  if (!win.warped) {
    tau = 1 - normX;
  } else {
    u = 1 - normX;
    tau = (Math.pow(1 + win.beta, u) - 1) / win.beta;
  }
  const age = Math.max(0, Math.min(win.capSec, tau * win.capSec));
  const kf = (win.targetSamples - 1) - age * v.captureSpeed;
  return [Math.max(0, Math.min(win.targetSamples - 1, kf)), u];
}
