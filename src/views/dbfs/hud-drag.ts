/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';

/* Allow dragging the HUD card by its header within the canvas wrapper. */

export function bindHudDrag(v: DbfsView, container: HTMLElement): void {
  const hudHeader = container.querySelector('.hud-header');
  if (!(hudHeader && v.wrapper && v.hudEl)) return;
  const hudEl = v.hudEl;
  const wrapEl = v.wrapper;
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  hudHeader.addEventListener('pointerdown', (e: any) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = hudEl.getBoundingClientRect();
    const wrapRect = wrapEl.getBoundingClientRect();
    initialLeft = rect.left - wrapRect.left;
    initialTop = rect.top - wrapRect.top;
    try { hudHeader.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  });

  hudHeader.addEventListener('pointermove', (e: any) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const wrapRect = wrapEl.getBoundingClientRect();
    const hudRect = hudEl.getBoundingClientRect();
    const maxLeft = Math.max(0, wrapRect.width - hudRect.width);
    const maxTop = Math.max(0, wrapRect.height - hudRect.height);

    const newLeft = Math.max(0, Math.min(maxLeft, initialLeft + dx));
    const newTop = Math.max(0, Math.min(maxTop, initialTop + dy));

    hudEl.style.left = `${newLeft}px`;
    hudEl.style.top = `${newTop}px`;
    hudEl.style.right = 'auto';
  });

  const stopDrag = (e: any) => {
    if (isDragging) {
      isDragging = false;
      try { hudHeader.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };
  hudHeader.addEventListener('pointerup', stopDrag);
  hudHeader.addEventListener('pointercancel', stopDrag);
}
