/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import { DBFS_TEMPLATE } from './template';
import { queryHudElements, bindHudTraceToggles, bindDrawerTraceToggles } from './hud-toggles';
import { bindCaptureControls } from './capture-controls';
import { bindDisplayOptions } from './display-options';
import { bindPointerInput } from './pointer-input';
import { bindHudDrag } from './hud-drag';
import { ntpReceiptCard } from './ntp-receipt-card';

/* Build the scope DOM, cache elements, and wire every control and input handler. */

export function initCanvas(v: DbfsView): void {
  if (!v.container) return;
  const container = v.container;
  container.innerHTML = DBFS_TEMPLATE;

  v.canvas = container.querySelector('#dbfsCanvas');
  if (v.canvas) v.ctx = v.canvas.getContext('2d', { alpha: false });
  v.graphCanvas = document.createElement('canvas');
  v.graphCtx = v.graphCanvas.getContext('2d', { alpha: false });
  v.graphDirty = true;
  v.renderFrameCount = 0;

  // HUD Cached Elements + HUD Trace Toggle Checkboxes
  queryHudElements(v, container);
  bindHudTraceToggles(v);

  // Drawer Event Listeners
  bindCaptureControls(v);

  // Pro Options Handlers
  bindDisplayOptions(v);
  bindDrawerTraceToggles(v);

  // Canvas Cursor, Hover Inspection & Lime Line Scroll Zoom
  const wrapper = container.querySelector<HTMLElement>('.dbfs-canvas-wrapper');
  if (wrapper) {
    bindPointerInput(v, wrapper);
    bindHudDrag(v, container);
    ntpReceiptCard.init(wrapper);
  }

  v.handleResize();
  window.addEventListener('resize', () => v.handleResize());
  if (window.ResizeObserver) {
    v.ro = new ResizeObserver(() => v.handleResize());
    v.ro.observe(v.container);
  }

  // Initialize HUD docking state
  v.setDocked(v.isDocked);
}
