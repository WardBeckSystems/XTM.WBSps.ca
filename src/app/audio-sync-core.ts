/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Audio hardware routing core: handles device enumeration, analog/digital/generator
 * fallback routing, and drawer status updates.
 */

import type { DrawerControls } from './dom-refs';

export interface AudioRoutingState {
  lastModeKey: string | null;
  isAudioStarted: boolean;
}

export async function syncAudioCore(
  audio: any,
  m: any,
  refs: DrawerControls,
  state: AudioRoutingState
): Promise<void> {
  if (!window.audioReady) return;
  if (m.mode === 'SET') return;

  const { selectDevice, drawerSourceBadge } = refs;
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

    if (targetId === '__WBS_LINUX_HOST__') {
      if (drawerSourceBadge) {
        drawerSourceBadge.textContent = 'Source: 🐧 Linux Host (PipeWire & MXL Bridge · Banner-Free)';
        drawerSourceBadge.style.color = '#38bdf8';
      }
      return;
    }

    // Ensure naming based on A0/A1 only if user hasn't explicitly chosen a device or targetId is empty
    const micDevices = devices.filter((d: MediaDeviceInfo) => d.label.toLowerCase().includes('mic'));
    const lineDevices = devices.filter((d: MediaDeviceInfo) => d.label.toLowerCase().includes('line'));

    if (!targetId) {
      if (m.a.src === 1) { // Line / Input 2
        targetId = (lineDevices.length > 0 ? lineDevices[0].deviceId : (devices.length > 1 ? devices[1].deviceId : devices[0].deviceId));
      } else { // Mic / Input 1
        targetId = (micDevices.length > 0 ? micDevices[0].deviceId : devices[0].deviceId);
      }
      if (selectDevice) selectDevice.value = targetId || '';
    }

    const activeOpt = selectDevice?.options[selectDevice.selectedIndex];
    const curName = activeOpt?.text || devices.find((d: MediaDeviceInfo) => d.deviceId === targetId)?.label || 'Soundcard Input';

    if (drawerSourceBadge) {
      drawerSourceBadge.textContent = 'Source: ' + curName;
      drawerSourceBadge.style.color = '#7df9ff';
    }

    try {
      await audio.connectSoundCard(targetId);
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
      const sysMode = (typeof localStorage !== 'undefined' && localStorage.getItem('xtm.sysaudio.surface')) || 'browser';
      let connected = audio.sourceType === 'system' && !!audio.stream && audio.stream.active;

      // Auto / OS loopback: try native OS audio bridge first if explicitly configured
      if (!connected && (sysMode === 'loopback' || sysMode === 'auto')) {
        try {
          const devices = await audio.getAudioInputDevices();
          const loopback = devices.find((d: MediaDeviceInfo) =>
            /monitor|loopback|stereo mix|what u hear|blackhole|soundflower|cable output|virtual audio|stream monitor|xtm.*bridge/i.test(d.label)
          );
          if (loopback) {
            if (drawerSourceBadge) {
              drawerSourceBadge.textContent = `Source: OS Audio Bridge (${loopback.label})`;
              drawerSourceBadge.style.color = '#38bdf8';
            }
            connected = await audio.connectSoundCard(loopback.deviceId);
          }
        } catch (_) {}
      }

      // Fall back to getDisplayMedia
      if (!connected) {
        const surface = (sysMode === 'monitor') ? 'monitor' : 'browser';
        const ok = await audio.connectSystemAudio(surface);
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
