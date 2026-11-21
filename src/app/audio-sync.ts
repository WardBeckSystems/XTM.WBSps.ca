/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Core audio mode synchroniser: routes the front-panel MODE/SOURCE selection to the
 * audio engine, re-asserts the reference level and nudges SENS after an input change.
 */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';

export interface AudioSync {
  /** True once audio routing has been started (first gesture or device pick). */
  isAudioStarted: boolean;
  /** Last routed "mode:source" key; a change means the source (re)connected. */
  lastModeKey: string | null;
  syncAudioWithHardwareMode(m: any): Promise<void>;
}

export function createAudioSync(ctx: AppContext, refs: DrawerControls): AudioSync {
  const { audio } = ctx;
  const { selectDevice, drawerSourceBadge } = refs;

  const state: AudioSync = {
    isAudioStarted: false,
    lastModeKey: null,
    syncAudioWithHardwareMode
  };

  async function syncAudioWithHardwareMode(m: any) {
    const before = state.lastModeKey;
    await syncAudioCore(m);
    if (state.lastModeKey !== before) {
      // Source just (re)connected: re-assert the reference level
      audio.setReferenceLevel(m.getActiveReferenceLevel(), m.mode === 'D');
    }
  }

  async function syncAudioCore(m: any) {
    if (!window.audioReady) return;
    if (m.mode === 'SET') return;

    const modeKey = m.mode + ':' + (m.mode === 'A' ? m.a.src : (m.mode === 'D' ? m.d.src : m.s.pair[0]));
    if (modeKey === state.lastModeKey && state.isAudioStarted) return;
    state.lastModeKey = modeKey;
    state.isAudioStarted = true;

    if (m.mode === 'A') {
      // ANALOG MODE: Soundcard Mic / Line In / Loopback
      let devices: MediaDeviceInfo[] = [];
      try {
        devices = await audio.getAudioInputDevices();
      } catch (_) {
        devices = [];
      }

      // If system has no audio input devices detected, gracefully run internal reference tone without console error spam
      if (!devices || devices.length === 0) {
        if (drawerSourceBadge) {
          drawerSourceBadge.textContent = 'Source: Calibrated Internal Tone (No Audio Input Devices Detected)';
          drawerSourceBadge.style.color = '#38bdf8';
        }
        audio.setToneCalibration(-18);
        audio.startTestGenerator('sine1k');
        return;
      }

      let targetId = selectDevice ? selectDevice.value : null;

      // Ensure naming based on A0/A1 only if user hasn't explicitly chosen a device or targetId is empty
      const micDevices = devices.filter(d => d.label.toLowerCase().includes('mic'));
      const lineDevices = devices.filter(d => d.label.toLowerCase().includes('line'));

      if (!targetId) {
        if (m.a.src === 1) { // Line / Input 2
          targetId = (lineDevices.length > 0 ? lineDevices[0].deviceId : (devices.length > 1 ? devices[1].deviceId : devices[0].deviceId));
        } else { // Mic / Input 1
          targetId = (micDevices.length > 0 ? micDevices[0].deviceId : devices[0].deviceId);
        }
        if (selectDevice) selectDevice.value = targetId || '';
      }

      const activeOpt = selectDevice?.options[selectDevice.selectedIndex];
      const curName = activeOpt?.text || devices.find(d => d.deviceId === targetId)?.label || 'Soundcard Input';

      if (drawerSourceBadge) {
        drawerSourceBadge.textContent = 'Source: ' + curName;
        drawerSourceBadge.style.color = '#7df9ff';
      }

      try {
        await audio.connectSoundCard(targetId);
        audio.setInputTrim(m.a.lvl - 64);
      } catch (err: any) {
        const isNotFound = err?.name === 'NotFoundError' || err?.message?.includes('not found') || err?.message?.includes('detected');
        if (!isNotFound) {
          console.warn('Could not connect soundcard:', err);
        }
        if (drawerSourceBadge) {
          drawerSourceBadge.textContent = isNotFound
            ? 'Source: Calibrated Internal Tone (No Audio Input Devices)'
            : 'Source Error: ' + (err?.message || 'Failed to open soundcard');
          drawerSourceBadge.style.color = isNotFound ? '#38bdf8' : '#ff4d4f';
        }
        // Fall back gracefully to internal calibrated test tone so meters and visualizers remain active
        audio.setToneCalibration(-18);
        audio.startTestGenerator('sine1k');
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

  return state;
}
