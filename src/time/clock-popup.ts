/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Clock Popup Modal: Manages modal lifecycle, 60 FPS animation loop,
 * theme switching, sweep/tick mode, and dedicated popout window.
 */

import type { ClockOptions, ClockTheme, SweepMode } from './types';
import { renderCompleteClockSvg, computeClockTime, updateClockHandsDom } from './clock-renderer';
import { renderClockWindowHtml } from './clock-window-template';

export class ClockModalController {
  private overlayEl: HTMLElement | null = null;
  private clockStageEl: HTMLElement | null = null;
  private digitalReadoutEl: HTMLElement | null = null;
  private animFrameId: number | null = null;
  private isOpen: boolean = false;

  private options: ClockOptions = {
    theme: 'wbs-dark',
    mode: 'smooth',
    showCueSectors: true,
    showVfdDigital: true,
    use24Hour: true
  };

  constructor() {
    this.detectAppTheme();
  }

  public detectAppTheme(): ClockTheme {
    const body = document.body;
    let theme: ClockTheme = 'wbs-dark';
    if (body.classList.contains('theme-mccurdy-dark') || body.classList.contains('theme-mccurdy-ca')) {
      theme = 'mccurdy-dark';
    } else if (body.classList.contains('theme-mccurdy') || body.classList.contains('theme-mccurdy-light')) {
      theme = 'mccurdy-light';
    } else if (body.classList.contains('theme-wbs-ca')) {
      theme = 'wbs-ca';
    }
    this.options.theme = theme;
    return theme;
  }

