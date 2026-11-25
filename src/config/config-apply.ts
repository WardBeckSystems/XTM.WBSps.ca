/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Applies each section of a configuration profile to the model, engine and views. */

import type { XtmModel } from '../models/xtm-model';
import type { XtmAudioEngine } from '../audio/audio-engine';
import type { Pod22View } from '../views/pod22-view';
import type { DbfsView } from '../views/dbfs-view';
import type { WbsConsoleConfig } from './config-types';

/** 1. Console & Firmware Model Settings */
export function applyConsoleSection(cfg: WbsConsoleConfig, model: XtmModel): void {
  if (cfg.console) {
    if (typeof cfg.console.power === 'boolean') model.power = cfg.console.power;
    if (cfg.console.mode) model.mode = model.prevMode = cfg.console.mode;
    if (cfg.console.meterStyle) model.meterStyle = cfg.console.meterStyle;
    if (cfg.console.dialLamp) model.dialLamp = cfg.console.dialLamp;
    if (cfg.console.vfdMetric) model.vfdMetric = cfg.console.vfdMetric;
    if (cfg.console.highPassFilter !== undefined) model.hp = cfg.console.highPassFilter ? 1 : 0;
    if (cfg.console.termination600Ohm !== undefined) model.term = cfg.console.termination600Ohm ? 1 : 0;

    if (cfg.console.inputA) {
      model.a.src = cfg.console.inputA.src ?? model.a.src;
      model.a.lvl = cfg.console.inputA.lvl ?? model.a.lvl;
    }
    if (cfg.console.inputD) {
      model.d.src = cfg.console.inputD.src ?? model.d.src;
      model.d.lvl = cfg.console.inputD.lvl ?? model.d.lvl;
    }
    if (cfg.console.testGenS?.pair) {
      model.s.pair = [...cfg.console.testGenS.pair];
    }

    if (typeof cfg.console.toneCalibrationDbfs === 'number') {
      const idx = model.toneCalLevels.indexOf(cfg.console.toneCalibrationDbfs);
      if (idx >= 0) model.toneCalIdx = idx;
    }
  }
}

/** 2. Audio Engine & Ballistics Trims */
export function applyBallisticsSection(cfg: WbsConsoleConfig, audio: XtmAudioEngine): void {
  if (cfg.ballistics) {
    if (typeof cfg.ballistics.vuReferenceLevelDbu === 'number') {
      audio.setReferenceLevel(cfg.ballistics.vuReferenceLevelDbu, cfg.console?.mode === 'D');
    }
    if (typeof cfg.ballistics.ppmPeakSensitivityTrimDb === 'number') {
      audio.setPeakSensTrim(cfg.ballistics.ppmPeakSensitivityTrimDb);
      const sel = document.getElementById('selectPeakSens') as HTMLSelectElement | null;
      if (sel) sel.value = String(cfg.ballistics.ppmPeakSensitivityTrimDb);
    }
    if (cfg.ballistics.vuBallisticPreset) {
      audio.setVuBallisticPreset(cfg.ballistics.vuBallisticPreset);
      const sel = document.getElementById('selectVuBallistics') as HTMLSelectElement | null;
      if (sel) sel.value = cfg.ballistics.vuBallisticPreset;
    }
    if (cfg.ballistics.ppmBallisticPreset) {
      audio.setPpmType(cfg.ballistics.ppmBallisticPreset as any);
      const sel = document.getElementById('selectPpmBallistics') as HTMLSelectElement | null;
      if (sel) sel.value = cfg.ballistics.ppmBallisticPreset;
    }
    if (typeof cfg.ballistics.inputGainTrimDb === 'number') {
      audio.setInputTrim(cfg.ballistics.inputGainTrimDb);
    }
    if (cfg.ballistics.monitorAudio) {
      // Volume only: the speakers always load muted, whatever the saved config says
      audio.setMonitorVolume(cfg.ballistics.monitorAudio.volume ?? 0.5);
    }
  }
}

