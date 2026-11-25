/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems XTM-4 — Core Telemetry Contracts & Interfaces
 * Frozen types for stable V8 TurboFan hidden classes and compile-time verification.
 */

export interface MeterFrameTelemetry {
  readonly vu: readonly [left: number, right: number];
  readonly ppm: readonly [left: number, right: number];
  readonly vuDb: readonly [left: number, right: number];
  readonly ppmDb: readonly [left: number, right: number];
  readonly dbfs: readonly [chA: number, chB: number, sum: number, diff: number];
  readonly lufs: {
    readonly m: number;
    readonly s: number;
    readonly i: number;
    readonly lra: number;
    readonly mL?: number;
    readonly mR?: number;
  };
  readonly rmsDb: readonly [left: number, right: number];
  readonly phaseCorrelation: number;
  readonly phaseLed: number;
  readonly peak: readonly [left: boolean, right: boolean];
  readonly hasAudio: boolean;
}

export type VisualizerMode = 'A' | 'D' | 'S' | 'SET';
export type MeterStyle = 'pimson' | 'pimsom' | 'simpson' | 'fisam' | 'sifam' | 'wbs_m405' | 'mccurdy_vu' | string;
export type ScaleMode = 'log' | 'vu' | 'peak';
export type TimeScaleMode = 'log' | 'super_log' | 'lin' | 'samples';

export interface XtmModeStateA {
  src: number;
  lvl: number;
}

export interface XtmModeStateD {
  src: number;
  lvl: number;
}

export interface XtmModeStateS {
  pair: number[];
}

export interface XtmModeStateSet {
  scr: 'HP' | 'TERM';
}
