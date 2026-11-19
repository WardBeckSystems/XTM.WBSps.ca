/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM Standalone Application Coordinator
 * Coordinates pure borderless XTM-4 and POD-22 visualizers,
 * front-panel MODE & SOURCE audio routing, and 60 FPS animation loop.
 */

import { xtmModel as model } from './models/xtm-model';
import { audio } from './audio/audio-engine';
import { XtmView } from './views/xtm-view';
import { Pod22View } from './views/pod22-view';
import { DbfsView } from './views/dbfs-view';
import { configManager } from './config/config-manager';
import type { MeterFrameTelemetry, TimeScaleMode } from './types/telemetry';

export async function initApp(): Promise<void> {

  const stageEl = document.getElementById('visualizerStage');
  const podStageEl = document.getElementById('pod22Stage');
  const dbfsStageEl = document.getElementById('dbfsStage');
  const view = new XtmView(stageEl);
  view.build(model);
  const podView = new Pod22View(podStageEl);
  const dbfsView = dbfsStageEl ? new DbfsView(dbfsStageEl) : null;

  const viewportEl = document.querySelector('.console-viewport');
  const auxDrawer = document.getElementById('auxDrawer') as any;
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const drawerToggleLeft = document.getElementById('drawerToggleLeft');

  const lockOverlay = document.getElementById('settingsLockOverlay');
  const lockProgressFill = document.getElementById('lockProgressFill');
  const lockCountdown = document.getElementById('lockCountdown');

  const selectVfdMetric = document.getElementById('selectVfdMetric') as HTMLSelectElement | null;
  const selectPeakSens = document.getElementById('selectPeakSens') as HTMLSelectElement | null;
  const chkExtendedLed22 = document.getElementById('chkExtendedLed22') as HTMLInputElement | null;
  const btnExportCsvTest = document.getElementById('btnExportCsvTest');
  const chkAutoExportHourly = document.getElementById('chkAutoExportHourly') as HTMLInputElement | null;

  /* ---------------- Settings Toggle Handler (Requirement 1) ---------------- */
  function toggleSettings(e?: Event) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (auxDrawer) {
      auxDrawer.open = !auxDrawer.open;
    }
  }

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', toggleSettings);
  }
  // Only the cog icon opens/closes Settings: clicks anywhere else on the bar
  // (label, empty space, logos) must not toggle the <details> drawer.
  const drawerSummary = auxDrawer?.querySelector('summary');
  if (drawerSummary) {
    drawerSummary.addEventListener('click', (e: Event) => {
      const t = e.target as Element | null;
      if (t && t.closest('#btnOpenSettings')) return; // handled by toggleSettings
      if (t && t.closest('a, button')) return;         // logos/McCurdy button do their own thing
      e.preventDefault();
    });
  }
  void drawerToggleLeft;

  /* ---------------- Settings Lock: Hold CTRL 5s (Requirement 2) ---------------- */
  let isSettingsUnlocked = false;
  try {
    isSettingsUnlocked = sessionStorage.getItem('wbs_settings_unlocked') === 'true';
  } catch (_) {}

  let ctrlHeldStart: number | null = null;
  let ctrlHoldInterval: any = null;

  function updateLockUi() {
    if (isSettingsUnlocked) {
      if (lockOverlay) {
        lockOverlay.classList.add('unlocked');
        lockOverlay.classList.remove('holding-unlock');
      }
    } else {
      if (lockOverlay) {
        lockOverlay.classList.remove('unlocked');
        lockOverlay.classList.remove('holding-unlock');
      }
      if (lockProgressFill) lockProgressFill.style.width = '0%';
      if (lockCountdown) lockCountdown.textContent = '5.0s';
    }
  }

  updateLockUi();

  window.addEventListener('keydown', (e: any) => {
    if (e.key === 'Control' && !ctrlHeldStart && !isSettingsUnlocked) {
      ctrlHeldStart = performance.now();
      if (lockOverlay) lockOverlay.classList.add('holding-unlock');
      ctrlHoldInterval = setInterval(() => {
        if (!ctrlHeldStart) return;
        const elapsed = performance.now() - ctrlHeldStart;
        const pct = Math.min(100, (elapsed / 5000) * 100);
        const rem = Math.max(0, (5000 - elapsed) / 1000);
        if (lockProgressFill) lockProgressFill.style.width = pct + '%';
        if (lockCountdown) lockCountdown.textContent = rem.toFixed(1) + 's';

        if (elapsed >= 5000) {
          clearInterval(ctrlHoldInterval);
          ctrlHoldInterval = null;
          ctrlHeldStart = null;
          isSettingsUnlocked = true;
          try { sessionStorage.setItem('wbs_settings_unlocked', 'true'); } catch (_) {}
          if (lockCountdown) lockCountdown.textContent = 'UNLOCKED';
          if (lockProgressFill) lockProgressFill.style.width = '100%';
          setTimeout(() => {
            updateLockUi();
          }, 350);
        }
      }, 40);
    }
  });

  window.addEventListener('keyup', (e: any) => {
    if (e.key === 'Control' && ctrlHeldStart) {
      clearInterval(ctrlHoldInterval);
      ctrlHoldInterval = null;
      ctrlHeldStart = null;
      if (lockOverlay) lockOverlay.classList.remove('holding-unlock');
      if (lockProgressFill) lockProgressFill.style.width = '0%';
      if (lockCountdown) lockCountdown.textContent = '5.0s';
    }
  });

  /* ---------------- Pro Options Handlers (Requirements 4, 10, 13, 15, 21) ---------------- */
  if (selectVfdMetric) {
    selectVfdMetric.value = model.vfdMetric || 'lufs';
    selectVfdMetric.addEventListener('change', (e: any) => {
      model.vfdMetric = e.target.value;
      model.saveEEPROM();
    });
  }

  if (selectPeakSens) {
    selectPeakSens.addEventListener('change', (e: any) => {
      const val = parseFloat(e.target.value);
      audio.setPeakSensTrim(val);
    });
  }

  if (chkExtendedLed22 && podView) {
    const savedExtended = localStorage.getItem('xtm_extended_led22');
    const isExt = savedExtended !== null ? savedExtended === 'true' : true;
    chkExtendedLed22.checked = isExt;
    podView.setExtendedRange(isExt);

    chkExtendedLed22.addEventListener('change', (e: any) => {
      podView.setExtendedRange(e.target.checked);
      try { localStorage.setItem('xtm_extended_led22', e.target.checked); } catch (_) {}
    });
  }

  // Telemetry Logging & CSV Export (Requirement 13)
  const telemetryLog: any[] = [];
  const maxTelemetryEntries = 7200; // 2 hours of 1-second records
  let lastLogSec = 0;

  function recordTelemetry(levels: any, now: number) {
    if (now - lastLogSec < 1000) return;
    lastLogSec = now;
    const dbfs = levels.dbfs || [-60, -60, -60, -60];
    const lufs = levels.lufs || {};
    telemetryLog.push({
      time: new Date().toISOString(),
      chA: levels.hasAudio ? dbfs[0].toFixed(2) : '-60.00',
      chB: levels.hasAudio ? dbfs[1].toFixed(2) : '-60.00',
      sum: levels.hasAudio && typeof dbfs[2] === 'number' ? dbfs[2].toFixed(2) : '-60.00',
      diff: levels.hasAudio && typeof dbfs[3] === 'number' ? dbfs[3].toFixed(2) : '-60.00',
      lufsM: isFinite(lufs.m) ? lufs.m.toFixed(2) : '-60.00',
      lufsS: isFinite(lufs.s) ? lufs.s.toFixed(2) : '-60.00',
      lufsI: isFinite(lufs.i) ? lufs.i.toFixed(2) : '-60.00',
      lra: isFinite(lufs.lra) ? lufs.lra.toFixed(2) : '0.00',
      phase: (typeof levels.phaseCorrelation === 'number') ? levels.phaseCorrelation.toFixed(3) : '1.000'
    });
    if (telemetryLog.length > maxTelemetryEntries) telemetryLog.shift();
  }

  function exportTelemetryCsv() {
    if (telemetryLog.length === 0) {
      alert('Recording telemetry... Please ensure audio is playing and try again.');
      return;
    }
    let csv = 'Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,LUFS_Momentary,LUFS_ShortTerm,LUFS_Integrated,LRA_LU,Phase_Correlation\n';
    for (const r of telemetryLog) {
      csv += `${r.time},${r.chA},${r.chB},${r.sum},${r.diff},${r.lufsM},${r.lufsS},${r.lufsI},${r.lra},${r.phase}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `WBS-Mastering-Telemetry-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (btnExportCsvTest) {
    btnExportCsvTest.addEventListener('click', exportTelemetryCsv);
  }

  // Super High Transient Event Logger & CSV Export
  const transientLog: any[] = [];
  const maxTransientEntries = 5000;
  let prevDbfsA = -60, prevDbfsB = -60;

  function recordTransientEvent(levels: any) {
    if (!levels || !levels.hasAudio) return;
    const dbfs = levels.dbfs || [-60, -60, -60, -60];
    const curA = dbfs[0];
    const curB = dbfs[1];
    const curSum = typeof dbfs[2] === 'number' ? dbfs[2] : Math.max(curA, curB);
    const curDiff = typeof dbfs[3] === 'number' ? dbfs[3] : -60;
    const deltaA = curA - prevDbfsA;
    const deltaB = curB - prevDbfsB;
    prevDbfsA = curA;
    prevDbfsB = curB;

    // Fast transient trigger: sharp transient spike (delta >= 3.5 dB), high peak (>= -9 dBFS), or clipping
    if (deltaA >= 3.5 || deltaB >= 3.5 || curA >= -9.0 || curB >= -9.0) {
      transientLog.push({
        time: new Date().toISOString(),
        chA: curA.toFixed(2),
        chB: curB.toFixed(2),
        sum: curSum.toFixed(2),
        diff: curDiff.toFixed(2),
        deltaA: deltaA.toFixed(2),
        deltaB: deltaB.toFixed(2),
        lufsM: (levels.lufs && isFinite(levels.lufs.m)) ? levels.lufs.m.toFixed(2) : '-60.00'
      });
      if (transientLog.length > maxTransientEntries) transientLog.shift();
    }
  }

  function exportTransientCsv() {
    if (transientLog.length === 0) {
      alert('Recording transients... Please play dynamic audio with sharp transients and try again.');
      return;
    }
    let csv = 'Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,Delta_ChA_dB,Delta_ChB_dB,LUFS_Momentary\n';
    for (const r of transientLog) {
      csv += `${r.time},${r.chA},${r.chB},${r.sum},${r.diff},${r.deltaA},${r.deltaB},${r.lufsM}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `WBS-Super-Transient-Log-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const btnExportTransientLog = document.getElementById('btnExportTransientLog');
  if (btnExportTransientLog) {
    btnExportTransientLog.addEventListener('click', exportTransientCsv);
  }

  if (chkAutoExportHourly) {
    setInterval(() => {
      if (chkAutoExportHourly.checked && telemetryLog.length > 0) {
        exportTelemetryCsv();
      }
    }, 3600000); // Hourly timer
  }
  const drawerSourceBadge = document.getElementById('drawerSourceBadge');
  const selectDevice = document.getElementById('selectDevice') as HTMLSelectElement | null;
  const inputGainSlider = document.getElementById('inputGainSlider') as HTMLInputElement | null;
  const inputGainVal = document.getElementById('inputGainVal');
  const chkMonitor = document.getElementById('chkMonitor') as HTMLInputElement | null;
  const monitorVolSlider = document.getElementById('monitorVolSlider') as HTMLInputElement | null;
  const monitorVolVal = document.getElementById('monitorVolVal');
  const selectMeterStyle = document.getElementById('selectMeterStyle') as HTMLSelectElement | null;
  const selectToneCal = document.getElementById('selectToneCal') as HTMLSelectElement | null;
  const selectLampColor = document.getElementById('selectLampColor') as HTMLSelectElement | null;
  const chkHpf = document.getElementById('chkHpf') as HTMLInputElement | null;
  const chkTerm = document.getElementById('chkTerm') as HTMLInputElement | null;
  const chkPodHold = document.getElementById('chkPodHold') as HTMLInputElement | null;
  const selectPodDecay = document.getElementById('selectPodDecay') as HTMLSelectElement | null;
  const selectPpmBallistics = document.getElementById('selectPpmBallistics') as HTMLSelectElement | null;

  // Initial Sync
  audio.setReferenceLevel(model.getActiveReferenceLevel(), model.mode === 'D');
  audio.setHighPass(model.hp === 1);
  audio.setVuStyle(model.meterStyle);

  let isAudioStarted = false;
  let lastModeKey: string | null = null;

  function dismissPrompt() {}

  /* ---------------- Core Audio Mode Synchronizer ---------------- */
  // Whenever the input changes, step SENS up one value then back down one value
  // (exactly like pressing UP then DOWN) to re-prime the audio engine's level chain.
  let sensNudging = false;
  function nudgeSens(m: any) {
    if (sensNudging || !m.power || (m.mode !== 'A' && m.mode !== 'D')) return;
    const st = m.mode === 'A' ? m.a : m.d;
    const atTop = st.lvl >= 90;
    sensNudging = true;
    setTimeout(() => {
      if (atTop) m.pressDown(); else m.pressUp();
      setTimeout(() => {
        if (atTop) m.pressUp(); else m.pressDown();
        sensNudging = false;
      }, 180);
    }, 120);
  }

  async function syncAudioWithHardwareMode(m: any) {
    const before = lastModeKey;
    await syncAudioCore(m);
    if (lastModeKey !== before) {
      // Source just (re)connected: re-assert the reference level, then step SENS up/down.
      audio.setReferenceLevel(m.getActiveReferenceLevel(), m.mode === 'D');
      nudgeSens(m);
    }
  }

  async function syncAudioCore(m: any) {
  if (!window.audioReady) return;
    if (m.mode === 'SET') return;

    const modeKey = m.mode + ':' + (m.mode === 'A' ? m.a.src : (m.mode === 'D' ? m.d.src : m.s.pair[0]));
    if (modeKey === lastModeKey && isAudioStarted) return;
    lastModeKey = modeKey;
    isAudioStarted = true;
    dismissPrompt();

    if (m.mode === 'A') {
      // ANALOG MODE: Soundcard Mic / Line In / Loopback
      const devices = await audio.getAudioInputDevices();
      let targetId = selectDevice ? selectDevice.value : null;

      // Ensure naming based on A0/A1
      const micDevices = devices.filter(d => d.label.toLowerCase().includes('mic'));
      const lineDevices = devices.filter(d => d.label.toLowerCase().includes('line'));

      // If user toggled A0 vs A1 via front panel SOURCE button:
      if (m.a.src === 1) { // Line / Input 2
        targetId = (lineDevices.length > 0 ? lineDevices[0].deviceId : (devices.length > 1 ? devices[1].deviceId : null));
        if (selectDevice) selectDevice.value = targetId || '';
      } else if (m.a.src === 0) { // Mic / Input 1
        targetId = (micDevices.length > 0 ? micDevices[0].deviceId : (devices.length > 0 ? devices[0].deviceId : null));
        if (selectDevice) selectDevice.value = targetId || '';
      }

      if (drawerSourceBadge) {
        const curName = selectDevice?.options[selectDevice.selectedIndex]?.text || 'Soundcard Input';
        drawerSourceBadge.textContent = 'Connecting: ' + curName + '...';
        drawerSourceBadge.style.color = '#ffd152';
      }

      try {
        await audio.connectSoundCard(targetId);
        audio.setInputTrim(m.a.lvl - 64);
      } catch (err) {
        console.warn('Could not connect soundcard:', err);
        if (drawerSourceBadge) {
          drawerSourceBadge.textContent = 'Source Error: ' + ((err as any)?.message || 'Failed to open soundcard');
          drawerSourceBadge.style.color = '#ff4d4f';
        }
      }
    } else if (m.mode === 'D') {
      // DIGITAL MODE: D1 = Computer Audio Output, D0 = Digital 1 kHz Tone
      if (m.d.src === 1) {
        if (drawerSourceBadge) {
          drawerSourceBadge.textContent = 'Source: Computer Audio Output';
        }
        const ok = await audio.connectSystemAudio();
        if (!ok) {
          // Gracefully fallback to Reference Tone generator if user cancels or permission denied
          m.d.src = 0;
          if (drawerSourceBadge) {
            const cal = m.toneCalLevels[m.toneCalIdx];
            drawerSourceBadge.textContent = `Source: 1 kHz Digital Reference Tone (${cal >= 0 ? '+' : ''}${cal} dBFS)`;
          }
          audio.setToneCalibration(m.toneCalLevels[m.toneCalIdx]);
          audio.startTestGenerator('sine1k');
          m.flash('1k TONE ');
        }
      } else {
        if (drawerSourceBadge) {
          const cal = m.toneCalLevels[m.toneCalIdx];
          drawerSourceBadge.textContent = `Source: 1 kHz Digital Reference Tone (${cal >= 0 ? '+' : ''}${cal} dBFS)`;
        }
        audio.setToneCalibration(m.toneCalLevels[m.toneCalIdx]);
        audio.startTestGenerator('sine1k');
      }
    } else if (m.mode === 'S') {
      // TEST OSCILLATOR MODE
      const waves = ['', 'sine1k', 'pink', 'sine400', 'sweep'];
      const waveNames = ['', '1 kHz Sine Tone', 'Pink Noise', '400 Hz Lineup Tone', '20Hz-20kHz Sweep'];
      const wave = waves[m.s.pair[0]] || 'sine1k';
      const waveName = waveNames[m.s.pair[0]] || '1 kHz Sine Tone';

      if (drawerSourceBadge) {
        drawerSourceBadge.textContent = 'Source: ' + waveName;
      }
      audio.setToneCalibration(m.toneCalLevels[m.toneCalIdx]);
      audio.startTestGenerator(wave);
    }
  }

  model.onChange = (m: any) => {
    const isDigital = (m.mode === 'D');
    audio.setReferenceLevel(m.getActiveReferenceLevel(), isDigital);
    audio.setHighPass(m.hp === 1);
    audio.setVuStyle(m.meterStyle);
    const cal = m.toneCalLevels[m.toneCalIdx];
    audio.setToneCalibration(cal);

    if (selectToneCal) selectToneCal.value = String(cal);
    if (chkHpf) chkHpf.checked = m.hp === 1;
    if (chkTerm) chkTerm.checked = m.term === 1;
    if (selectLampColor) selectLampColor.value = m.dialLamp;
    if (selectMeterStyle) selectMeterStyle.value = m.meterStyle;

    if (drawerSourceBadge && m.mode === 'S') {
      const p = m.s.pair[0] ?? 1;
      if (p === 1 || p === 3) {
        const freq = p === 3 ? '400 Hz' : '1 kHz';
        drawerSourceBadge.textContent = `Source: ${freq} Digital Lineup Tone (${cal >= 0 ? '+' : ''}${cal} dBFS)`;
      }
    }

    syncAudioWithHardwareMode(m);
    if (dbfsView) configManager.saveConfig(m, audio, podView, dbfsView);
  };

  /* ---------------- Front Panel Interactive Buttons ---------------- */
  view.onButtonPressed = async (btnName) => {
    dismissPrompt();
    if (btnName === 'MODE') {
      model.pressMode();
    } else if (btnName === 'SOURCE') {
      model.pressSource();
    } else if (btnName === 'DOWN') {
      model.pressDown();
    } else if (btnName === 'UP') {
      model.pressUp();
    }
    syncAudioWithHardwareMode(model);
  };

  view.onButtonReleased = () => {};

  // One-click anywhere to initialize audio if not yet running
  document.addEventListener('pointerdown', async (e: any) => {
    if (!isAudioStarted && !e.target.closest('.aux-drawer')) {
      window.audioReady = true;
      if (window.audioContext && window.audioContext.state === "suspended") {
        await window.audioContext.resume();
      }
      await syncAudioWithHardwareMode(model);
    }
  }, { once: true, passive: true });

  /* ---------------- Audio Engine Status & Device Callbacks ---------------- */
  audio.onStatusChange = (status) => {
    if (!drawerSourceBadge) return;
    if (status.type === 'soundcard') {
      drawerSourceBadge.textContent = 'Source: ' + (status.label || 'Soundcard Input');
      drawerSourceBadge.style.color = '#7df9ff';
    } else if (status.type === 'system') {
      drawerSourceBadge.textContent = 'Source: ' + (status.label || 'Computer System Audio');
      drawerSourceBadge.style.color = '#7df9ff';
    } else if (status.type === 'test') {
      drawerSourceBadge.textContent = 'Source: ' + status.label;
      drawerSourceBadge.style.color = '#ffd152';
    } else if (status.type === 'error') {
      drawerSourceBadge.textContent = 'Source Error: ' + (status.error || 'Connection Failed');
      drawerSourceBadge.style.color = '#ff4d4f';
    } else if (status.type === 'disconnected') {
      drawerSourceBadge.textContent = 'Source: Audio Stopped';
      drawerSourceBadge.style.color = '#888';
    }
  };

  audio.onDevicesChange = (devices, activeId) => {
    if (!selectDevice) return;
    const currentVal = activeId || selectDevice.value;
    selectDevice.innerHTML = '<option value="">Default Soundcard Input</option>';
    devices.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || `Audio Interface ${i + 1}`;
      if (d.deviceId === currentVal) opt.selected = true;
      selectDevice.appendChild(opt);
    });
  };

  /* ---------------- Audio Device Scanning ---------------- */
  async function refreshDevices() {
    if (!selectDevice) return;
    const currentVal = selectDevice.value || audio.activeDeviceId;
    const devices = await audio.getAudioInputDevices();
    selectDevice.innerHTML = '<option value="">Default Soundcard Input</option>';
    devices.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || `Audio Interface ${i + 1}`;
      if (d.deviceId === currentVal) opt.selected = true;
      selectDevice.appendChild(opt);
    });
  }

  try {
    await refreshDevices();
  } catch (_) {}

  if (navigator.mediaDevices && navigator.mediaDevices.ondevicechange !== undefined) {
    navigator.mediaDevices.ondevicechange = refreshDevices;
  }

  /* ---------------- Auxiliary Drawer Listeners ---------------- */
  if (selectDevice) {
    selectDevice.addEventListener('change', async () => {
      const selectedId = selectDevice.value || null;
      dismissPrompt();
      isAudioStarted = true;

      // Ensure model is set to Analog Soundcard Input mode
      if (model.mode !== 'A') {
        model.mode = 'A';
        model.a.src = 0;
        model.saveEEPROM();
        model.notify();
      }

      lastModeKey = 'A:0';

      const optText = selectDevice.options[selectDevice.selectedIndex]?.text || 'Soundcard Input';
      if (drawerSourceBadge) {
        drawerSourceBadge.textContent = 'Connecting: ' + optText + '...';
        drawerSourceBadge.style.color = '#ffd152';
      }

      try {
        await audio.connectSoundCard(selectedId);
        model.flash('CARD IN');
        audio.setReferenceLevel(model.getActiveReferenceLevel(), (model.mode as string) === 'D');
        nudgeSens(model);
      } catch (err) {
        console.error('Failed to connect selected device:', err);
        if (drawerSourceBadge) {
          drawerSourceBadge.textContent = 'Device Error: ' + ((err as any)?.message || 'Cannot access device');
          drawerSourceBadge.style.color = '#ff4d4f';
        }
      }
    });
  }

  if (inputGainSlider) {
    inputGainSlider.addEventListener('input', (e: any) => {
      const val = parseFloat(e.target.value);
      audio.setInputTrim(val);
      if (inputGainVal) inputGainVal.textContent = (val > 0 ? '+' : '') + val.toFixed(1) + ' dB';
    });
  }

  if (chkMonitor) {
    chkMonitor.addEventListener('change', (e: any) => {
      audio.setMonitor(e.target.checked);
    });
  }

  if (monitorVolSlider) {
    monitorVolSlider.addEventListener('input', (e: any) => {
      const val = parseFloat(e.target.value);
      audio.setMonitorVolume(val);
      if (monitorVolVal) monitorVolVal.textContent = Math.round(val * 100) + '%';
    });
  }

  if (selectMeterStyle) {
    selectMeterStyle.value = model.meterStyle;
    selectMeterStyle.addEventListener('change', (e: any) => {
      model.meterStyle = e.target.value;
      audio.setVuStyle(e.target.value);
      model.saveEEPROM();
      view.isBuilt = false;
    });
  }

  const selectVuBallistics = document.getElementById('selectVuBallistics') as HTMLSelectElement | null;
  if (selectVuBallistics) {
    selectVuBallistics.value = audio.vuBallisticPreset || 'standard_vu';
    selectVuBallistics.addEventListener('change', (e: any) => {
      audio.setVuBallisticPreset(e.target.value);
      if (dbfsView) configManager.saveConfig(model, audio, podView, dbfsView);
    });
  }

  if (selectToneCal) {
    selectToneCal.innerHTML = '';
    for (let db = 0; db >= -60; db--) {
      const opt = document.createElement('option');
      opt.value = String(db);
      let desc = `${db} dBFS`;
      if (db === -18) desc += ' (0 VU ANSI C16.5 / EBU Reference - Default)';
      else if (db === 0) desc += ' (Peak Full Scale Ceiling)';
      else if (db === -6) desc += ' (High Peak Alignment)';
      else if (db === -12) desc += ' (Digital Nominal)';
      else if (db === -14) desc += ' (AES / Streaming Target)';
      else if (db === -20) desc += ' (0 VU SMPTE RP155 Reference)';
      else if (db === -24) desc += ' (EBU R128 / ATSC A/85)';
      opt.textContent = desc;
      selectToneCal.appendChild(opt);
    }
    selectToneCal.value = String(model.toneCalLevels[model.toneCalIdx] ?? -18);
    selectToneCal.addEventListener('change', (e: any) => {
      const cal = parseFloat(e.target.value);
      audio.setToneCalibration(cal);
      const idx = model.toneCalLevels.indexOf(cal);
      if (idx !== -1) {
        model.toneCalIdx = idx;
        model.saveEEPROM();
        if (model.mode === 'S' && (model.s.pair[0] === 1 || model.s.pair[0] === 3)) {
          const prefix = model.s.pair[0] === 3 ? '400 ' : '1k ';
          model.flash((prefix + (cal >= 0 ? '+' : '') + cal + 'dB').padEnd(8).substring(0, 8));
        }
      }
    });
  }

  // Each page mode keeps its own VU lamp: dark (Ward-Beck) keeps the saved choice,
  // McCurdy (light) mode defaults to vintage parchment but may be switched to amber etc.
  const lampKey = () => document.body.classList.contains('theme-mccurdy') ? 'xtm.lamp.mccurdy' : 'xtm.lamp.dark';
  const lsGet = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
  const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };
  const applyModeLamp = () => {
    const mc = document.body.classList.contains('theme-mccurdy');
    const lamp = lsGet(lampKey()) || (mc ? 'parchment' : (model.dialLamp || 'amber'));
    if (lamp !== model.dialLamp) {
      model.dialLamp = lamp;
      view.isBuilt = false;
    }
    if (selectLampColor) selectLampColor.value = model.dialLamp;
  };
  if (!lsGet('xtm.lamp.dark')) lsSet('xtm.lamp.dark', model.dialLamp || 'amber');
  applyModeLamp();
  new MutationObserver(applyModeLamp).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (selectLampColor) {
    selectLampColor.value = model.dialLamp || 'amber';
    selectLampColor.addEventListener('change', (e: any) => {
      model.dialLamp = e.target.value;
      lsSet(lampKey(), model.dialLamp);
      model.saveEEPROM();
      view.isBuilt = false;
    });
  }

  if (chkHpf) {
    chkHpf.addEventListener('change', (e: any) => {
      model.hp = e.target.checked ? 1 : 0;
      audio.setHighPass(e.target.checked);
      model.saveEEPROM();
      model.notify();
    });
  }

  if (chkTerm) {
    chkTerm.addEventListener('change', (e: any) => {
      model.term = e.target.checked ? 1 : 0;
      model.saveEEPROM();
      model.notify();
    });
  }

  const selectPodScale = document.getElementById('selectPodScale') as HTMLSelectElement | null;
  if (selectPodScale && podView) {
    selectPodScale.value = podView.scaleMode;
    selectPodScale.addEventListener('change', (e: any) => {
      podView.scaleMode = e.target.value;
    });
  }

  if (chkPodHold) {
    chkPodHold.addEventListener('change', (e: any) => {
      podView.dip.BS1 = e.target.checked ? 1 : 0;
    });
  }

  if (selectPpmBallistics) {
    selectPpmBallistics.value = audio.ppmBallisticPreset || 'type2';
    view.ppmStandard = selectPpmBallistics.value;
    view.isBuilt = false;
    selectPpmBallistics.addEventListener('change', (e: any) => {
      audio.setPpmType(e.target.value);
      view.ppmStandard = e.target.value;   // PPM face follows the chosen standard
      view.isBuilt = false;
      if (dbfsView) configManager.saveConfig(model, audio, podView, dbfsView);
    });
  }

  if (selectPodDecay) {
    selectPodDecay.value = podView.decayType || 'type2';
    selectPodDecay.addEventListener('change', (e: any) => {
      podView.setDecay(e.target.value);
      if (dbfsView) configManager.saveConfig(model, audio, podView, dbfsView);
    });
  }

  if (dbfsView) {
    dbfsView.onClear = () => {
      audio.resetLoudness();
    };
  }

  const selectScopeLogWarp = document.getElementById('selectScopeLogWarp') as HTMLSelectElement | null;
  if (selectScopeLogWarp && dbfsView) {
    selectScopeLogWarp.addEventListener('change', (e: any) => {
      dbfsView.setBeta(parseFloat(e.target.value));
    });
  }

  const selectTimeScale = document.getElementById('selectTimeScale') as HTMLSelectElement | null;
  if (selectTimeScale && dbfsView) {
    selectTimeScale.value = dbfsView.timeMode;
    selectTimeScale.addEventListener('change', (e: any) => {
      dbfsView.setTimeMode(e.target.value);
    });
    dbfsView.onTimeModeChange = (mode) => {
      selectTimeScale.value = mode;
      if (dbfsView) configManager.saveConfig(model, audio, podView, dbfsView);
    };
  }

  /* ---------------- Storage / Cookie Consent & Profile (.WBS) Handlers ---------------- */
  const consentBanner = document.getElementById('wbsConsentBanner');
  const btnConsentAllow = document.getElementById('btnConsentAllow');
  const btnConsentSession = document.getElementById('btnConsentSession');
  const btnResetConsent = document.getElementById('btnResetConsent');
  const consentStatusText = document.getElementById('consentStatusText');

  function updateConsentUi() {
    const state = configManager.getConsent();
    if (consentStatusText) {
      if (state === 'allowed') {
        consentStatusText.textContent = 'ALLOWED (Persistent Memory)';
        consentStatusText.style.color = '#22c55e';
      } else if (state === 'session_only') {
        consentStatusText.textContent = 'SESSION ONLY';
        consentStatusText.style.color = '#eab308';
      } else {
        consentStatusText.textContent = 'PROMPTING...';
        consentStatusText.style.color = '#38bdf8';
      }
    }
    if (consentBanner) {
      consentBanner.style.display = state === 'prompt' ? 'flex' : 'none';
    }
  }

  if (btnConsentAllow) {
    btnConsentAllow.addEventListener('click', () => {
      configManager.setConsent('allowed');
      updateConsentUi();
      if (dbfsView) configManager.saveConfig(model, audio, podView, dbfsView);
    });
  }

  if (btnConsentSession) {
    btnConsentSession.addEventListener('click', () => {
      configManager.setConsent('session_only');
      updateConsentUi();
    });
  }

  if (btnResetConsent) {
    btnResetConsent.addEventListener('click', () => {
      configManager.resetConsent();
      updateConsentUi();
    });
  }

  updateConsentUi();

  // Load Saved Configuration Profile if present
  if (dbfsView) {
    configManager.loadSavedConfig(model, audio, podView, dbfsView);
  }

  // Export .WBS Profile (YAML)
  const btnExportWbs = document.getElementById('btnExportWbs');
  if (btnExportWbs && dbfsView) {
    btnExportWbs.addEventListener('click', () => {
      configManager.downloadWbsFile(model, audio, podView, dbfsView);
      model.flash('SAVED.WBS', 1400);
    });
  }

  // Import .WBS Profile (YAML)
  const btnImportWbs = document.getElementById('btnImportWbs');
  const inputImportWbs = document.getElementById('inputImportWbs') as HTMLInputElement | null;
  if (btnImportWbs && inputImportWbs && dbfsView) {
    btnImportWbs.addEventListener('click', () => {
      inputImportWbs.click();
    });

    inputImportWbs.addEventListener('change', async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const cfg = configManager.parseWbsYaml(text);
        configManager.applyConfig(cfg, model, audio, podView, dbfsView);
        await syncAudioWithHardwareMode(model);
      } catch (err: any) {
        console.error('WBS configuration import failed:', err);
        alert('Error importing .WBS configuration: ' + (err?.message || 'Invalid format'));
        model.flash('CFG ERR ', 1600);
      } finally {
        inputImportWbs.value = '';
      }
    });
  }

  // Auto-save on all setting controls
  const autoSave = () => {
    if (dbfsView) configManager.saveConfig(model, audio, podView, dbfsView);
  };

  [inputGainSlider, monitorVolSlider, selectPeakSens].forEach(ctrl => {
    ctrl?.addEventListener('change', autoSave);
  });
  [chkMonitor, chkExtendedLed22, chkPodHold, selectPodDecay, selectPpmBallistics, selectVuBallistics, selectScopeLogWarp].forEach(ctrl => {
    ctrl?.addEventListener('change', autoSave);
  });

  // Keyboard Shortcuts (M: Mode, S: Source, Up/Down: Trim, H: Setup)
  window.addEventListener('keydown', (e: any) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const k = e.key.toUpperCase();
    if (k === 'M') {
      model.pressMode();
      syncAudioWithHardwareMode(model);
    } else if (k === 'S') {
      model.pressSource();
      syncAudioWithHardwareMode(model);
    } else if (k === 'ARROWDOWN' || k === 'D') {
      model.pressDown();
    } else if (k === 'ARROWUP' || k === 'U') {
      model.pressUp();
    } else if (k === 'H') {
      model.holdMode();
    } else if (k === 'P') {
      model.togglePower();
    }
  });

  // PWA/Update checker
  async function checkForUpdates() {
    try {
      const response = await fetch('/manifest.json?cache=' + Date.now());
      const manifest = await response.json();
      if (manifest.version !== '1.1.0') {
        if (confirm('A new update is available. Refresh to update?')) {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error('Update check failed', e);
    }
  }
  setInterval(checkForUpdates, 3600000); // Hourly check

  const footer = document.querySelector('footer');
  if (footer) {
    const ver = document.createElement('div');
    ver.textContent = '2026.11.18.19.38';
    ver.style.fontSize = '10px';
    ver.style.color = '#777';
    footer.appendChild(ver);
  }

  /* ---------------- PWA "Install Page as App" Handler ---------------- */
  if ('serviceWorker' in navigator) {
    // Cache-first: the stored copy loads instantly; sw.js compares with the server in the
    // background and stores any new version for the next load.
    navigator.serviceWorker.addEventListener('message', (ev: MessageEvent) => {
      if (ev.data?.type === 'xtm-update-ready') console.info('XTM: new version stored; it will load next time.');
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  }

  const pwaBanner = document.getElementById('pwaInstallBanner');
  const btnPwaInstall = document.getElementById('btnPwaInstall');
  const btnPwaDismiss = document.getElementById('btnPwaDismiss');
  const pwaSubText = document.getElementById('pwaSubText');

  let deferredInstallPrompt: any = null;
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || (window.innerWidth <= 840);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  if (pwaBanner && !isStandalone) {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      pwaBanner.style.display = 'block';
    });

    // Android/desktop Chrome: the banner appears only once the browser fires
    // beforeinstallprompt (above), so "Install App" always installs automatically.
    // iOS Safari has no install API, so it gets the Add-to-Home-Screen steps instead.
    if (isMobile && isIos) {
      if (pwaSubText) {
        pwaSubText.innerHTML = 'Tap the Share icon <strong>[⎋]</strong> in Safari and choose <strong>Add to Home Screen</strong>';
      }
      if (btnPwaInstall) {
        btnPwaInstall.textContent = 'How to Install';
        btnPwaInstall.addEventListener('click', () => {
          alert('To install this app on iOS:\n1. Tap the Share button in Safari (box with up arrow).\n2. Scroll down and tap "Add to Home Screen".');
        });
      }
      pwaBanner.style.display = 'block';
    }
    window.addEventListener('appinstalled', () => {
      pwaBanner.style.display = 'none';
      deferredInstallPrompt = null;
    });

    if (btnPwaInstall && !isIos) {
      btnPwaInstall.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          const { outcome } = await deferredInstallPrompt.userChoice;
          if (outcome === 'accepted') {
            pwaBanner.style.display = 'none';
          }
          deferredInstallPrompt = null;
        } else {
          pwaBanner.style.display = 'none'; // no install offer available (already installed / unsupported)
        }
      });
    }

    if (btnPwaDismiss) {
      btnPwaDismiss.addEventListener('click', () => {
        pwaBanner.style.display = 'none';
      });
    }
  }

  /* ---------------- 60 FPS Direct Hardware Loop ---------------- */
  let frameCount = 0;
  let lastTime = performance.now();
  const fpsEl = document.getElementById('fpsDisplay');

  function frame(now: number) {
    // =========================================================================
    // STEP 1: FETCH DATA & UPDATE NEEDLES FIRST (TOP PRIORITY - ZERO DELAY)
    // =========================================================================
    const levels = (audio && audio.getLevels) ? audio.getLevels() : (audio?.currentLevels || {
      vu: [0, 0],
      ppm: [-0.12, -0.12],
      vuDb: [-Infinity, -Infinity],
      ppmDb: [-Infinity, -Infinity],
      phaseCorrelation: 1.0,
      phaseLed: -1,
      peak: [false, false],
      hasAudio: false
    });

    // 100% Guaranteed: Needles process data and commit GPU matrix FIRST
    view.updateNeedles(levels, model.power, model.meterStyle === 'sifam');

    // =========================================================================
    // STEP 2: SECONDARY DISPLAY & CONTROL ELEMENTS
    // =========================================================================
    model.isIdle = !levels.hasAudio;
    view.renderSecondary(model, levels);
    podView.render(model, levels);
    if (dbfsView) dbfsView.render(model, levels);

    // Requirement 13: Record Telemetry for CSV export
    recordTelemetry(levels, now);
    recordTransientEvent(levels);

    // Requirement 11: Dynamic Ambient Background Glow for LUFS Levels
    // > -24 LUFS: Green glow, > -18 LUFS: Orange glow, >= -12 LUFS: Red glow & red background
    if (viewportEl) {
      const curLufs = (levels && levels.lufs && typeof levels.lufs.m === 'number') ? levels.lufs.m : -60;
      if (levels.hasAudio && isFinite(curLufs)) {
        if (curLufs >= -12) {
          viewportEl.className = 'console-viewport lufs-glow-red';
        } else if (curLufs >= -18) {
          viewportEl.className = 'console-viewport lufs-glow-orange';
        } else if (curLufs > -24) {
          viewportEl.className = 'console-viewport lufs-glow-green';
        } else {
          viewportEl.className = 'console-viewport';
        }
      } else {
        viewportEl.className = 'console-viewport';
      }
    }

    // =========================================================================
    // STEP 3: TELEMETRY & FPS DIAGNOSTICS
    // =========================================================================
    frameCount++;
    if (now - lastTime >= 500) {
      const fps = (frameCount * 1000) / (now - lastTime);
      if (fpsEl) fpsEl.textContent = fps.toFixed(1) + ' FPS';
      frameCount = 0;
      lastTime = now;
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
