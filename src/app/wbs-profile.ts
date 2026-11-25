/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Saved configuration restore, .WBS profile export/import and auto-save on drawer controls. */

import { configManager } from '../config/config-manager';
import { type AppContext, saveAppConfig } from './app-context';
import type { DrawerControls } from './dom-refs';
import type { AudioSync } from './audio-sync';

/** Load the saved configuration profile, if present. */
export function restoreSavedConfig(ctx: AppContext): void {
  const { model, audio, podView, dbfsView } = ctx;
  if (dbfsView) {
    configManager.loadSavedConfig(model, audio, podView, dbfsView);
  }
}

export function initWbsProfileFiles(ctx: AppContext, sync: AudioSync): void {
  const { model, audio, podView, dbfsView } = ctx;

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
        await sync.syncAudioWithHardwareMode(model);
      } catch (err: any) {
        console.error('WBS configuration import failed:', err);
        alert('Error importing .WBS configuration: ' + (err?.message || 'Invalid format'));
        model.flash('CFG ERR ', 1600);
      } finally {
        inputImportWbs.value = '';
      }
    });
  }
}

/** Auto-save on all setting controls. */
export function initAutoSave(ctx: AppContext, refs: DrawerControls): void {
  const autoSave = () => saveAppConfig(ctx);
  const selectPeakSens = document.getElementById('selectPeakSens');
  const chkExtendedLed22 = document.getElementById('chkExtendedLed22');
  const selectVuBallistics = document.getElementById('selectVuBallistics');
  const selectScopeLogWarp = document.getElementById('selectScopeLogWarp');
  const { inputGainSlider, monitorVolSlider, chkMonitor, chkPodHold, selectPodDecay, selectPpmBallistics } = refs;

  [inputGainSlider, monitorVolSlider, selectPeakSens].forEach(ctrl => {
    ctrl?.addEventListener('change', autoSave);
  });
  [chkMonitor, chkExtendedLed22, chkPodHold, selectPodDecay, selectPpmBallistics, selectVuBallistics, selectScopeLogWarp].forEach(ctrl => {
    ctrl?.addEventListener('change', autoSave);
  });
}
