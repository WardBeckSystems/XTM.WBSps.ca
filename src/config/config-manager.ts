/**
 * Ward-Beck Systems Console Configuration & Memory Manager
 * Handles:
 * 1. Storage / Cookie Consent (GDPR / Persistent memory permission)
 * 2. Complete hardware & visualizer state persistence across sessions
 * 3. Human-readable YAML Profile Export & Import with .WBS file extension
 */

import * as yaml from 'js-yaml';
import type { XtmModel } from '../models/xtm-model';
import type { XtmAudioEngine } from '../audio/audio-engine';
import type { Pod22View } from '../views/pod22-view';
import type { DbfsView } from '../views/dbfs-view';
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
    timeMode: 'log' | 'super_log' | 'lin';
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

export class ConfigManager {
  private static instance: ConfigManager;

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /* ---------------- Storage Consent Management ---------------- */
  public getConsent(): StorageConsentState {
    try {
      const val = localStorage.getItem(CONSENT_KEY);
      if (val === 'allowed') return 'allowed';
      if (val === 'session_only') return 'session_only';
      return 'prompt';
    } catch (_) {
      return 'session_only';
    }
  }

  public setConsent(consent: 'allowed' | 'session_only'): void {
    try {
      localStorage.setItem(CONSENT_KEY, consent);
    } catch (_) {}
  }

  public resetConsent(): void {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch (_) {}
  }

  public hasPersistentConsent(): boolean {
    return this.getConsent() === 'allowed';
  }

  /* ---------------- Storage Abstraction (localStorage vs sessionStorage) ---------------- */
  public storageGet(key: string): string | null {
    try {
      if (this.hasPersistentConsent()) {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
      return sessionStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  public storageSet(key: string, value: string): void {
    try {
      if (this.hasPersistentConsent()) {
        localStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, value);
      }
    } catch (_) {}
  }

  public storageRemove(key: string): void {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (_) {}
  }

  /* ---------------- Build Complete Snapshot ---------------- */
  public buildConfig(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): WbsConsoleConfig {
    const calLevel = model.toneCalLevels[model.toneCalIdx] ?? 0;

    return {
      version: '1.1.0',
      timestamp: new Date().toISOString(),
      profileName: 'Ward-Beck Systems Broadcast Mastering Suite Profile',
      console: {
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
      },
      ballistics: {
        vuReferenceLevelDbu: audio.refLevelDb,
        ppmPeakSensitivityTrimDb: audio.peakSensTrim,
        vuBallisticPreset: audio.vuBallisticPreset,
        ppmBallisticPreset: audio.ppmBallisticPreset,
        inputGainTrimDb: audio.inputTrimDb,
        monitorAudio: {
          enabled: audio.monitorEnabled,
          volume: audio.monitorVolume
        }
      },
      pod22: {
        extendedLed22Range: podView.extendedLed22,
        scaleMode: podView.scaleMode,
        decayType: podView.decayType || 'type2',
        peakHold: podView.dip?.BS1 === 1
      },
      scope: {
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
      }
    };
  }

  /* ---------------- YAML Export (.WBS) ---------------- */
  public exportToYaml(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): string {
    const config = this.buildConfig(model, audio, podView, dbfsView);
    const yamlBody = yaml.dump(config, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    });

    const header = [
      '# ======================================================================',
      '# WARD-BECK SYSTEMS - CONSOLE MASTER CALIBRATION PROFILE (.WBS)',
      '# Hardware Emulation: XTM-4 Mastering Meter & POD-22 Dual LED Bar',
      `# Exported: ${config.timestamp}`,
      '# Compatible with: https://xtm.wbsps.ca/',
      '# ======================================================================\n\n'
    ].join('\n');

    return header + yamlBody;
  }

  public downloadWbsFile(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView,
    customFilename?: string
  ): void {
    const yamlContent = this.exportToYaml(model, audio, podView, dbfsView);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = customFilename || `WBS-Console-Config-${dateStr}.WBS`;

    const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  /* ---------------- YAML Import (.WBS) ---------------- */
  public parseWbsYaml(yamlStr: string): WbsConsoleConfig {
    const loaded = yaml.load(yamlStr);
    if (!loaded || typeof loaded !== 'object') {
      throw new Error('Invalid YAML configuration file format.');
    }
    const c = loaded as Partial<WbsConsoleConfig>;
    if (!c.console && !c.ballistics && !c.scope) {
      throw new Error('Unrecognized WBS configuration structure: missing console, ballistics, or scope blocks.');
    }
    return loaded as WbsConsoleConfig;
  }

  public applyConfig(
    cfg: WbsConsoleConfig,
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): void {
    // 1. Console & Firmware Model Settings
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

    // 2. Audio Engine & Ballistics Trims
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
        audio.setMonitor(
          !!cfg.ballistics.monitorAudio.enabled,
          cfg.ballistics.monitorAudio.volume ?? 0.5
        );
      }
    }

    // 3. POD-22 Dual Optical Bar
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

    // 4. dBFS & Loudness Scope Settings
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

    // 5. Synchronize DOM Controls
    this.syncDrawerDom(cfg);

    // 6. Update view trace toggles & redraw dirty graph
    if (typeof (dbfsView as any)._updateTraceToggles === 'function') {
      (dbfsView as any)._updateTraceToggles();
    }
    dbfsView.graphDirty = true;

    // 7. Save to active storage
    this.saveConfig(model, audio, podView, dbfsView);

    // 8. Visual Confirmation: Flash 'CONFIGOK' on XTM VFD screen
    model.flash('CONFIGOK', 1600);
    model.notify();
  }

