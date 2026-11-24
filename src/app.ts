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
import { LoggingView } from './views/logging-view';
import { GeneratorsView } from '../Generators/web';
import { WebRouter } from '../WebRouter/src';
import { MX, PY, R } from './views/xtm/layout/wbs-layout';
import { restAngle, vuAngle, vuFrac } from './views/xtm/lib/scale-math';
import type { AppContext } from './app/app-context';
import { queryDrawerControls } from './app/dom-refs';
import { initSettingsDrawer } from './app/settings-drawer';
import { initVfdMetric } from './app/vfd-metric';
import { initPodExtendedRange, initPodScaleAndHold, initPodDecay } from './app/pod22-options';
import { initCsvExport } from './app/csv-export';
import { bindRouterMeterInputs, routerMeterInput } from './app/input-assign';
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
import { TimingView } from './views/timing-view';
import { initMetersPreview } from './app/meters-preview';
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
  // Meter Input 1-4 crosspoints drive the XTM-4's INPUT buttons (wired once the audio sync exists)
  let onMeterInput: ((meter: number, input: number) => void) | null = null;
  const webRouter = routerStageEl
    ? new WebRouter(routerStageEl, { audio, onFlowHint: (flow) => dataView?.setFlow(flow),
        onMeterInput: (meter, input) => onMeterInput?.(meter, input),
        // CH 9 / CH 10 receivers: the TAP's receiver flow goes on the meters
        // Every router strip shows the XTM's own VU meter (meter 0) in miniature
        meterArt: () => (document.getElementById('xtm_meter_group_0') ? {
          href: 'xtm_meter_group_0',
          needle: 'xtm_needle_0',
          box: [MX[0] - 312, 42, 624, 370],
          pivot: [MX[0], PY],
          length: R + 8,
          window: [MX[0] - 288, 65, 576, 211, 7],
          angle: (db: number) => (db <= -55 || !isFinite(db) ? restAngle(false) : vuAngle(vuFrac(db), false)),
        } : null),
        onPlayFlow: (flowId) => window.dispatchEvent(new CustomEvent('xtm:meter-flow', { detail: { port: 8467, flowId } })),
        // An MXL transmitter column opens that flow in the Transmitters tab
        onOpenFlow: (flow) => {
          dataView?.setFlow(flow);
          (window as any).setLowerUnitMode?.('mxl');
          requestAnimationFrame(() => document.querySelector(`#mxlStage [data-flow-ring="${CSS.escape(flow)}"]`)?.scrollIntoView({ block: 'nearest' }));
        } }).mount()
    : null;
  // Speakers fader on the router strip and Settings → Monitor Volume are one control.
  const monSlider = document.getElementById('monitorVolSlider') as HTMLInputElement | null;
  const monVal = document.getElementById('monitorVolVal');
  if (webRouter && monSlider) {
    webRouter.setSpeakerLevel(parseFloat(monSlider.value));
    // after the Settings handler, so the -20 dB dim stays applied
    monSlider.addEventListener('input', () => queueMicrotask(() => webRouter.setSpeakerLevel(parseFloat(monSlider.value))));
    webRouter.onChange((r) => {
      if (document.activeElement === monSlider) return;
      monSlider.value = String(r.speakerLevel);
      if (monVal) monVal.textContent = Math.round(r.speakerLevel * 100) + '%';
    });
  }
  const generatorsStageEl = document.getElementById('generatorsStage');
  if (generatorsStageEl && webRouter) {
    new GeneratorsView(generatorsStageEl, webRouter, document.getElementById('mxlCbcStage')).build();
    // The XTM-4's own 1 kHz reference tone level sits with the generators, not in Settings
    const toneCalRow = document.getElementById('toneCalRow');
    const rack = generatorsStageEl.querySelector('.routing-console-rack');
    if (toneCalRow && rack) {
      toneCalRow.className = 'rc-tone-cal-row';
      toneCalRow.querySelector('label')!.textContent = 'XTM-4 1 kHz reference tone';
      rack.prepend(toneCalRow);
    }
  }
  const timingStageEl = document.getElementById('timingStage');
  if (timingStageEl) new TimingView(timingStageEl).build();
  const loggingStageEl = document.getElementById('loggingStage');
  if (loggingStageEl) new LoggingView(loggingStageEl).build();
  const ctx: AppContext = { model, audio, view, podView, dbfsView, dataView, webRouter };
  if (dataView) dataView.build(ctx);
  (window as any).xtmModel = model;
  (window as any).xtmAudio = audio;
  (window as any).xtmView = view;
  (window as any).xtmDataView = dataView;
  const receiversStageEl = document.getElementById('receiversStage');
  if (webRouter && receiversStageEl) webRouter.mountReceivers(receiversStageEl);
  const hardwareStageEl = document.getElementById('hardwareStage');
  if (webRouter && hardwareStageEl) webRouter.mountHardware(hardwareStageEl);
  (window as any).xtmWebRouter = webRouter;
  (window as any).xtmCtx = ctx;

  initSettingsDrawer();

  initVfdMetric(ctx);
  initPodExtendedRange(ctx);
  const recorder = initCsvExport();

  const refs = queryDrawerControls();
  applyInitialAudioState(ctx);

  const sync = createAudioSync(ctx, refs);
  onMeterInput = (meter, input) => routerMeterInput(ctx, sync, meter, input);
  // The data view's four small rings are INPUT 1-4: a click is a press of that front-panel
  // button (same path: audio context resumed, then the input switched), with the meter
  // switched on first if it is off.
  if (dataView) dataView.onSelectInput = (n) => {
    if (!model.power) model.togglePower();
    void view.onButtonPressed?.(`INPUT_${n}`);
  };
  bindRouterMeterInputs(ctx);
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
  initMetersPreview();

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
