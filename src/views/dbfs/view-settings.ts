/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { TimeScaleMode } from '../../types/telemetry';

/* View setters: HUD docking, log warp beta, time scale mode, capture length, canvas resize. */

const ICON_UNDOCK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>`;
const ICON_DOCK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v10M17 7l-5 5-5-5M4 17h16M4 21h16"/></svg>`;

export function setDocked(v: DbfsView, docked: boolean): void {
  v.isDocked = !!docked;
  try {
    localStorage.setItem('xtm_hud_docked', v.isDocked ? 'true' : 'false');
  } catch (_) {}

  const chkDockHud = document.getElementById('chkDockHud') as HTMLInputElement | null;
  if (chkDockHud) chkDockHud.checked = v.isDocked;

  if (v.btnDock) {
    v.btnDock.title = v.isDocked ? 'Undock to auto-hiding floating HUD' : 'Pin / Dock HUD in scope';
    v.btnDock.innerHTML = v.isDocked ? ICON_UNDOCK : ICON_DOCK;
  }

  if (v.hudEl) {
    if (v.isDocked) {
      v.hudEl.classList.add('docked');
      v.hudEl.style.display = v.showHoverTelemetry ? 'flex' : 'none';
    } else {
      v.hudEl.classList.remove('docked');
      v.hudEl.style.display = v.showHoverTelemetry ? '' : 'none';
    }
  }
}

export function setBeta(v: DbfsView, b: number): void {
  v.beta = Math.max(1, b);
  v.logBetaDenom = Math.log(1 + v.beta);
  v.graphDirty = true;
}

export function setTimeMode(v: DbfsView, mode: TimeScaleMode): void {
  v.timeMode = mode;
  v.graphDirty = true;
  const btnLog = document.getElementById('btnScopeLog');
  const btnSuperLog = document.getElementById('btnScopeSuperLog');
  const btnLin = document.getElementById('btnScopeLin');
  const btnSamples = document.getElementById('btnScopeSamples');
  const logOptRow = document.getElementById('scopeLogOptionsRow');
  if (btnLog && btnLin) {
    btnLog.classList.toggle('active', mode === 'log');
    if (btnSuperLog) btnSuperLog.classList.toggle('active', mode === 'super_log');
    btnLin.classList.toggle('active', mode === 'lin');
    if (btnSamples) btnSamples.classList.toggle('active', mode === 'samples');
  }
  if (mode === 'super_log') {
    v.setBeta(60);
    const warpSel = document.getElementById('selectScopeLogWarp') as HTMLSelectElement | null;
    if (warpSel) warpSel.value = '60';
  }
  if (logOptRow) {
    logOptRow.style.display = (mode === 'log' || mode === 'super_log') ? 'flex' : 'none';
  }
}

export function setCaptureLength(v: DbfsView, seconds: number): void {
  v.captureLength = Math.max(1, Math.min(v.maxCaptureSec || 600, seconds));
  const lengthVal = document.getElementById('scopeLengthVal');
  const lengthSlider = document.getElementById('scopeLengthSlider') as HTMLInputElement | null;
  if (lengthVal) lengthVal.textContent = v.formatDuration(v.captureLength);
  if (lengthSlider) lengthSlider.value = String(v.secondsToSlider(v.captureLength));
  v.graphDirty = true;
}

export function handleResize(v: DbfsView): void {
  if (!v.canvas) return;
  if (!v.canvas || !v.canvas.parentElement) return;
  const rect = v.canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  if (w > 0 && h > 0 && (v.canvas.width !== w || v.canvas.height !== h)) {
    v.canvas.width = w;
    v.canvas.height = h;
    v.w = w;
    v.h = h;
    v.dpr = dpr;
    if (!v.graphCanvas) {
      v.graphCanvas = document.createElement('canvas');
    }
    v.graphCanvas.width = w;
    v.graphCanvas.height = h;
    v.graphCtx = v.graphCanvas.getContext('2d', { alpha: false });
    v.graphDirty = true;
  }
}
