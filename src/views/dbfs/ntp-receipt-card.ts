/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { NtpReceipt } from '../../time/ntp-types';
import { ntpService } from '../../time/ntp-service';

/**
 * Controller for the Floating/Pinned NTP Receipt Card on the dBFS Scope Graph.
 * Renders the full cryptographic receipt, audit ledger, and atomic clock alignment proof.
 */
export class NtpReceiptCardController {
  private el: HTMLElement | null = null;
  private currentReceipt: NtpReceipt | null = null;
  private isPinned: boolean = false;
  private hideTimeout: any = null;

  public init(container: HTMLElement): void {
    let card = container.querySelector('#dbfsNtpReceiptCard') as HTMLElement | null;
    if (!card) {
      card = document.createElement('div');
      card.id = 'dbfsNtpReceiptCard';
      card.className = 'ntp-receipt-card';
      card.style.display = 'none';
      container.appendChild(card);
    }
    this.el = card;
    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.el) return;

    // Prevent clicks inside card from bubbling to canvas
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this.el.addEventListener('pointerenter', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    });

    this.el.addEventListener('pointerleave', () => {
      if (!this.isPinned) {
        this.hideWithDelay(250);
      }
    });
  }

  public showReceipt(receipt: NtpReceipt, clientX: number, clientY: number, wrapperRect: DOMRect): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (!this.el) return;

    this.currentReceipt = receipt;
    this.renderContent(receipt);

    this.el.style.display = 'block';

    // Position card adjacent to pointer, bounded within the wrapper
    const cardW = 340;
    const cardH = 340;
    let left = clientX - wrapperRect.left + 16;
    let top = clientY - wrapperRect.top - cardH / 2;

    if (left + cardW > wrapperRect.width - 12) {
      left = clientX - wrapperRect.left - cardW - 16;
    }
    if (left < 12) left = 12;

    if (top + cardH > wrapperRect.height - 12) {
      top = wrapperRect.height - cardH - 12;
    }
    if (top < 12) top = 12;

    this.el.style.left = `${Math.round(left)}px`;
    this.el.style.top = `${Math.round(top)}px`;
  }

  public hide(force: boolean = false): void {
    if (this.isPinned && !force) return;
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.el) {
      this.el.style.display = 'none';
    }
    this.isPinned = false;
  }

  public hideWithDelay(delayMs: number = 200): void {
    if (this.isPinned) return;
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, delayMs);
  }

  public togglePin(receipt: NtpReceipt, clientX: number, clientY: number, wrapperRect: DOMRect): void {
    if (this.isPinned && this.currentReceipt?.id === receipt.id) {
      this.isPinned = false;
      this.hide(true);
    } else {
      this.isPinned = true;
      this.showReceipt(receipt, clientX, clientY, wrapperRect);
      const pinBtn = this.el?.querySelector('#btnPinNtpReceipt');
      if (pinBtn) pinBtn.classList.add('active');
    }
  }

  private renderContent(r: NtpReceipt): void {
    if (!this.el) return;

    const sign = r.offsetMs >= 0 ? '+' : '';
    const offsetClass = Math.abs(r.offsetMs) < 1.0 ? 'good' : (Math.abs(r.offsetMs) < 10.0 ? 'warn' : 'bad');

    this.el.innerHTML = `
      <div class="ntp-card-header">
        <div class="ntp-card-title-group">
          <div class="ntp-card-badge">🍁 NRC-CNRC NTP RECEIPT</div>
          <div class="ntp-card-id">${r.id}</div>
        </div>
        <div class="ntp-card-actions">
          <button type="button" class="ntp-card-btn ${this.isPinned ? 'active' : ''}" id="btnPinNtpReceipt" title="${this.isPinned ? 'Unpin Card' : 'Pin Card Open'}">📌</button>
          <button type="button" class="ntp-card-btn" id="btnCloseNtpReceipt" title="Close">✕</button>
        </div>
      </div>

      <div class="ntp-card-body">
        <div class="ntp-receipt-row">
          <span class="ntp-lbl">TIME SERVER:</span>
          <span class="ntp-val mono ntp-srv">${r.server} <span class="ntp-stratum">STRATUM ${r.stratum} (${r.referenceId})</span></span>
        </div>
        <div class="ntp-receipt-row">
          <span class="ntp-lbl">AUTHORITY:</span>
          <span class="ntp-val ntp-muted">${r.serverName}</span>
        </div>
        <div class="ntp-receipt-row">
          <span class="ntp-lbl">UTC TIME:</span>
          <span class="ntp-val mono text-cyan">${r.isoUtc.replace('T', ' ').replace('Z', ' UTC')}</span>
        </div>
        <div class="ntp-receipt-row">
          <span class="ntp-lbl">LOCAL TIME:</span>
          <span class="ntp-val mono text-yellow">${new Date(r.timestamp).toLocaleTimeString()}</span>
        </div>

        <div class="ntp-receipt-divider"></div>

        <div class="ntp-grid-stats">
          <div class="ntp-stat-box">
            <div class="ntp-stat-lbl">CLOCK SKEW (θ)</div>
            <div class="ntp-stat-val mono ${offsetClass}">${sign}${r.offsetMs.toFixed(3)} ms</div>
          </div>
          <div class="ntp-stat-box">
            <div class="ntp-stat-lbl">ROUND-TRIP (δ)</div>
            <div class="ntp-stat-val mono">${r.roundTripDelayMs.toFixed(2)} ms</div>
          </div>
          <div class="ntp-stat-box">
            <div class="ntp-stat-lbl">JITTER (σ)</div>
            <div class="ntp-stat-val mono">±${r.jitterMs.toFixed(3)} ms</div>
          </div>
          <div class="ntp-stat-box">
            <div class="ntp-stat-lbl">PRECISION</div>
            <div class="ntp-stat-val mono">${r.precision}</div>
          </div>
        </div>

        <div class="ntp-receipt-divider"></div>

        <div class="ntp-ledger-section">
          <div class="ntp-ledger-title">TIMESTAMP AUDIT TRAIL</div>
          <div class="ntp-ledger-grid">
            <div class="ntp-ledger-cell"><span class="k">T1 (Client Tx):</span> <span class="v mono">${new Date(r.ledger.t1ClientTx).toISOString().slice(11, 23)}</span></div>
            <div class="ntp-ledger-cell"><span class="k">T2 (Server Rx):</span> <span class="v mono">${new Date(r.ledger.t2ServerRx).toISOString().slice(11, 23)}</span></div>
            <div class="ntp-ledger-cell"><span class="k">T3 (Server Tx):</span> <span class="v mono">${new Date(r.ledger.t3ServerTx).toISOString().slice(11, 23)}</span></div>
            <div class="ntp-ledger-cell"><span class="k">T4 (Client Rx):</span> <span class="v mono">${new Date(r.ledger.t4ClientRx).toISOString().slice(11, 23)}</span></div>
          </div>
        </div>

        <div class="ntp-hash-row">
          <span class="ntp-lbl">RECEIPT HASH:</span>
          <span class="ntp-val mono ntp-hash">${r.receiptHash}</span>
        </div>
      </div>

      <div class="ntp-card-footer">
        <button type="button" class="ntp-action-btn" id="btnCopyNtpReceipt">📋 Copy JSON</button>
        <button type="button" class="ntp-action-btn" id="btnSyncAnotherNtp">🔄 Sync Now</button>
        <button type="button" class="ntp-action-btn ntp-clock-btn" id="btnOpenClockFromReceipt">⏱ Master Clock</button>
      </div>
    `;

    // Bind footer actions
    const btnClose = this.el.querySelector('#btnCloseNtpReceipt');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        this.hide(true);
      });
    }

    const btnPin = this.el.querySelector('#btnPinNtpReceipt');
    if (btnPin) {
      btnPin.addEventListener('click', () => {
        this.isPinned = !this.isPinned;
        btnPin.classList.toggle('active', this.isPinned);
      });
    }

    const btnCopy = this.el.querySelector('#btnCopyNtpReceipt');
    if (btnCopy) {
      btnCopy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(JSON.stringify(r, null, 2));
          btnCopy.textContent = '✓ Copied!';
          setTimeout(() => { if (btnCopy) btnCopy.textContent = '📋 Copy JSON'; }, 1800);
        } catch {
          btnCopy.textContent = 'Error';
        }
      });
    }

    const btnSync = this.el.querySelector('#btnSyncAnotherNtp');
    if (btnSync) {
      btnSync.addEventListener('click', async () => {
        btnSync.textContent = '⏳ Syncing...';
        const newReceipt = await ntpService.syncNow();
        btnSync.textContent = '✓ Synced!';
        this.renderContent(newReceipt);
        setTimeout(() => { if (btnSync) btnSync.textContent = '🔄 Sync Now'; }, 1500);
      });
    }

    const btnClock = this.el.querySelector('#btnOpenClockFromReceipt');
    if (btnClock) {
      btnClock.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('xtm:open-clock'));
      });
    }
  }
}

export const ntpReceiptCard = new NtpReceiptCardController();
