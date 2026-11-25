/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Model ↔ engine/drawer bindings: initial sync, model.onChange, front-panel buttons, audio unlock. */

import { type AppContext, saveAppConfig } from './app-context';
import type { DrawerControls } from './dom-refs';
import type { AudioSync } from './audio-sync';
import { getMeterKey } from './meter-style';
import { assignInput, openInputPicker, selectAssignedInput } from './input-assign';

/** Push the model's current reference level, HPF and VU style to the audio engine. */
export function applyInitialAudioState(ctx: AppContext): void {
  const { model, audio } = ctx;
  audio.setReferenceLevel(model.getActiveReferenceLevel(), model.mode === 'D');
  audio.setHighPass(model.hp === 1);
  audio.setVuStyle(model.meterStyle);
}

export function bindModelChange(ctx: AppContext, refs: DrawerControls, sync: AudioSync): void {
  const { model, audio } = ctx;
  const { chkHpf, chkTerm, selectLampColor, selectDialBg, selectPpmLampColor, selectPpmDialBg, selectMeterStyle } = refs;

  model.onChange = (m: any) => {
    const isDigital = (m.mode === 'D');
    audio.setReferenceLevel(m.getActiveReferenceLevel(), isDigital);
    audio.setHighPass(m.hp === 1);
    audio.setVuStyle(m.meterStyle);
    if (chkHpf) chkHpf.checked = m.hp === 1;
    if (chkTerm) chkTerm.checked = m.term === 1;
    if (selectLampColor) selectLampColor.value = m.dialLamp;
    if (selectDialBg) selectDialBg.value = m.dialBg;
    if (selectPpmLampColor) selectPpmLampColor.value = m.ppmLamp;
    if (selectPpmDialBg) selectPpmDialBg.value = m.ppmDialBg;
    if (selectMeterStyle) selectMeterStyle.value = m.meterStyle;

    sync.syncAudioWithHardwareMode(m);
    saveAppConfig(ctx, m);
  };
}

/** Front panel interactive buttons. */
export function bindFrontPanel(ctx: AppContext, sync: AudioSync): void {
  const { model, view, audio } = ctx;
  bindInputPicker(ctx, sync);
  view.onButtonPressed = async (btnName) => {
    if (btnName === 'MODE') {
      model.pressMode();
    } else if (btnName === 'SOURCE') {
      model.pressSource();
    } else if (btnName === 'DOWN') {
      model.pressDown();
    } else if (btnName === 'UP') {
      model.pressUp();
    } else if (btnName === 'SENS_ZERO') {
      model.sensitivityToZero();
    } else if (btnName.startsWith('INPUT_')) {
      const inputNum = parseInt(btnName.replace('INPUT_', ''), 10);
      if (inputNum >= 1 && inputNum <= 4) {
        if (Date.now() < pickerOpenedAt + 600) return; // the hold that opened the picker
        window.audioReady = true;
        if (window.audioContext && window.audioContext.state === 'suspended') {
          window.audioContext.resume().catch(() => {});
        }
        // Each button plays whatever input is assigned to it (hold / right-click to choose)
        selectAssignedInput(ctx, sync, inputNum);
      }
    } else if (btnName === 'CYCLE_STYLE') {
      // Revert locked expanded meters when user changes meter sets
      if (model.isLockedExpanded) {
        model.isLockedExpanded = false;
      }
      const styles = ['fisam', 'pimson', 'wbs_m405', 'mccurdy_vu', 'standard_vu'];
      const curIdx = styles.indexOf(model.meterStyle);
      model.meterStyle = styles[(curIdx + 1) % styles.length] as any;
      try { localStorage.setItem(getMeterKey(), model.meterStyle); } catch {}
      model.saveEEPROM();
      model.notify();
    } else if (btnName === 'TOGGLE_LOCKED_EXPANDED') {
      model.toggleLockedExpanded();
    } else if (btnName === 'TOGGLE_AUTORANGE') {
      model.toggleAutoRange();
    } else if (btnName === 'MC_TOGGLE') {
      model.toggleMccurdyRange();
    } else if (btnName === 'MC_RANGE_OUTER') {
      model.setMccurdyRange('outer');
    } else if (btnName === 'MC_RANGE_INNER') {
      model.setMccurdyRange('inner');
    } else if (btnName === 'MC_RANGE_CAL') {
      model.setMccurdyRange('cal');
    }
    sync.syncAudioWithHardwareMode(model);
  };

  view.onButtonReleased = () => {};
}

/** One-click anywhere (outside the drawer) to initialise audio if not yet running. */
export function bindAudioUnlock(ctx: AppContext, sync: AudioSync): void {
  const { model } = ctx;
  document.addEventListener('pointerdown', async (e: any) => {
    if (!sync.isAudioStarted && !e.target.closest('.aux-drawer, #settingsStage')) {
      window.audioReady = true;
      if (window.audioContext && window.audioContext.state === "suspended") {
        await window.audioContext.resume();
      }
      const isInput = (e.target as Element | null)?.closest('[data-btn^="INPUT_"]');
      if (!isInput) {
        await sync.syncAudioWithHardwareMode(model);
      }
    }
  }, { once: true, passive: true });
}

let pickerOpenedAt = 0;

/** Hold (450 ms) or right-click an INPUT 1-4 button: choose which input it plays. */
function bindInputPicker(ctx: AppContext, sync: AudioSync): void {
  const { model, view } = ctx;
  const btnOf = (t: EventTarget | null) => (t as Element | null)?.closest?.('[data-btn^="INPUT_"]') as Element | null;
  const open = (btn: Element, x: number, y: number) => {
    const n = parseInt((btn.getAttribute('data-btn') || '').replace('INPUT_', ''), 10);
    if (!(n >= 1 && n <= 4)) return;
    pickerOpenedAt = Date.now();
    openInputPicker(n, x, y, (id) => {
      assignInput(n, id);
      view.isBuilt = false; // captions are drawn into the panel art
      selectAssignedInput(ctx, sync, n);
    });
  };
  document.addEventListener('contextmenu', (e) => {
    const btn = btnOf(e.target);
    if (!btn) return;
    e.preventDefault();
    open(btn, e.clientX, e.clientY);
  });
  let hold: number | undefined;
  document.addEventListener('pointerdown', (e) => {
    const btn = btnOf(e.target);
    if (!btn || e.button !== 0) return;
    const { clientX: x, clientY: y } = e;
    clearTimeout(hold);
    hold = window.setTimeout(() => open(btn, x, y), 450);
  });
  const cancel = () => clearTimeout(hold);
  document.addEventListener('pointerup', cancel);
  document.addEventListener('pointercancel', cancel);
  document.addEventListener('pointermove', (e) => { if (e.buttons === 0) cancel(); });
  void model;
}
