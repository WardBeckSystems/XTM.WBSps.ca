/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * TIME Module Coordinator: Keeps footer time badge updated live,
 * binds click handlers for footer time button & dBFS scope time axis,
 * and handles keyboard shortcuts.
 */

import type { AppContext } from '../app/app-context';
import { clockModalController } from './clock-popup';

let footerTimer: any = null;

function formatFooterTime(d: Date = new Date()): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function updateFooterClock(): void {
  const timeStr = formatFooterTime();
  const timelineEl = document.getElementById('timelineNowTimeText');
  if (timelineEl) {
    timelineEl.textContent = timeStr;
  }
  const footerEl = document.getElementById('footerCurrentTime');
  if (footerEl) {
    footerEl.textContent = timeStr;
  }
}

export function openClockModal(): void {
  clockModalController.open();
}

export function closeClockModal(): void {
  clockModalController.close();
}

export function toggleClockModal(): void {
  clockModalController.toggle();
}

export function initTimeModule(ctx?: AppContext): void {
  clockModalController.init();

  // 1. Timeline NOW Time Button on the dBFS scope
  const btnTimelineNow = document.getElementById('btnTimelineNowTime');
  if (btnTimelineNow) {
    btnTimelineNow.addEventListener('click', (e) => {
      e.stopPropagation();
      openClockModal();
    });
  }

  // Also support footer time element if present
  const btnCurrentTime = document.getElementById('btnCurrentTime');
  if (btnCurrentTime) {
    btnCurrentTime.addEventListener('click', (e) => {
      e.stopPropagation();
      openClockModal();
    });
  }
  const footerEl = document.getElementById('footerCurrentTime');
  if (footerEl) {
    footerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      openClockModal();
    });
  }

  // Update timeline time immediately and on 1-second interval
  updateFooterClock();
  if (footerTimer) clearInterval(footerTimer);
  footerTimer = setInterval(updateFooterClock, 1000);

  // 2. Custom Window Event for opening clock
  window.addEventListener('xtm:open-clock', () => {
    openClockModal();
  });

  // 3. Escape key to close modal & T/C key shortcuts
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
    if (e.key === 'Escape') {
      closeClockModal();
    } else if (e.key.toUpperCase() === 'T' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      toggleClockModal();
    }
  });

  // 4. Hook dBFS stage time-axis click if present
  const dbfsStage = document.getElementById('dbfsStage');
  if (dbfsStage) {
    dbfsStage.addEventListener('click', (e: MouseEvent) => {
      const rect = dbfsStage.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickX = e.clientX - rect.left;
      const h = rect.height;
      const w = rect.width;

      // Bottom 35px is the time axis area.
      // If user clicks in bottom axis area or the rightmost current-time corner:
      if (clickY >= h - 40 || (clickX >= w - 100 && clickY >= h - 60)) {
        openClockModal();
      }
    });
  }

  // Expose global for dev/debugging or embedded console use
  (window as any).xtmClock = {
    open: openClockModal,
    close: closeClockModal,
    toggle: toggleClockModal,
    controller: clockModalController
  };
}