  /* ---------------- Sync HTML Form Inputs in Auxiliary Drawer ---------------- */
  public syncDrawerDom(cfg: WbsConsoleConfig): void {
    const setChecked = (id: string, val: boolean | undefined) => {
      if (val === undefined) return;
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.checked = val;
    };

    const setValue = (id: string, val: any) => {
      if (val === undefined || val === null) return;
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      if (el) el.value = String(val);
    };

    // Scope Traces
    if (cfg.scope?.traces) {
      setChecked('chkShowChA', cfg.scope.traces.channelA);
      setChecked('chkShowChB', cfg.scope.traces.channelB);
      setChecked('chkShowSum', cfg.scope.traces.sum);
      setChecked('chkShowDiff', cfg.scope.traces.diff);
      setChecked('chkShowLufs', cfg.scope.traces.momentaryLufs);
      setChecked('chkShowLufsS', cfg.scope.traces.shortTermLufs);
      setChecked('chkShowLufsI', cfg.scope.traces.integratedLufs);
    }

    // Scope Display
    if (cfg.scope?.display) {
      setChecked('chk0DbfsLine', cfg.scope.display.show0DbfsCeilingLine);
      setChecked('chkFadeEnabled', cfg.scope.display.enableWaveformFade);
      setChecked('chkHoverTelemetry', cfg.scope.display.showHoverTelemetryHud);
      setChecked('chkCursorTrace', cfg.scope.display.showCursorTraceLine);
      setChecked('chkPhasePlot', cfg.scope.display.plotPhaseCorrelation);
      setChecked('chkDockHud', cfg.scope.display.hudDocked);
    }

    // Ballistics Trims
    if (cfg.ballistics) {
      setValue('inputGainTrimSlider', cfg.ballistics.inputGainTrimDb);
      const inputGainVal = document.getElementById('inputGainTrimVal');
      if (inputGainVal) {
        const v = cfg.ballistics.inputGainTrimDb;
        inputGainVal.textContent = (v > 0 ? '+' : '') + v.toFixed(1) + ' dB';
      }

      setValue('peakSensTrimSlider', cfg.ballistics.ppmPeakSensitivityTrimDb);
      const peakSensVal = document.getElementById('peakSensTrimVal');
      if (peakSensVal) {
        const v = cfg.ballistics.ppmPeakSensitivityTrimDb;
        peakSensVal.textContent = (v > 0 ? '+' : '') + v.toFixed(1) + ' dB';
      }

      if (cfg.ballistics.monitorAudio) {
        setChecked('chkMonitorAudio', cfg.ballistics.monitorAudio.enabled);
        setValue('monitorVolumeSlider', cfg.ballistics.monitorAudio.volume);
      }
    }

    // POD-22
    if (cfg.pod22) {
      setChecked('chkExtendedLed22', cfg.pod22.extendedLed22Range);
    }
  }

  /* ---------------- Persistent Save & Load ---------------- */
  public saveConfig(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): void {
    try {
      const cfg = this.buildConfig(model, audio, podView, dbfsView);
      const serialized = JSON.stringify(cfg);
      this.storageSet(CONFIG_STORAGE_KEY, serialized);
    } catch (_) {}
  }

  public loadSavedConfig(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): boolean {
    try {
      const raw = this.storageGet(CONFIG_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as WbsConsoleConfig;
      this.applyConfig(parsed, model, audio, podView, dbfsView);
      return true;
    } catch (_) {
      return false;
    }
  }
}

export const configManager = ConfigManager.getInstance();
