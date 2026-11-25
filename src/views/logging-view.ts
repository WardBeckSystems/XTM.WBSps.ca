/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Logging tab: telemetry export (moved here from Settings) and the TAP's own log, live
 * (GET /api/log?since=), with the diagnostics bundle a tester can send.
 */

const DAEMON = 'http://localhost:8467';
const POLL_MS = 2000;
const KEEP = 1500;

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export class LoggingView {
  private seq = 0;
  private lines: string[] = [];
  private timer: number | null = null;
  private online: boolean | null = null;
  private filter = '';
  private problemsOnly = false;

  constructor(private el: HTMLElement) {}

  build(): this {
    this.el.innerHTML = `
      <div class="routing-console-rack"><div class="rc-pipeline-graph lg-logging">
        <div class="tm-head">DATA EXPORT</div>
        <div class="lg-export" id="lgExport"></div>
        <div class="tm-head lg-tap-head">TAP LOG
          <span class="lg-tools">
            <input type="search" class="lg-filter" id="lgFilter" placeholder="filter" aria-label="Filter the TAP log">
            <label class="tm-opt"><input type="checkbox" id="lgProblems"> warnings only</label>
            <button type="button" class="lg-btn" id="lgCopy" title="Copy the log lines shown (filter applies)">copy</button>
            <a class="lg-btn" href="${DAEMON}/api/diagnostics/bundle" download title="One file with the TAP's full report and log: send it when something is wrong">diagnostics</a>
          </span>
        </div>
        <div class="pg-status" id="lgStatus"></div>
        <div class="lg-log" id="lgLog" role="log" aria-live="off"></div>
      </div></div>`;
    // The export controls keep their ids and handlers (csv-export.ts): they are moved, not copied.
    const exp = this.el.querySelector('#lgExport')!;
    document.querySelectorAll('[data-logging-move]').forEach((n) => { if (!n.classList.contains('drawer-section-sub')) exp.appendChild(n); else n.remove(); });
    this.el.querySelector('#lgFilter')!.addEventListener('input', (e) => { this.filter = (e.target as HTMLInputElement).value.toLowerCase(); this.draw(); });
    this.el.querySelector('#lgProblems')!.addEventListener('change', (e) => { this.problemsOnly = (e.target as HTMLInputElement).checked; this.draw(); });
    const copy = this.el.querySelector('#lgCopy') as HTMLButtonElement;
    copy.addEventListener('click', () => {
      const text = this.shown().join('\n') + '\n';
      const done = (ok: boolean) => { copy.textContent = ok ? 'copied' : 'copy failed'; setTimeout(() => { copy.textContent = 'copy'; }, 1500); };
      navigator.clipboard?.writeText(text).then(() => done(true), () => done(this.copyFallback(text))) ?? done(this.copyFallback(text));
    });
    this.poll();
    this.timer = window.setInterval(() => this.poll(), POLL_MS);
    return this;
  }

  destroy(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private async poll(): Promise<void> {
    if (!this.el.offsetParent && this.online !== null) return; // hidden: poll again when shown
    try {
      const r = await fetch(`${DAEMON}/api/log?since=${this.seq}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      if (typeof d.seq === 'number' && d.seq < this.seq) this.lines = []; // the TAP restarted
      this.seq = d.seq ?? this.seq;
      const fresh: string[] = d.lines ?? [];
      if (fresh.length || this.online !== true) {
        this.lines.push(...fresh);
        if (this.lines.length > KEEP) this.lines.splice(0, this.lines.length - KEEP);
        this.online = true;
        this.setStatus(d.file);
        this.draw(fresh.length > 0);
      }
    } catch {
      if (this.online !== false) { this.online = false; this.setStatus(); this.draw(); }
    }
  }

  private setStatus(file?: string): void {
    const s = this.el.querySelector('#lgStatus');
    if (!s) return;
    s.innerHTML = this.online
      ? `<span class="pg-chip pg-chip-on"><i></i>TAP</span><span class="pg-iface">${esc(file || '')}</span>`
      : `<span class="pg-chip pg-chip-err"><i></i>TAP</span><span class="pg-iface">offline: no log to show</span>`;
  }

  /** The raw lines that pass the filter and "warnings only". */
  private shown(): string[] {
    const lvl = (l: string) => (l.includes(' ERROR [') ? 'err' : l.includes(' WARN  [') ? 'warn' : 'info');
    return this.lines.filter((l) => (!this.problemsOnly || lvl(l) !== 'info') && (!this.filter || l.toLowerCase().includes(this.filter)));
  }

  /** Clipboard API refused (not a secure context): a hidden textarea and execCommand. */
  private copyFallback(text: string): boolean {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }

  private draw(grew = false): void {
    const box = this.el.querySelector('#lgLog') as HTMLElement | null;
    if (!box) return;
    // A selection in progress is not wiped by the next poll: new lines wait until it is cleared.
    const sel = window.getSelection();
    if (grew && sel && !sel.isCollapsed && sel.anchorNode && box.contains(sel.anchorNode)) return;
    const atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 24;
    const lvl = (l: string) => (l.includes(' ERROR [') ? 'err' : l.includes(' WARN  [') ? 'warn' : 'info');
    const rows = this.shown();
    box.innerHTML = rows.map((l) => {
      // "2026-11-24T13:15:37.664Z INFO  [start] text" → time · area · text
      const m = /^(\S+)\s+(\w+)\s+\[([^\]]*)\]\s?(.*)$/.exec(l);
      if (!m) return `<div class="lg-line">${esc(l)}</div>`;
      const t = new Date(m[1]);
      const hms = isNaN(t.getTime()) ? m[1] : t.toLocaleTimeString([], { hour12: false });
      return `<div class="lg-line lg-${lvl(l)}"><span class="lg-t" title="${esc(m[1])}">${esc(hms)}</span><span class="lg-area">${esc(m[3])}</span>${esc(m[4])}</div>`;
    }).join('');
    if (atEnd || !grew) box.scrollTop = box.scrollHeight;
  }
}
