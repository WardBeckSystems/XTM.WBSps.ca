/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Model ↔ engine/drawer bindings: initial sync, model.onChange, front-panel buttons, audio unlock. */

import { type AppContext, saveAppConfig } from './app-context';
import type { DrawerControls } from './dom-refs';
import type { AudioSync } from './audio-sync';

/** Push the model's current reference level, HPF and VU style to the audio engine. */
export function applyInitialAudioState(ctx: AppContext): void {
  const { model, audio } = ctx;
  audio.setReferenceLevel(model.getActiveReferenceLevel(), model.mode === 'D');
  audio.setHighPass(model.hp === 1);
  audio.setVuStyle(model.meterStyle);
}

export function bindModelChange(ctx: AppContext, refs: DrawerControls, sync: AudioSync): void {
  const { model, audio } = ctx;
  const { selectToneCal, chkHpf, chkTerm, selectLampColor, selectMeterStyle, drawerSourceBadge } = refs;

  model.onChange = (m: any) => {
    const isDigital = (m.mode === 'D');
    audio.setReferenceLevel(m.getActiveReferenceLevel(), isDigital);
    audio.setInputTrim(m.a.lvl - 64);
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

    sync.syncAudioWithHardwareMode(m);
    saveAppConfig(ctx, m);
  };
}

/** Front panel interactive buttons. */
export function bindFrontPanel(ctx: AppContext, sync: AudioSync): void {
  const { model, view } = ctx;
  view.onButtonPressed = async (btnName) => {
    if (btnName === 'MODE') {
      model.pressMode();
    } else if (btnName === 'SOURCE') {
      model.pressSource();
    } else if (btnName === 'DOWN') {
      model.pressDown();
    } else if (btnName === 'UP') {
      model.pressUp();
    } else if (btnName.startsWith('INPUT_')) {
      const inputNum = parseInt(btnName.replace('INPUT_', ''), 10);
      if (inputNum >= 1 && inputNum <= 4) {
        model.setInput(inputNum);
      }
    }
    sync.syncAudioWithHardwareMode(model);
  };

  view.onButtonReleased = () => {};
}

/** One-click anywhere (outside the drawer) to initialise audio if not yet running. */
export function bindAudioUnlock(ctx: AppContext, sync: AudioSync): void {
  const { model } = ctx;
  document.addEventListener('pointerdown', async (e: any) => {
    if (!sync.isAudioStarted && !e.target.closest('.aux-drawer')) {
      window.audioReady = true;
      if (window.audioContext && window.audioContext.state === "suspended") {
        await window.audioContext.resume();
      }
      await sync.syncAudioWithHardwareMode(model);
    }
  }, { once: true, passive: true });
}
