/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';

/* Settings-drawer display options: waveform fade, 0 dBFS line, hover HUD, docking, cursor trace, phase. */

function bindFade(v: DbfsView): void {
  const chkEnableFade = document.getElementById('chkEnableFade') as HTMLInputElement | null;
  const chkEnableFadeLabel = document.getElementById('chkEnableFadeLabel');
  const hfFadeSlider = document.getElementById('hfFadeSlider') as HTMLInputElement | null;
  const hfFadeVal = (document.getElementById('hfFadeVal') as HTMLElement | null);

  const updateFadeUI = () => {
    const isFull = !v.enableFade || v.hfFadeDistance >= 100;
    if (chkEnableFade) {
      chkEnableFade.checked = v.enableFade;
    }
    if (chkEnableFadeLabel) {
      chkEnableFadeLabel.textContent = isFull ? 'Off (Full View)' : 'On (Fading)';
    }
    if (hfFadeVal) {
      hfFadeVal.textContent = isFull ? '100% (Full View)' : (v.hfFadeDistance + '%');
    }
    if (hfFadeSlider) {
      hfFadeSlider.value = String(v.hfFadeDistance);
    }
  };

  if (chkEnableFade) {
    chkEnableFade.addEventListener('change', (e: any) => {
      v.enableFade = e.target.checked;
      if (!v.enableFade) {
        v.hfFadeDistance = 100;
      } else if (v.hfFadeDistance >= 100) {
        v.hfFadeDistance = 50;
      }
      updateFadeUI();
    });
  }

  if (hfFadeSlider) {
    hfFadeSlider.addEventListener('input', (e: any) => {
      v.hfFadeDistance = parseFloat(e.target.value);
      if (v.hfFadeDistance >= 100) {
        v.enableFade = false;
      } else {
        v.enableFade = true;
      }
      updateFadeUI();
    });
  }
  updateFadeUI();
}

export function bindDisplayOptions(v: DbfsView): void {
  bindFade(v);

  const chk0DbfsLine = document.getElementById('chk0DbfsLine') as HTMLInputElement | null;
  if (chk0DbfsLine) {
    chk0DbfsLine.checked = v.show0DbfsLine;
    chk0DbfsLine.addEventListener('change', (e: any) => {
      v.show0DbfsLine = e.target.checked;
      localStorage.setItem('xtm_scope_show_0dbfs', String(v.show0DbfsLine));
      v.graphDirty = true;
    });
  }

  const chkHoverTelemetry = document.getElementById('chkHoverTelemetry') as HTMLInputElement | null;
  if (chkHoverTelemetry) {
    chkHoverTelemetry.checked = v.showHoverTelemetry;
    chkHoverTelemetry.addEventListener('change', (e: any) => {
      v.showHoverTelemetry = e.target.checked;
      if (v.isDocked) {
        if (v.hudEl) v.hudEl.style.display = v.showHoverTelemetry ? 'flex' : 'none';
      } else {
        if (v.hudEl) v.hudEl.style.display = v.showHoverTelemetry ? '' : 'none';
      }
    });
  }

  const chkDockHud = document.getElementById('chkDockHud') as HTMLInputElement | null;
  if (chkDockHud) {
    chkDockHud.checked = v.isDocked;
    chkDockHud.addEventListener('change', (e: any) => {
      v.setDocked(e.target.checked);
    });
  }

  if (v.btnDock) {
    v.btnDock.addEventListener('click', (e: any) => {
      e.stopPropagation();
      v.setDocked(!v.isDocked);
    });
  }

  const chkCursorTrace = document.getElementById('chkCursorTrace') as HTMLInputElement | null;
  if (chkCursorTrace) {
    chkCursorTrace.checked = v.showCursorTrace;
    chkCursorTrace.addEventListener('change', (e: any) => {
      v.showCursorTrace = e.target.checked;
    });
  }

  const chkPhasePlot = document.getElementById('chkPhasePlot') as HTMLInputElement | null;
  if (chkPhasePlot) {
    chkPhasePlot.checked = v.plotPhase;
    chkPhasePlot.addEventListener('change', (e: any) => {
      v.plotPhase = e.target.checked;
    });
  }
}
