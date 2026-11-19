/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import { CAPTURE_STEPS } from './capture-steps';

/* Canvas cursor, hover inspection & lime line (-18 dBFS 0 VU reference) scroll zoom. */

/** Device-pixel pointer position and whether it lies within `tol` CSS px of the lime line. */
function limeHit(v: DbfsView, wrapper: HTMLElement, e: any, tol: number): { x: number; y: number; over: boolean } {
  const rect = wrapper.getBoundingClientRect();
  const dpr = v.dpr || 1;
  const x = (e.clientX - rect.left) * dpr;
  const y = (e.clientY - rect.top) * dpr;
  const padT = 18 * dpr;
  const padB = 26 * dpr;
  const padL = 175 * dpr;
  const padR = 28 * dpr;
  const plotH = Math.max(10, (v.h || 300) - padT - padB);
  const plotW = Math.max(10, (v.w || 800) - padL - padR);
  const limeY = Math.round(padT + plotH * (1 - (-18 + 60) / 60));
  const over = Math.abs(y - limeY) <= tol * dpr && x >= (padL - 40 * dpr) && x <= (padL + plotW + 20 * dpr);
  return { x, y, over };
}

export function bindPointerInput(v: DbfsView, wrapper: HTMLElement): void {
  wrapper.addEventListener('pointermove', (e: any) => {
    const { x, y, over: overLime } = limeHit(v, wrapper, e, 32);
    v.hoverX = x;
    v.hoverY = y;

    if (!v.isDocked && v.hudEl && v.showHoverTelemetry) {
      v.hudEl.style.display = 'block';
    }

    v.isHoveringLime = overLime;
    wrapper.style.cursor = overLime ? 'ns-resize' : 'crosshair';
  });

  wrapper.addEventListener('pointerleave', () => {
    v.hoverX = null;
    v.hoverY = null;
    v.isHoveringLime = false;
    wrapper.style.cursor = 'default';
    if (!v.isDocked && v.hudEl) {
      v.hudEl.style.display = '';
    }
  });

  // Using the scroll wheel when over the lime line zooms the time scale in and out
  wrapper.addEventListener('wheel', (e: any) => {
    const { over: overLime } = limeHit(v, wrapper, e, 35);
    if (!overLime) return;
    e.preventDefault();
    e.stopPropagation();

    const curIdx = v.secondsToSlider(v.captureLength);
    let nextIdx = curIdx;

    if (e.deltaY < 0) {
      // Scroll UP: Zoom IN (shorter timeframe)
      nextIdx = Math.max(0, curIdx - 1);
    } else if (e.deltaY > 0) {
      // Scroll DOWN: Zoom OUT (longer timeframe)
      nextIdx = Math.min(CAPTURE_STEPS.length - 1, curIdx + 1);
    }

    if (nextIdx !== curIdx) {
      v.captureLength = CAPTURE_STEPS[nextIdx].sec;
      v.zoomFeedbackTime = performance.now();
      v.zoomFeedbackText = `ZOOM: ${v.formatDuration(v.captureLength)}`;

      const slider = document.getElementById('scopeLengthSlider') as HTMLInputElement | null;
      const valBadge = document.getElementById('scopeLengthVal') as HTMLElement | null;
      if (slider) slider.value = String(nextIdx);
      if (valBadge) valBadge.textContent = v.formatDuration(v.captureLength);
    }
  }, { passive: false });
}
