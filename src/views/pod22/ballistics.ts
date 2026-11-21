/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * POD-22 per-frame runtime: level source selection, ballistic decay filter,
 * peak-hold dot and PK clip latch. Produces the lit-segment map for one frame.
 */

import type { MeterFrameTelemetry } from '../../types/telemetry';

export type LitMap = [Record<number, boolean>, Record<number, boolean>];

/** Mutable runtime state owned by the view. */
export interface Pod22RuntimeState {
  readonly minP: number;
  readonly maxP: number;
  readonly SCALE: readonly string[];
  readonly extendedLed22: boolean;
  scaleMode: 'log' | 'vu' | 'peak';
  decayType: string;
  smoothDb: [number, number];
  heldPeak: [number, number];
  holdTimer: [number, number];
  dbToSegmentIndex(db: number): number;
}

/** All segments dark. */
export function emptyLitMap(minP: number, maxP: number): LitMap {
  const lit: LitMap = [{}, {}];
  for (let p = minP; p <= maxP; p++) {
    lit[0][p] = false;
    lit[1][p] = false;
  }
  return lit;
}

/** Seconds elapsed since lastTime, clamped to [1 ms, 100 ms]. */
export function frameDt(now: number, lastTime: number): number {
  return Math.max(0.001, Math.min(0.1, (now - lastTime) / 1000));
}

/** Target level for a channel according to the scale mode. */
function targetDbFor(st: Pod22RuntimeState, levels: MeterFrameTelemetry, ch: number): number {
  let targetDb = -90;
  if (st.scaleMode === 'log') {
    if (levels.lufs && levels.lufs.mL !== undefined) {
      const lufsCh = ch === 0 ? levels.lufs.mL : levels.lufs.mR;
      if (lufsCh !== undefined && Number.isFinite(lufsCh) && lufsCh > -59) {
        targetDb = lufsCh + 24;
      }
    }
  } else if (st.scaleMode === 'vu') {
    // LED bargraph (POD-22) calibrated broadcast level (-18 dBFS = 0 VU)
    // unaffected by front-panel analog VU sensitivity knobs
    const dbfs = levels.dbfs ? (levels.dbfs[ch] ?? -90) : -90;
    targetDb = Number.isFinite(dbfs) ? dbfs + 18 : -90;
  } else if (st.scaleMode === 'peak') {
    targetDb = levels.ppmDb[ch] ?? -90;
  }
  return targetDb;
}

/** Real Ballistics Decay Filter: fast attack, type-dependent linear release. */
function applyBallistics(st: Pod22RuntimeState, ch: number, targetDb: number, dt: number): number {
  let curDb = st.smoothDb[ch] ?? -100;
  if (targetDb >= curDb) {
    const alphaAtt = 1 - Math.exp(-dt / 0.010);
    curDb += alphaAtt * (targetDb - curDb);
  } else {
    let decayRate = 24.0 / 2.8; // default Type II (2.8s)
    if (st.decayType === 'type1') decayRate = 20.0 / 1.5;
    else if (st.decayType === 'vu') decayRate = 20.0 / 0.300;
    else if (st.decayType === 'instant') decayRate = 45.0;
    curDb = Math.max(targetDb, curDb - decayRate * dt);
  }
  st.smoothDb[ch] = curDb;
  return curDb;
}

/** Peak Hold Dot: hold for 90 frames, then fall one segment per frame. */
function updatePeakHold(st: Pod22RuntimeState, ch: number, ppmDb: number): number {
  const pkIdx = st.dbToSegmentIndex(ppmDb);
  const currentHeld = st.heldPeak[ch] ?? -1;
  const currentTimer = st.holdTimer[ch] ?? 0;

  if (pkIdx >= currentHeld) {
    st.heldPeak[ch] = pkIdx;
    st.holdTimer[ch] = 90;
  } else {
    if (currentTimer > 0) {
      st.holdTimer[ch] = currentTimer - 1;
    } else {
      st.heldPeak[ch] = Math.max(-1, currentHeld - 1);
    }
  }
  return st.heldPeak[ch] ?? -1;
}

/** Compute which segments are lit this frame (and advance runtime state). */
export function computeLit(
  st: Pod22RuntimeState,
  levels: MeterFrameTelemetry,
  powered: boolean,
  dt: number
): LitMap {
  const lit = emptyLitMap(st.minP, st.maxP);

  if (powered) {
    for (let ch = 0; ch < 2; ch++) {
      const curDb = applyBallistics(st, ch, targetDbFor(st, levels, ch), dt);

      const vuIdx = st.dbToSegmentIndex(curDb);
      const maxIdx = st.SCALE.length - 1;

      const rowLit = lit[ch];
      if (rowLit) {
        for (let i = 0; i <= vuIdx && i < maxIdx; i++) {
          const p = st.minP + i;
          rowLit[p] = true;
        }
      }

      const updatedHeld = updatePeakHold(st, ch, levels.ppmDb[ch] ?? -90);
      if (updatedHeld >= 0 && updatedHeld <= maxIdx && rowLit) {
        const holdP = st.minP + updatedHeld;
        rowLit[holdP] = true;
      }

      // Peak Clip (overload / distortion limit indicator)
      const clipThreshold = st.extendedLed22 ? 22 : 14;
      const isPeak = levels.peak[ch];
      if (rowLit && (isPeak || (levels.ppmDb[ch] ?? -90) >= clipThreshold)) {
        rowLit[st.maxP] = true;
      }
    }
  } else {
    st.heldPeak = [-1, -1];
    st.holdTimer = [0, 0];
  }

  return lit;
}
