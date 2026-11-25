/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { TimeScaleMode } from '../../types/telemetry';
import { CAPTURE_STEPS, SPEED_STEPS } from './capture-steps';

/* Settings-drawer capture controls: time scale buttons, capture length, CLEAR, capture speed. */

export function bindCaptureControls(v: DbfsView): void {
  const btnLog = document.getElementById('btnScopeLog');
  const btnSuperLog = document.getElementById('btnScopeSuperLog');
  const btnLin = document.getElementById('btnScopeLin');
  const btnSamples = document.getElementById('btnScopeSamples');
  const lengthSlider = document.getElementById('scopeLengthSlider') as HTMLInputElement | null;
  const lengthVal = document.getElementById('scopeLengthVal');
  const btnClear = document.getElementById('btnScopeClear');
  const speedSlider = document.getElementById('scopeSpeedSlider') as HTMLInputElement | null;
  const speedVal = document.getElementById('scopeSpeedVal');

  const pick = (mode: TimeScaleMode) => () => {
    v.setTimeMode(mode);
    if (v.onTimeModeChange) v.onTimeModeChange(mode);
  };
  if (btnLog && btnLin) {
    btnLog.addEventListener('click', pick('log'));
    if (btnSuperLog) btnSuperLog.addEventListener('click', pick('super_log'));
    btnLin.addEventListener('click', pick('lin'));
    if (btnSamples) btnSamples.addEventListener('click', pick('samples'));
  }

  if (lengthSlider) {
    lengthSlider.min = '0';
    lengthSlider.max = String(CAPTURE_STEPS.length - 1);
    lengthSlider.step = '1';
    lengthSlider.value = String(v.secondsToSlider(v.captureLength));
    if (lengthVal) lengthVal.textContent = v.formatDuration(v.captureLength);
    lengthSlider.addEventListener('input', (e: any) => {
      const sliderPos = parseFloat(e.target.value);
      v.captureLength = v.sliderToSeconds(sliderPos);
      if (lengthVal) lengthVal.textContent = v.formatDuration(v.captureLength);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      v.clear();
      if (v.onClear) v.onClear();
    });
  }

  if (speedSlider) {
    speedSlider.min = '0';
    speedSlider.max = String(SPEED_STEPS.length - 1);
    speedSlider.step = '1';
    let initIdx = SPEED_STEPS.findIndex(s => s.fps === v.captureSpeed);
    if (initIdx < 0) initIdx = 2; // 240 FPS default
    speedSlider.value = String(initIdx);
    if (speedVal) speedVal.textContent = SPEED_STEPS[initIdx].label;

    const warningBox = document.getElementById('scopeSpeedWarning');
    const warningText = document.getElementById('scopeSpeedWarningText');

    speedSlider.addEventListener('input', (e: any) => {
      const idx = Math.max(0, Math.min(SPEED_STEPS.length - 1, parseInt(e.target.value, 10)));
      const step = SPEED_STEPS[idx];
      if (v.captureSpeed !== step.fps) {
        v.captureSpeed = step.fps;
        // Re-allocate 10-minute circular ring buffer cache for new capture speed, flushing old memory
        v.resizeBuffer(Math.round(v.maxCaptureSec * v.captureSpeed));
      }
      if (speedVal) speedVal.textContent = step.label;

      if (step.warning) {
        if (warningBox && warningText) {
          warningText.textContent = '⚠️ ' + step.warning;
          warningBox.style.display = 'block';
        }
      } else if (warningBox) {
        warningBox.style.display = 'none';
      }
    });
  }
}
