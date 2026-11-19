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
  nudgeSens(m: any): void;
  syncAudioWithHardwareMode(m: any): Promise<void>;
}

export function createAudioSync(ctx: AppContext, refs: DrawerControls): AudioSync {
  const { audio } = ctx;
  const { selectDevice, drawerSourceBadge } = refs;

  const state: AudioSync = {
    isAudioStarted: false,
    lastModeKey: null,
    nudgeSens,
    syncAudioWithHardwareMode
  };

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
    const before = state.lastModeKey;
    await syncAudioCore(m);
    if (state.lastModeKey !== before) {
      // Source just (re)connected: re-assert the reference level, then step SENS up/down.
      audio.setReferenceLevel(m.getActiveReferenceLevel(), m.mode === 'D');
      nudgeSens(m);
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

  return state;
}
