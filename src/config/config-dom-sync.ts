/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Synchronises the HTML form inputs in the auxiliary drawer with a configuration profile. */

import type { WbsConsoleConfig } from './config-types';

export function syncDrawerDomFromConfig(cfg: WbsConsoleConfig): void {
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
