/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM Standalone Application Coordinator
 * Coordinates pure borderless XTM-4 and POD-22 visualizers,
 * front-panel MODE & SOURCE audio routing, and 60 FPS animation loop.
 * Each feature lives in src/app/; this file only wires them up in order.
 */

import { xtmModel as model } from './models/xtm-model';
import { audio } from './audio/audio-engine';
import { XtmView } from './views/xtm-view';
import { Pod22View } from './views/pod22-view';
import { DbfsView } from './views/dbfs-view';
import { DataStreamView } from './views/data-stream-view';
import { GeneratorsView } from '../Generators/web';
import { WebRouter } from '../WebRouter/src';
import type { AppContext } from './app/app-context';
import { queryDrawerControls } from './app/dom-refs';
import { initSettingsDrawer } from './app/settings-drawer';
import { initSettingsLock } from './app/settings-lock';
import { initVfdMetric } from './app/vfd-metric';
import { initPodExtendedRange, initPodScaleAndHold, initPodDecay } from './app/pod22-options';
import { initCsvExport } from './app/csv-export';
import { createAudioSync } from './app/audio-sync';
import { applyInitialAudioState, bindModelChange, bindFrontPanel, bindAudioUnlock } from './app/model-bindings';
import { bindAudioCallbacks, initDeviceScan, initDeviceSelector } from './app/device-selector';
import { initInputMonitor } from './app/input-monitor';
import { initMeterStyle, applyModeMeter } from './app/meter-style';
import { initToneCal } from './app/tone-cal';
import { initLampMemory } from './app/lamp-memory';
import { initFilterTerm } from './app/filter-term';
import { initPpmStandard } from './app/ppm-standard';
import { initScopeOptions } from './app/scope-options';
import { initConsentBanner } from './app/consent-banner';
import { restoreSavedConfig, initWbsProfileFiles, initAutoSave } from './app/wbs-profile';
import { initKeyboardShortcuts } from './app/keyboard-shortcuts';
import { initUpdateCheck } from './app/update-check';
import { registerServiceWorker } from './app/service-worker';
import { initPwaInstall } from './app/pwa-install';
import { initTimeModule } from './time';
import { initLowerUnitSwitcher } from './app/lower-unit-switcher';
import { startFrameLoop } from './app/frame-loop';
import { startXmxlDiscoveryLoop, onXmxlInstancesChanged } from './audio/engine/sources/xmxl-discovery';

export async function initApp(): Promise<void> {
  const stageEl = document.getElementById('visualizerStage');
  const podStageEl = document.getElementById('pod22Stage');
  const dbfsStageEl = document.getElementById('dbfsStage');
  const view = new XtmView(stageEl);
  view.build(model);
  const podView = new Pod22View(podStageEl);
  const dbfsView = dbfsStageEl ? new DbfsView(dbfsStageEl) : null;
  const dataStageEl = document.getElementById('dataStage');
  const dataView = dataStageEl ? new DataStreamView(dataStageEl) : null;
  const routerStageEl = document.getElementById('routerStage');
  const webRouter = routerStageEl
    ? new WebRouter(routerStageEl, { audio, onFlowHint: (flow) => dataView?.setFlow(flow) }).mount()
    : null;
  const generatorsStageEl = document.getElementById('generatorsStage');
  if (generatorsStageEl && webRouter) new GeneratorsView(generatorsStageEl, webRouter).build();
  const ctx: AppContext = { model, audio, view, podView, dbfsView, dataView, webRouter };
  if (dataView) dataView.build(ctx);
  (window as any).xtmModel = model;
  (window as any).xtmAudio = audio;
  (window as any).xtmView = view;
  (window as any).xtmDataView = dataView;
  (window as any).xtmWebRouter = webRouter;
  (window as any).xtmCtx = ctx;

  initSettingsDrawer();
  initSettingsLock();

  initVfdMetric(ctx);
  initPodExtendedRange(ctx);
  const recorder = initCsvExport();

  const refs = queryDrawerControls();
  applyInitialAudioState(ctx);

  const sync = createAudioSync(ctx, refs);
  bindModelChange(ctx, refs, sync);
  bindFrontPanel(ctx, sync);
  bindAudioUnlock(ctx, sync);

  bindAudioCallbacks(ctx, refs);
  await initDeviceScan(ctx, refs);
  initDeviceSelector(ctx, refs, sync);

  initInputMonitor(ctx, refs);
  initMeterStyle(ctx, refs);
  initToneCal(ctx, refs);
  initLampMemory(ctx, refs);
  initFilterTerm(ctx, refs);
  initPodScaleAndHold(ctx, refs);
  initPpmStandard(ctx, refs);
  initPodDecay(ctx, refs);
  initScopeOptions(ctx);

  initConsentBanner(ctx);
  restoreSavedConfig(ctx); // after every control is bound, as before
  applyModeMeter(ctx);
  initWbsProfileFiles(ctx, sync);
  initAutoSave(ctx, refs);

  initKeyboardShortcuts(ctx, sync);
  initUpdateCheck();
  registerServiceWorker();
  initPwaInstall();
  initTimeModule(ctx);
  initLowerUnitSwitcher();

  // Auto-detect local XMXL (EBU DMF shared-memory) instances across loopback
  startXmxlDiscoveryLoop(4000);
  let hasFlashedXmxl = false;
  onXmxlInstancesChanged((instances) => {
    if (instances.length > 0 && !hasFlashedXmxl) {
      hasFlashedXmxl = true;
      const isWbsCa = /(^|\.)(ward-beck|wardbeck)\.ca$/i.test(window.location.hostname);
      if (isWbsCa || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        model.flash(`XMXL :${instances[0].port}`);
      }
    }
  });

  startFrameLoop(ctx, recorder);
}
