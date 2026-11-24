/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Timing tab: PTP grandmasters and every clock the TAP daemon hears (its built-in
 * apk-ptp sniffer, or apk-ptp over MQTT), from GET /api/aoip/multicast. Grandmasters lead as
 * chips, one per network/domain; the clock table follows. Theme colours are the
 * pipeline graph's --pg-* tokens (the container carries .rc-pipeline-graph).
 */

const DAEMON = 'http://localhost:8467';
const POLL_MS = 2000;
const TAP_DOWNLOAD = 'https://github.com/WardBeckSystems/Ward-Beck-Audio-Tap';

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/** PTPv1 has subdomain names, not numbers: _DFLT is domain 0, _ALT1..3 are 1..3. */
const V1_DOMAIN: Record<string, number> = { _DFLT: 0, _ALT1: 1, _ALT2: 2, _ALT3: 3 };
const domainNo = (c: any) => (c.version === 1 ? V1_DOMAIN[c.domain] ?? c.domain : c.domain);
const ptpName = (c: any) => `${c.version === 1 ? 'PTPv1' : 'PTPv2'} domain ${domainNo(c)}`;
/** The network port (NIC) a clock was heard on. */
const portOf = (c: any) => c.interface || '';

export class TimingView {
  private timer: number | null = null;
  private online = false;
  private ptp: any = null;
  /** Grandmasters and clocks seen this session: a dropout stays as an inactive placeholder. */
  private seenGms = new Map<string, any>();
  private seenClocks = new Map<string, any>();
  /** Runtime prompt (pg-fix styles) when the sniffer needs something only the user can grant. */
  private fixEl: HTMLElement | null = null;
  private fixDismissed = new Set<string>();

  constructor(private el: HTMLElement) {}

