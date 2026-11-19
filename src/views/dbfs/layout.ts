/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';

/* Plot geometry for one frame: margins, plot box, dB -> y mapping and the lime (-18 dBFS) line. */

export interface ScopeLayout {
  W: number;
  H: number;
  dpr: number;
  padL: number;
  padR: number;
  padT: number;
  padB: number;
  plotW: number;
  plotH: number;
  maxX: number;
  limeY: number;
  bufLen: number;
  dbToY: (db: number) => number;
}

export function computeLayout(v: DbfsView): ScopeLayout {
  const W = v.w;
  const H = v.h;
  const dpr = v.dpr || 1;

  // Generous Left Margin (175px) so labels never clip, and Full-Width Right Margin (28px)
  const padL = 175 * dpr;
  const padR = 28 * dpr;
  const padT = 18 * dpr;
  const padB = 26 * dpr;
  const plotW = Math.max(10, W - padL - padR);
  const plotH = Math.max(10, H - padT - padB);

  // dB to Y mapping (-60 dBFS at bottom, up to +6.02 dBFS at top for true summed signals)
  const minScaleDb = -60.0;
  const maxScaleDb = 6.0;
  const rangeScaleDb = maxScaleDb - minScaleDb; // 66 dB
  const dbToY = (db: number): number => padT + plotH * (1 - (Math.max(minScaleDb, Math.min(maxScaleDb, db)) - minScaleDb) / rangeScaleDb);
  const maxX = Math.round(padL + plotW);
  const limeY = Math.round(dbToY(-18));
  const bufLen = v.bufferSize;

  return { W, H, dpr, padL, padR, padT, padB, plotW, plotH, maxX, limeY, bufLen, dbToY };
}