  public init(): void {
    let overlay = document.getElementById('clockModalOverlay') as HTMLElement | null;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'clockModalOverlay';
      overlay.className = `clock-modal-overlay theme-${this.options.theme}`;
      overlay.style.display = 'none';
      overlay.innerHTML = `
        <div class="clock-modal-card" id="clockModalCard" role="dialog" aria-modal="true" aria-label="Master Studio Clock">
          <div class="clock-modal-header">
            <div class="clock-modal-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>TIME / MASTER VU STUDIO CLOCK</span>
              <a href="https://nrc.canada.ca/en/web-clock/" target="_blank" rel="noopener noreferrer" class="clock-nrc-badge" title="Official NRC-CNRC Web Clock & Canadian Broadcast Time Servers">
                🍁 time.nrc.ca · time.chu.nrc.ca
              </a>
            </div>
            <div class="clock-modal-controls">
              <button type="button" class="clock-ctrl-btn" id="btnClockFullscreen" title="Toggle Fullscreen Mode (F)">⛶ FULLSCREEN</button>
              <button type="button" class="clock-ctrl-btn" id="btnClockMode" title="Toggle Smooth Sweep / Quartz Step">SWEEP</button>
              <button type="button" class="clock-ctrl-btn" id="btnClockWindow" title="Open in Dedicated Standalone Window">WINDOW ↗</button>
              <button type="button" class="clock-ctrl-btn clock-btn-close" id="btnCloseClockModal" aria-label="Close Clock">✕</button>
            </div>
          </div>

          <div class="clock-stage-container" id="clockModalStage"></div>

          <div class="clock-modal-footer">
            <div class="clock-footer-readouts">
              <div class="clock-badge clock-badge-time" id="clockModalLocalTime">--:--:--</div>
              <div class="clock-badge clock-badge-utc" id="clockModalUtcTime">--:--:-- UTC</div>
              <div class="clock-badge clock-badge-date" id="clockModalDate">---</div>
              <div class="clock-badge clock-badge-nrc">
                <a href="https://nrc.canada.ca/en/web-clock/" target="_blank" rel="noopener noreferrer" class="clock-nrc-anchor" title="Official NRC-CNRC Time Servers">
                  🍁 time.nrc.ca · time.chu.nrc.ca
                </a>
              </div>
            </div>
            <div class="clock-theme-pills">
              <button type="button" class="clock-pill-btn" data-theme="wbs-ca">WBS Vintage</button>
              <button type="button" class="clock-pill-btn" data-theme="wbs-dark">WBS Modern</button>
              <button type="button" class="clock-pill-btn" data-theme="mccurdy-dark">McCurdy Dark</button>
              <button type="button" class="clock-pill-btn" data-theme="mccurdy-light">McCurdy ATS</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    this.overlayEl = overlay;
    this.clockStageEl = overlay.querySelector('#clockModalStage');
    this.digitalReadoutEl = overlay.querySelector('#clockModalLocalTime');

    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.overlayEl) return;

    // Close on overlay backdrop click
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    const closeBtn = this.overlayEl.querySelector('#btnCloseClockModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    // Fullscreen toggle button
    const fsBtn = this.overlayEl.querySelector('#btnClockFullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFullscreen();
      });
    }

    // Sweep / Tick mode toggle button
    const modeBtn = this.overlayEl.querySelector('#btnClockMode');
    if (modeBtn) {
      modeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.options.mode = this.options.mode === 'smooth' ? 'tick' : 'smooth';
        modeBtn.textContent = this.options.mode === 'smooth' ? 'SWEEP' : 'QUARTZ';
      });
    }

    // Standalone Popout Window button
    const winBtn = this.overlayEl.querySelector('#btnClockWindow');
    if (winBtn) {
      winBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDedicatedWindow();
      });
    }

    // Theme switcher pill buttons
    const pillButtons = this.overlayEl.querySelectorAll('.clock-pill-btn');
    pillButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const th = (btn as HTMLElement).getAttribute('data-theme') as ClockTheme;
        if (th) {
          this.setTheme(th);
        }
      });
    });
  }

  public open(): void {
    if (this.isOpen) return;
    this.detectAppTheme();
    this.init();

    if (this.overlayEl) {
      this.overlayEl.className = `clock-modal-overlay theme-${this.options.theme}`;
      this.overlayEl.style.display = 'flex';
      this.rebuildClockView();
      this.updateThemePillActive();
      this.isOpen = true;
      this.startLoop();
    }
  }

  public close(): void {
    if (!this.isOpen) return;
    this.stopLoop();
    if (this.overlayEl) {
      this.overlayEl.style.display = 'none';
    }
    this.isOpen = false;
  }

  public toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  public setTheme(theme: ClockTheme): void {
    this.options.theme = theme;

    // 1. Sync global mode if function available
    if (typeof (window as any).setMode === 'function') {
      try {
        (window as any).setMode(theme);
      } catch (err) {
        console.warn('setMode failed:', err);
      }
    } else {
      // Direct class toggle on document.body
      const isMcLight = theme === 'mccurdy-light';
      const isMcDark = theme === 'mccurdy-dark';
      const isWbsCa = theme === 'wbs-ca';
      const isWbsDark = theme === 'wbs-dark' || (!isMcLight && !isMcDark && !isWbsCa);

      document.body.classList.toggle('theme-mccurdy', isMcLight);
      document.body.classList.toggle('theme-mccurdy-light', isMcLight);
      document.body.classList.toggle('theme-mccurdy-dark', isMcDark);
      document.body.classList.toggle('theme-wbs-ca', isWbsCa);
      document.body.classList.toggle('theme-wbs-dark', isWbsDark);
    }

    // 2. Set overlay theme class directly
    if (this.overlayEl) {
      this.overlayEl.className = `clock-modal-overlay theme-${theme}`;
    }

    this.rebuildClockView();
    this.updateThemePillActive();
  }

  public cycleTheme(): void {
    const themes: ClockTheme[] = ['wbs-ca', 'wbs-dark', 'mccurdy-dark', 'mccurdy-light'];
    const curIdx = themes.indexOf(this.options.theme);
    const nextIdx = (curIdx + 1) % themes.length;
    this.setTheme(themes[nextIdx]);
  }

  private updateThemePillActive(): void {
    if (!this.overlayEl) return;
    const pillButtons = this.overlayEl.querySelectorAll('.clock-pill-btn');
    pillButtons.forEach(btn => {
      const isMatch = (btn as HTMLElement).getAttribute('data-theme') === this.options.theme;
      btn.classList.toggle('active', isMatch);
    });
  }

  private rebuildClockView(): void {
    if (!this.clockStageEl) return;
    this.clockStageEl.innerHTML = renderCompleteClockSvg(this.options);

    // Clicking any brand badge on dial cycles theme (just like meter face logo!)
    const badges = this.clockStageEl.querySelectorAll('.clock-brand');
    badges.forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme();
      });
    });
  }

  private startLoop(): void {
    const tick = () => {
      if (!this.isOpen) return;
      const time = computeClockTime(new Date(), this.options.mode === 'smooth');
      if (this.clockStageEl) {
        updateClockHandsDom(this.clockStageEl, time);
      }

      if (this.overlayEl) {
        const localEl = this.overlayEl.querySelector('#clockModalLocalTime');
        const utcEl = this.overlayEl.querySelector('#clockModalUtcTime');
        const dateEl = this.overlayEl.querySelector('#clockModalDate');
        if (localEl) localEl.textContent = `${time.timeString24} · ${time.timeZoneString}`;
        if (utcEl) utcEl.textContent = time.utcTimeString;
        if (dateEl) dateEl.textContent = time.dateString;
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.stopLoop();
    this.animFrameId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      if (this.overlayEl?.requestFullscreen) {
        this.overlayEl.requestFullscreen().catch(() => {});
      } else {
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  public openDedicatedWindow(): void {
    const title = 'Master Studio Clock - Ward-Beck Systems';
    const w = Math.min(1920, window.screen.availWidth || 1400);
    const h = Math.min(1080, window.screen.availHeight || 900);
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    const clockWin = window.open('', 'XtmMasterStudioClock', `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`);

    if (!clockWin) return;

    const clockSvg = renderCompleteClockSvg(this.options);
    clockWin.document.write(renderClockWindowHtml(title, clockSvg, this.options.mode === 'smooth', this.options.theme));
    clockWin.document.close();
  }
}

export const clockModalController = new ClockModalController();
