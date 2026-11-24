/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Configuration profile types and storage keys. */

import type { VisualizerMode, MeterStyle } from '../types/telemetry';

export type StorageConsentState = 'allowed' | 'session_only' | 'prompt';

export const CONSENT_KEY = 'wbs_storage_consent';
export const CONFIG_STORAGE_KEY = 'wbs_console_config_profile';

export interface WbsConsoleConfig {
  version: string;
  timestamp: string;
  profileName: string;
  console: {
    power: boolean;
    mode: VisualizerMode;
    meterStyle: MeterStyle;
    dialLamp: string;
    vfdMetric: string;
    inputA: { src: number; lvl: number };
    inputD: { src: number; lvl: number };
    testGenS: { pair: number[] };
    highPassFilter: boolean;
    termination600Ohm: boolean;
    toneCalibrationDbfs: number;
  };
  ballistics: {
    vuReferenceLevelDbu: number;
    ppmPeakSensitivityTrimDb: number;
    vuBallisticPreset?: string;
    ppmBallisticPreset?: string;
    inputGainTrimDb: number;
    monitorAudio: {
      enabled: boolean;
      volume: number;
    };
  };
  pod22: {
    extendedLed22Range: boolean;
    scaleMode: 'log' | 'vu' | 'peak';
    decayType: string;
    peakHold: boolean;
  };
  scope: {
    timeMode: 'log' | 'super_log' | 'lin' | 'samples';
    captureLengthSeconds: number;
    captureSpeedFps: number;
    logWarpBeta: number;
    traces: {
      channelA: boolean;
      channelB: boolean;
      sum: boolean;
      diff: boolean;
      momentaryLufs: boolean;
      shortTermLufs: boolean;
      integratedLufs: boolean;
    };
    display: {
      show0DbfsCeilingLine: boolean;
      enableWaveformFade: boolean;
      hfFadeDistancePercent: number;
      showHoverTelemetryHud: boolean;
      showCursorTraceLine: boolean;
      plotPhaseCorrelation: boolean;
      hudDocked: boolean;
    };
  };
}
