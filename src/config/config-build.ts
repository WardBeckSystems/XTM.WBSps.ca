/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Builds a complete configuration snapshot from the live model, engine and views. */

import type { XtmModel } from '../models/xtm-model';
import type { XtmAudioEngine } from '../audio/audio-engine';
import type { Pod22View } from '../views/pod22-view';
import type { DbfsView } from '../views/dbfs-view';
import type { WbsConsoleConfig } from './config-types';

export function buildConsoleSection(model: XtmModel): WbsConsoleConfig['console'] {
  const calLevel = model.toneCalLevels[model.toneCalIdx] ?? 0;
  return {
    power: model.power,
    mode: model.mode,
    meterStyle: model.meterStyle,
    dialLamp: model.dialLamp,
    vfdMetric: model.vfdMetric,
    inputA: { src: model.a.src, lvl: model.a.lvl },
    inputD: { src: model.d.src, lvl: model.d.lvl },
    testGenS: { pair: [...model.s.pair] },
    highPassFilter: model.hp === 1,
    termination600Ohm: model.term === 1,
    toneCalibrationDbfs: calLevel
  };
}

export function buildBallisticsSection(audio: XtmAudioEngine): WbsConsoleConfig['ballistics'] {
  return {
    vuReferenceLevelDbu: audio.refLevelDb,
    ppmPeakSensitivityTrimDb: audio.peakSensTrim,
    vuBallisticPreset: audio.vuBallisticPreset,
    ppmBallisticPreset: audio.ppmBallisticPreset,
    inputGainTrimDb: audio.inputTrimDb,
    monitorAudio: {
      enabled: audio.monitorEnabled,
      volume: audio.monitorVolume
    }
  };
}

export function buildPod22Section(podView: Pod22View): WbsConsoleConfig['pod22'] {
  return {
    extendedLed22Range: podView.extendedLed22,
    scaleMode: podView.scaleMode,
    decayType: podView.decayType || 'type2',
    peakHold: podView.dip?.BS1 === 1
  };
}

export function buildScopeSection(dbfsView: DbfsView): WbsConsoleConfig['scope'] {
  return {
    timeMode: dbfsView.timeMode,
    captureLengthSeconds: dbfsView.captureLength,
    captureSpeedFps: dbfsView.captureSpeed,
    logWarpBeta: dbfsView.beta,
    traces: {
      channelA: dbfsView.showChA,
      channelB: dbfsView.showChB,
      sum: dbfsView.showSum,
      diff: dbfsView.showDiff,
      momentaryLufs: dbfsView.showLufs,
      shortTermLufs: dbfsView.showLufsS,
      integratedLufs: dbfsView.showLufsI
    },
    display: {
      show0DbfsCeilingLine: dbfsView.show0DbfsLine,
      enableWaveformFade: dbfsView.enableFade,
      hfFadeDistancePercent: dbfsView.hfFadeDistance,
      showHoverTelemetryHud: dbfsView.showHoverTelemetry,
      showCursorTraceLine: dbfsView.showCursorTrace,
      plotPhaseCorrelation: dbfsView.plotPhase,
      hudDocked: dbfsView.isDocked
    }
  };
}

export function buildFullConfig(
  model: XtmModel,
  audio: XtmAudioEngine,
  podView: Pod22View,
  dbfsView: DbfsView
): WbsConsoleConfig {
  return {
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    profileName: 'Ward-Beck Systems Broadcast Mastering Suite Profile',
    console: buildConsoleSection(model),
    ballistics: buildBallisticsSection(audio),
    pod22: buildPod22Section(podView),
    scope: buildScopeSection(dbfsView)
  };
}
