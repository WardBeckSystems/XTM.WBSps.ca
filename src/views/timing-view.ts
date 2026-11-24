/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Timing tab: PTP grandmasters and every clock the TAP daemon hears (apk-ptp MQTT,
 * or the 224.0.1.129 listener), from GET /api/aoip/multicast. Grandmasters lead as
 * chips, one per network/domain; the clock table follows. Theme colours are the
 * pipeline graph's --pg-* tokens (the container carries .rc-pipeline-graph).
 */

const DAEMON = 'http://localhost:8467';
const POLL_MS = 2000;

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

const ptpName = (c: any) => `${c.version === 1 ? 'PTPv1' : 'PTPv2'} ${c.version === 1 ? c.domain : 'd' + c.domain}`;

export class TimingView {
  private timer: number | null = null;
  private online = false;
  private ptp: any = null;
  /** Grandmasters and clocks seen this session: a dropout stays as an inactive placeholder. */
  private seenGms = new Map<string, any>();
  private seenClocks = new Map<string, any>();

  constructor(private el: HTMLElement) {}

  build(): this {
    this.el.innerHTML = '<div class="routing-console-rack"><div class="rc-pipeline-graph tm-timing" id="tmTiming"></div></div>';
    this.poll();
    this.timer = window.setInterval(() => this.poll(), POLL_MS);
    return this;
  }

  destroy(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
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
    const gmKey = (c: any) => `${ptpName(c)} · ${c.network} · ${c.identity}`;
    const clockKey = (c: any) => `${c.network} · ${ptpName(c)} · ${c.clock_identity}`;
    const gms: any[] = keep(this.seenGms, p.grandmasters ?? [], gmKey).sort((a, b) => abc(gmKey(a), gmKey(b)));
    const clocks: any[] = keep(this.seenClocks, p.clocks ?? [], clockKey);

    const state = !this.online ? 'err' : p.listening ? 'on' : 'err';
    const src = p.mode === 'passive' ? `passive · ${esc(p.source || 'apk-ptp')}` : 'listening on 224.0.1.129';
    const status = !this.online
      ? 'TAP offline: start the Ward-Beck Audio Tap (:8467)'
      : p.listening ? `${src} · ${clocks.length} clock${clocks.length === 1 ? '' : 's'}` : (p.error || 'PTP listener not running');

    const chips = gms.length
      ? gms.map((c) => {
          const contested = c.sync_health === 'contested';
          return `
            <div class="tm-gm tm-v${c.version}${contested ? ' tm-contested' : ''}${c.gone ? ' tm-gone' : ''}" title="Grandmaster ${esc(c.identity)}${c.source_ip ? ` from ${esc(c.source_ip)}` : ''}${contested ? '\nContested: more than one grandmaster on this domain' : ''}${c.gone ? '\nNot heard now: kept as a placeholder' : ''}">
              <div class="tm-gm-name">⏱ ${esc(ptpName(c))} · ${esc(c.network)}${c.priority1 != null ? ` · p1 ${esc(c.priority1)}` : ''}</div>
              <div class="tm-gm-id">${contested ? '⚠ contested · ' : ''}GM ${esc(c.identity)}</div>
            </div>`;
        }).join('')
      : `<div class="tm-empty">${this.online ? (p.mode === 'passive' ? 'No PTP master reported by apk-ptp yet' : 'No PTP grandmaster heard on 224.0.1.129 yet') : 'Waiting for the TAP daemon'}</div>`;

    const sorted = clocks.slice().sort((a, b) => abc(clockKey(a), clockKey(b)));
    const rows = sorted.map((c) => `
      <tr class="${c.online === false || c.gone ? 'tm-off' : ''}${c.gone ? ' tm-gone' : ''}${c.sync_health === 'contested' ? ' tm-row-contested' : ''}">
        <td>${c.is_grandmaster ? '<b class="tm-gm-tag">GM</b>' : ''}</td>
        <td class="tm-mono">${esc(c.clock_identity)}</td>
        <td>${esc(c.vendor || '—')}</td>
        <td>${esc(ptpName(c))}</td>
        <td>${esc(c.network)}</td>
        <td class="tm-num">${esc(c.priority1 ?? '—')} / ${esc(c.priority2 ?? '—')}</td>
        <td class="tm-num">${esc(c.clock_class ?? '—')}</td>
        <td>${esc(c.clock_accuracy || '—')}</td>
        <td>${esc(c.time_source || '—')}</td>
        <td>${esc(c.sync_health || '—')}</td>
        <td>${c.gone ? 'gone' : esc(c.last_seen_text || (c.age_s != null ? `${Math.round(c.age_s)} s ago` : '—'))}</td>
      </tr>`).join('');

    host.innerHTML = `
      <div class="pg-status"><span class="pg-chip pg-chip-${state}"><i></i>PTP</span><span class="pg-iface">${esc(status)}</span></div>
      <div class="tm-head">GRANDMASTERS</div>
      <div class="tm-gms">${chips}</div>
      ${clocks.length ? `
      <div class="tm-head">CLOCKS</div>
      <div class="tm-table-wrap"><table class="tm-table">
        <thead><tr><th></th><th>Identity</th><th>Vendor</th><th>PTP</th><th>Network</th><th>P1 / P2</th><th>Class</th><th>Accuracy</th><th>Time source</th><th>Health</th><th>Seen</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : ''}`;
  }
}