/** 3. POD-22 Dual Optical Bar */
export function applyPod22Section(cfg: WbsConsoleConfig, podView: Pod22View): void {
  if (cfg.pod22) {
    if (typeof cfg.pod22.extendedLed22Range === 'boolean') {
      podView.setExtendedRange(cfg.pod22.extendedLed22Range);
    }
    if (cfg.pod22.scaleMode) {
      podView.scaleMode = cfg.pod22.scaleMode;
    }
    if (cfg.pod22.decayType) {
      podView.setDecay(cfg.pod22.decayType);
      const sel = document.getElementById('selectPodDecay') as HTMLSelectElement | null;
      if (sel) sel.value = cfg.pod22.decayType;
    }
    if (typeof cfg.pod22.peakHold === 'boolean') {
      if (podView && podView.dip) podView.dip.BS1 = cfg.pod22.peakHold ? 1 : 0;
      const chk = document.getElementById('chkPodHold') as HTMLInputElement | null;
      if (chk) chk.checked = cfg.pod22.peakHold;
    }
  }
}

/** 4. dBFS & Loudness Scope Settings */
export function applyScopeSection(cfg: WbsConsoleConfig, dbfsView: DbfsView): void {
  if (cfg.scope) {
    if (cfg.scope.timeMode) {
      dbfsView.setTimeMode(cfg.scope.timeMode);
    }
    if (typeof cfg.scope.captureLengthSeconds === 'number') {
      dbfsView.setCaptureLength(cfg.scope.captureLengthSeconds);
    }
    if (typeof cfg.scope.captureSpeedFps === 'number') {
      dbfsView.captureSpeed = cfg.scope.captureSpeedFps;
    }
    if (typeof cfg.scope.logWarpBeta === 'number') {
      dbfsView.setBeta(cfg.scope.logWarpBeta);
    }

    if (cfg.scope.traces) {
      if (typeof cfg.scope.traces.channelA === 'boolean') dbfsView.showChA = cfg.scope.traces.channelA;
      if (typeof cfg.scope.traces.channelB === 'boolean') dbfsView.showChB = cfg.scope.traces.channelB;
      if (typeof cfg.scope.traces.sum === 'boolean') dbfsView.showSum = cfg.scope.traces.sum;
      if (typeof cfg.scope.traces.diff === 'boolean') dbfsView.showDiff = cfg.scope.traces.diff;
      if (typeof cfg.scope.traces.momentaryLufs === 'boolean') dbfsView.showLufs = cfg.scope.traces.momentaryLufs;
      if (typeof cfg.scope.traces.shortTermLufs === 'boolean') dbfsView.showLufsS = cfg.scope.traces.shortTermLufs;
      if (typeof cfg.scope.traces.integratedLufs === 'boolean') dbfsView.showLufsI = cfg.scope.traces.integratedLufs;
    }

    if (cfg.scope.display) {
      if (typeof cfg.scope.display.show0DbfsCeilingLine === 'boolean') {
        dbfsView.show0DbfsLine = cfg.scope.display.show0DbfsCeilingLine;
      }
      if (typeof cfg.scope.display.enableWaveformFade === 'boolean') {
        dbfsView.enableFade = cfg.scope.display.enableWaveformFade;
      }
      if (typeof cfg.scope.display.hfFadeDistancePercent === 'number') {
        dbfsView.hfFadeDistance = cfg.scope.display.hfFadeDistancePercent;
      }
      if (typeof cfg.scope.display.showHoverTelemetryHud === 'boolean') {
        dbfsView.showHoverTelemetry = cfg.scope.display.showHoverTelemetryHud;
      }
      if (typeof cfg.scope.display.showCursorTraceLine === 'boolean') {
        dbfsView.showCursorTrace = cfg.scope.display.showCursorTraceLine;
      }
      if (typeof cfg.scope.display.plotPhaseCorrelation === 'boolean') {
        dbfsView.plotPhase = cfg.scope.display.plotPhaseCorrelation;
      }
      if (typeof cfg.scope.display.hudDocked === 'boolean') {
        dbfsView.setDocked(cfg.scope.display.hudDocked);
      }
    }
  }
}
