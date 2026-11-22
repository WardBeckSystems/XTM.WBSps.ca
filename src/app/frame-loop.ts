/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** 60 FPS direct hardware loop: needles first, then secondary displays, telemetry, LUFS glow, FPS. */

import type { AppContext } from './app-context';
import type { TelemetryRecorder } from './telemetry-log';

export function startFrameLoop(ctx: AppContext, recorder: TelemetryRecorder): void {
  const { model, audio, view, podView, dbfsView } = ctx;
  const viewportEl = document.querySelector('.console-viewport');
  let frameCount = 0;
  let lastTime = performance.now();
  const fpsEl = document.getElementById('fpsDisplay');

  function frame(now: number) {
    // =========================================================================
    // STEP 1: FETCH DATA & UPDATE NEEDLES FIRST (TOP PRIORITY - ZERO DELAY)
    // =========================================================================
    const levels = (audio && audio.getLevels) ? audio.getLevels() : (audio?.currentLevels || {
      vu: [0, 0],
      ppm: [-0.12, -0.12],
      vuDb: [-Infinity, -Infinity],
      ppmDb: [-Infinity, -Infinity],
      phaseCorrelation: 1.0,
      phaseLed: -1,
      peak: [false, false],
      hasAudio: false
    });

    // 100% Guaranteed: Needles process data and commit GPU matrix FIRST
    view.updateNeedles(levels, model.power, model.meterStyle === 'fisam' || model.meterStyle === 'sifam');

    // =========================================================================
    // STEP 2: SECONDARY DISPLAY & CONTROL ELEMENTS
    // =========================================================================
    model.isIdle = !levels.hasAudio;
    view.renderSecondary(model, levels);
    podView.render(model, levels);
    if (dbfsView) dbfsView.render(model, levels);

    // Requirement 13: Record Telemetry for CSV export
    recorder.recordTelemetry(levels, now);
    recorder.recordTransientEvent(levels);

    // Requirement 11: Dynamic Ambient Background Glow for LUFS Levels
    // > -24 LUFS: Green glow, > -18 LUFS: Orange glow, >= -12 LUFS: Red glow & red background
    if (viewportEl) {
      const curLufs = (levels && levels.lufs && typeof levels.lufs.m === 'number') ? levels.lufs.m : -60;
      if (isFinite(curLufs) && curLufs > -24) {
        if (curLufs >= -12) {
          viewportEl.className = 'console-viewport lufs-glow-red';
        } else if (curLufs >= -18) {
          viewportEl.className = 'console-viewport lufs-glow-orange';
        } else {
          viewportEl.className = 'console-viewport lufs-glow-green';
        }
      } else {
        viewportEl.className = 'console-viewport';
      }
    }

    // =========================================================================
    // STEP 3: TELEMETRY & FPS DIAGNOSTICS
    // =========================================================================
    frameCount++;
    if (now - lastTime >= 500) {
      const fps = (frameCount * 1000) / (now - lastTime);
      if (fpsEl) fpsEl.textContent = fps.toFixed(1) + ' FPS';
      frameCount = 0;
      lastTime = now;
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
