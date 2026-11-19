/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Reference tone calibration selector (0 .. -60 dBFS). */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';

export function initToneCal(ctx: AppContext, refs: DrawerControls): void {
  const { model, audio } = ctx;
  const { selectToneCal } = refs;
  if (!selectToneCal) return;

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
