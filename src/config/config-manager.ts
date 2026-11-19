/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems Console Configuration & Memory Manager
 * Handles:
 * 1. Storage / Cookie Consent (GDPR / Persistent memory permission)
 * 2. Complete hardware & visualizer state persistence across sessions
 * 3. Human-readable YAML Profile Export & Import with .WBS file extension
 *
 * Facade over the focused modules in this folder (types, consent, storage,
 * build, YAML, apply, DOM sync); the public API is unchanged.
 */

import type { XtmModel } from '../models/xtm-model';
import type { XtmAudioEngine } from '../audio/audio-engine';
import type { Pod22View } from '../views/pod22-view';
import type { DbfsView } from '../views/dbfs-view';
import { CONFIG_STORAGE_KEY, type StorageConsentState, type WbsConsoleConfig } from './config-types';
import { readConsent, writeConsent, clearConsent } from './consent';
import { storageGetWith, storageSetWith, storageRemoveBoth } from './config-storage';
import { buildFullConfig } from './config-build';
import { configToWbsYaml, downloadYamlText, parseWbsYamlText } from './config-yaml';
import {
  applyConsoleSection,
  applyBallisticsSection,
  applyPod22Section,
  applyScopeSection
} from './config-apply';
import { syncDrawerDomFromConfig } from './config-dom-sync';

export type { StorageConsentState, WbsConsoleConfig } from './config-types';
export { CONSENT_KEY, CONFIG_STORAGE_KEY } from './config-types';

export class ConfigManager {
  private static instance: ConfigManager;

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /* ---------------- Storage Consent Management ---------------- */
  public getConsent(): StorageConsentState {
    return readConsent();
  }

  public setConsent(consent: 'allowed' | 'session_only'): void {
    writeConsent(consent);
  }

  public resetConsent(): void {
    clearConsent();
  }

  public hasPersistentConsent(): boolean {
    return this.getConsent() === 'allowed';
  }

  /* ---------------- Storage Abstraction (localStorage vs sessionStorage) ---------------- */
  public storageGet(key: string): string | null {
    return storageGetWith(() => this.hasPersistentConsent(), key);
  }

  public storageSet(key: string, value: string): void {
    storageSetWith(() => this.hasPersistentConsent(), key, value);
  }

  public storageRemove(key: string): void {
    storageRemoveBoth(key);
  }

  /* ---------------- Build Complete Snapshot ---------------- */
  public buildConfig(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): WbsConsoleConfig {
    return buildFullConfig(model, audio, podView, dbfsView);
  }

  /* ---------------- YAML Export (.WBS) ---------------- */
  public exportToYaml(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): string {
    return configToWbsYaml(this.buildConfig(model, audio, podView, dbfsView));
  }

  public downloadWbsFile(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView,
    customFilename?: string
  ): void {
    downloadYamlText(this.exportToYaml(model, audio, podView, dbfsView), customFilename);
  }

  /* ---------------- YAML Import (.WBS) ---------------- */
  public parseWbsYaml(yamlStr: string): WbsConsoleConfig {
    return parseWbsYamlText(yamlStr);
  }

  public applyConfig(
    cfg: WbsConsoleConfig,
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): void {
    // 1-4. Console, ballistics, POD-22 and scope sections
    applyConsoleSection(cfg, model);
    applyBallisticsSection(cfg, audio);
    applyPod22Section(cfg, podView);
    applyScopeSection(cfg, dbfsView);

    // 5. Synchronize DOM Controls
    this.syncDrawerDom(cfg);

    // 6. Update view trace toggles & redraw dirty graph
    if (typeof (dbfsView as any)._updateTraceToggles === 'function') {
      (dbfsView as any)._updateTraceToggles();
    }
    dbfsView.graphDirty = true;

    // 7. Save to active storage
    this.saveConfig(model, audio, podView, dbfsView);

    // 8. Visual Confirmation: Flash 'CONFIGOK' on XTM VFD screen
    model.flash('CONFIGOK', 1600);
    model.notify();
  }

  /* ---------------- Sync HTML Form Inputs in Auxiliary Drawer ---------------- */
  public syncDrawerDom(cfg: WbsConsoleConfig): void {
    syncDrawerDomFromConfig(cfg);
  }

  /* ---------------- Persistent Save & Load ---------------- */
  public saveConfig(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): void {
    try {
      const cfg = this.buildConfig(model, audio, podView, dbfsView);
      const serialized = JSON.stringify(cfg);
      this.storageSet(CONFIG_STORAGE_KEY, serialized);
    } catch (_) {}
  }

  public loadSavedConfig(
    model: XtmModel,
    audio: XtmAudioEngine,
    podView: Pod22View,
    dbfsView: DbfsView
  ): boolean {
    try {
      const raw = this.storageGet(CONFIG_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as WbsConsoleConfig;
      this.applyConfig(parsed, model, audio, podView, dbfsView);
      return true;
    } catch (_) {
      return false;
    }
  }
}

export const configManager = ConfigManager.getInstance();
