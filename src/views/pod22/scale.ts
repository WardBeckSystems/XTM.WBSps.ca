/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * POD-22 scale tables: segment labels and dB thresholds for the standard
 * (41-segment) and extended (57-segment) ranges, plus range/index helpers.
 */

export interface Pod22DipSwitch {
  BS0: number; // 0 = Type 2 decay (3.0s / 24 dB - Default), 1 = Type 1 decay (1.5s / 24 dB)
  BS1: number; // 1 = Peak Hold ON, 0 = Peak Hold OFF
}

export const SCALE_STD: readonly string[] = [
  'PR','-36','-32','-28','-26','-24','-22','-20','-18','-16',
  '-15','-14','-13','-12','-11','-10','-9','-8','-7','-6',
  '-5','-4','-3','-2','-1','0','+1','+2','+3','+4',
  '+5','+6','+7','+8','+9','+10','+11','+12','+13','+14','PK'
];

export const THRESHOLDS_STD: readonly number[] = [
  -45, -36, -32, -28, -26, -24, -22, -20, -18, -16,
  -15, -14, -13, -12, -11, -10,  -9,  -8,  -7,  -6,
   -5,  -4,  -3,  -2,  -1,   0,   1,   2,   3,   4,
    5,   6,   7,   8,   9,  10,  11,  12,  13,  14
];

export const SCALE_EXT: readonly string[] = [
  '-100','-90','-80','-70','-60','-55','-50','-45',
  'PR','-36','-32','-28','-26','-24','-22','-20','-18','-16',
  '-15','-14','-13','-12','-11','-10','-9','-8','-7','-6',
  '-5','-4','-3','-2','-1','0','+1','+2','+3','+4',
  '+5','+6','+7','+8','+9','+10','+11','+12','+13','+14',
  '+15','+16','+17','+18','+19','+20','+21','+22','PK'
];

export const THRESHOLDS_EXT: readonly number[] = [
  -100, -90, -80, -70, -60, -55, -50, -45,
   -42, -36, -32, -28, -26, -24, -22, -20, -18, -16,
   -15, -14, -13, -12, -11, -10,  -9,  -8,  -7,  -6,
    -5,  -4,  -3,  -2,  -1,   0,   1,   2,   3,   4,
     5,   6,   7,   8,   9,  10,  11,  12,  13,  14,
    15,  16,  17,  18,  19,  20,  21,  22,  24
];

/** First segment position (p) for the active range. */
export function minPos(extended: boolean): number {
  return extended ? -8 : 0;
}

/** Last segment position (p) for the active range (the PK overload LED). */
export function maxPos(extended: boolean): number {
  return extended ? 48 : 40;
}

export function scaleFor(extended: boolean): readonly string[] {
  return extended ? SCALE_EXT : SCALE_STD;
}

export function thresholdsFor(extended: boolean): readonly number[] {
  return extended ? THRESHOLDS_EXT : THRESHOLDS_STD;
}

/** Highest segment index whose threshold the level reaches, or -1 when dark. */
export function dbToSegmentIndex(db: number, extended: boolean, thresholds: readonly number[]): number {
  if (!Number.isFinite(db) || db < (extended ? -110 : -55)) return -1;
  let idx = -1;
  for (let i = 0; i < thresholds.length; i++) {
    const th = thresholds[i];
    if (th !== undefined && db >= th) {
      idx = i;
    } else {
      break;
    }
  }
  return idx;
}