  build(): this {
    this.el.innerHTML = '<div class="routing-console-rack"><div class="rc-pipeline-graph tm-timing" id="tmTiming"></div></div>';
    this.el.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-fix-open]')) this.syncFix(true);
    });
    this.poll();
    this.timer = window.setInterval(() => this.poll(), POLL_MS);
    return this;
  }

  destroy(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.closeFix();
  }

  private fixKey(fix: any): string {
    return `${fix.title}|${(fix.options ?? []).map((o: any) => o.command).join('|')}`;
  }

  private closeFix(): void {
    this.fixEl?.remove();
    this.fixEl = null;
  }

  /** Ask once per fix; it closes by itself when the daemon stops reporting it. */
  private syncFix(force = false): void {
    const fix = this.online ? this.ptp?.fix : null;
    if (!fix) return this.closeFix();
    const key = this.fixKey(fix);
    if (this.fixEl?.dataset.key === key || (!force && this.fixDismissed.has(key))) return;
    this.closeFix();
    const el = document.createElement('div');
    el.className = 'pg-fix-backdrop';
    el.dataset.key = key;
    el.innerHTML = `
      <div class="pg-fix" role="dialog" aria-modal="true" aria-labelledby="tmFixTitle">
        <div class="pg-fix-kicker">Timing · PTP</div>
        <h3 id="tmFixTitle">${esc(fix.title)}</h3>
        <p class="pg-fix-why">${esc(fix.why)}</p>
        ${(fix.options ?? []).map((o: any, i: number) => `
          <div class="pg-fix-opt">
            <div class="pg-fix-opt-head"><b>${esc(o.label)}</b>${o.note ? `<span>${esc(o.note)}</span>` : ''}</div>
            <div class="pg-fix-cmd"><code>${esc(o.command)}</code><button type="button" data-fix-copy="${i}">Copy</button></div>
          </div>`).join('')}
        <p class="pg-fix-how">Paste it into a terminal and press Enter (it asks for your password).
          This closes by itself once the TAP can hear the clocks.</p>
        <div class="pg-fix-actions"><button type="button" data-fix-dismiss>Not now</button></div>
      </div>`;
    el.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const copy = t.closest('[data-fix-copy]') as HTMLElement | null;
      if (copy) {
        const cmd = fix.options[Number(copy.dataset.fixCopy)]?.command ?? '';
        navigator.clipboard?.writeText(cmd).then(() => {
          copy.textContent = 'Copied';
          setTimeout(() => (copy.textContent = 'Copy'), 1500);
        });
        return;
      }
      if (t.closest('[data-fix-dismiss]') || t === el) {
        this.fixDismissed.add(key);
        this.closeFix();
      }
    });
    document.body.appendChild(el);
    this.fixEl = el;
  }

  private async poll(): Promise<void> {
    if (!this.el.offsetParent && this.ptp !== null) return; // hidden: keep the last view, skip the fetch
    try {
      const r = await fetch(`${DAEMON}/api/aoip/multicast`, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      this.ptp = (await r.json())?.ptp ?? {};
      this.online = true;
    } catch {
      this.online = false;
      this.ptp = this.ptp ?? {};
    }
    this.draw();
    if (this.el.offsetParent) this.syncFix();
  }

  private draw(): void {
    const host = this.el.querySelector('#tmTiming');
    if (!host) return;
    const p = this.ptp || {};
    const abc = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    // Keep everything ever heard; what is not reported now is drawn as gone. Alphabetical, so rows never jump.
    const keep = (seen: Map<string, any>, list: any[], key: (c: any) => string) => {
      const now = new Set<string>();
      for (const c of list) { const k = key(c); now.add(k); seen.set(k, c); }
      return [...seen].map(([k, c]) => (now.has(k) ? c : { ...c, gone: true }));
    };
    const gmKey = (c: any) => `${ptpName(c)} · ${portOf(c)} · ${c.network} · ${c.identity}`;
    const clockKey = (c: any) => `${portOf(c)} · ${c.network} · ${ptpName(c)} · ${c.clock_identity}`;
    const gms: any[] = keep(this.seenGms, p.grandmasters ?? [], gmKey).sort((a, b) => abc(gmKey(a), gmKey(b)));
    const clocks: any[] = keep(this.seenClocks, p.clocks ?? [], clockKey);

    const state = !this.online ? 'err' : p.listening ? 'on' : 'err';
    const src = p.mode === 'passive' ? `MQTT · ${p.source || 'apk-ptp'}` : p.mode === 'apk-ptp' ? 'apk-ptp' : '224.0.1.129';
    // Offline, or an older TAP still waiting on the APK MQTT broker: point at the download.
    const getTap = !this.online || p.mode === 'passive';
    const status = !this.online
      ? 'TAP offline'
      : p.listening ? `${src} · ${clocks.length} clock${clocks.length === 1 ? '' : 's'}${p.error ? ` · ${p.error}` : ''}` : (p.error || 'PTP listener not running');

    const chips = gms.length
      ? gms.map((c) => {
          const contested = c.sync_health === 'contested';
          return `
            <div class="tm-gm tm-v${c.version}${contested ? ' tm-contested' : ''}${c.gone ? ' tm-gone' : ''}" title="Grandmaster ${esc(c.identity)}${c.source_ip ? ` from ${esc(c.source_ip)}` : ''}${portOf(c) ? ` on port ${esc(portOf(c))}` : ''}${c.version === 1 ? ` (subdomain ${esc(c.domain)})` : ''}${contested ? '\nContested: more than one grandmaster on this domain and port' : ''}${c.gone ? '\nNot heard now: kept as a placeholder' : ''}">
              <div class="tm-gm-name">⏱ ${esc(ptpName(c))} · ${esc(c.network)}${c.priority1 != null ? ` · p1 ${esc(c.priority1)}` : ''}</div>
              <div class="tm-gm-id">${contested ? '⚠ contested · ' : ''}GM ${esc(c.identity)}${portOf(c) ? ` · ${esc(portOf(c))}` : ''}</div>
            </div>`;
        }).join('')
      : `<div class="tm-empty">${this.online ? 'No PTP grandmaster heard yet' : 'Waiting for the TAP daemon'}</div>`;

    const sorted = clocks.slice().sort((a, b) => abc(clockKey(a), clockKey(b)));
    const rows = sorted.map((c) => `
      <tr class="${c.online === false || c.gone ? 'tm-off' : ''}${c.gone ? ' tm-gone' : ''}${c.sync_health === 'contested' ? ' tm-row-contested' : ''}">
        <td>${c.is_grandmaster ? '<b class="tm-gm-tag">GM</b>' : ''}</td>
        <td class="tm-mono">${esc(c.clock_identity)}</td>
        <td>${esc(c.vendor || '—')}</td>
        <td>${esc(ptpName(c))}</td>
        <td>${esc(c.network)}</td>
        <td class="tm-mono">${esc(portOf(c) || '—')}</td>
        <td class="tm-num">${esc(c.priority1 ?? '—')} / ${esc(c.priority2 ?? '—')}</td>
        <td class="tm-num">${esc(c.clock_class ?? '—')}</td>
        <td>${esc(c.clock_accuracy || '—')}</td>
        <td>${esc(c.time_source || '—')}</td>
        <td>${esc(c.sync_health || '—')}</td>
        <td>${c.gone ? 'gone' : esc(c.last_seen_text || (c.age_s != null ? `${Math.round(c.age_s)} s ago` : '—'))}</td>
      </tr>`).join('');

    host.innerHTML = `
      <div class="pg-status"><span class="pg-chip pg-chip-${state}"><i></i>PTP</span><span class="pg-iface">${esc(status)}${getTap ? ` · <a href="${TAP_DOWNLOAD}" target="_blank" rel="noopener">${this.online ? 'update' : 'download'} the Ward-Beck Audio Tap</a> to hear PTP clocks` : ''}</span>${p.fix && this.online ? '<button type="button" class="pg-fix-open" data-fix-open>Fix…</button>' : ''}</div>
      <div class="tm-head">GRANDMASTERS</div>
      <div class="tm-gms">${chips}</div>
      ${clocks.length ? `
      <div class="tm-head">CLOCKS</div>
      <div class="tm-table-wrap"><table class="tm-table">
        <thead><tr><th></th><th>Identity</th><th>Vendor</th><th>PTP</th><th>Network</th><th>Port</th><th>P1 / P2</th><th>Class</th><th>Accuracy</th><th>Time source</th><th>Health</th><th>Seen</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : ''}`;
  }
}
