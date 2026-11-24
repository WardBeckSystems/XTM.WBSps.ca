/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Timing tab: PTP grandmasters and every clock the TAP daemon hears (its built-in
 * apk-ptp sniffer, or apk-ptp over MQTT), from GET /api/aoip/multicast. Grandmasters lead as
 * chips, one per network/domain; the clock table follows. Theme colours are the
 * pipeline graph's --pg-* tokens (the container carries .rc-pipeline-graph).
 *
 * Three check boxes add: NTP (status and config, GET /api/ntp), PTP events (what
 * changed: leaders, clocks heard / gone, contested) and PTP − NTP (each leader's
 * time against this host's NTP clock, plotted). No PTP on the wire is silence:
 * no fault colour, no empty headings, no plot.
 */

import { configManager } from '../config/config-manager';

const DAEMON = 'http://localhost:8467';
const POLL_MS = 2000;
const NTP_POLL_MS = 10000;
/** PTP − NTP history per leader: 300 polls × 2 s = 10 minutes. */
const OFFSET_KEEP = 300;
const OPTS_KEY = 'xtm_timing_opts';
type Opts = { ntp: boolean; events: boolean; offset: boolean };
const TAP_DOWNLOAD = 'https://github.com/WardBeckSystems/Ward-Beck-Audio-Tap/releases/latest';

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/** PTPv1 has subdomain names, not numbers: _DFLT is domain 0, _ALT1..3 are 1..3. */
const V1_DOMAIN: Record<string, number> = { _DFLT: 0, _ALT1: 1, _ALT2: 2, _ALT3: 3 };
const domainNo = (c: any) => (c.version === 1 ? V1_DOMAIN[c.domain] ?? c.domain : c.domain);
const ptpName = (c: any) => `${c.version === 1 ? 'PTPv1' : 'PTPv2'} domain ${domainNo(c)}`;
/** The network port (NIC) a clock was heard on. */
const portOf = (c: any) => c.interface || '';

/** Nanoseconds as the shortest readable unit, signed. */
const fmtNs = (ns: number) => {
  const a = Math.abs(ns), sg = ns < 0 ? '−' : '+';
  if (a < 1e3) return `${sg}${a.toFixed(0)} ns`;
  if (a < 1e6) return `${sg}${(a / 1e3).toFixed(2)} µs`;
  if (a < 1e9) return `${sg}${(a / 1e6).toFixed(3)} ms`;
  return `${sg}${(a / 1e9).toFixed(3)} s`;
};
const hms = (t: number) => new Date(t * 1000).toLocaleTimeString([], { hour12: false });

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
  private opts: Opts = { ntp: false, events: false, offset: false };
  private ntp: any = null;
  private ntpAt = 0;
  /** PTP − NTP samples per leader key, oldest first. */
  private offsets = new Map<string, { t: number; v: number }[]>();

  constructor(private el: HTMLElement) {}

  build(): this {
    try { Object.assign(this.opts, JSON.parse(configManager.storageGet(OPTS_KEY) || '{}')); } catch { /* default off */ }
    const box = (k: keyof Opts, label: string, title: string) =>
      `<label class="tm-opt" title="${esc(title)}"><input type="checkbox" data-opt="${k}"${this.opts[k] ? ' checked' : ''}> ${label}</label>`;
    this.el.innerHTML = `
      <div class="routing-console-rack"><div class="rc-pipeline-graph tm-timing">
        <div class="tm-bar"><div class="pg-status" id="tmStatus"></div>
          <div class="tm-opts">
            ${box('ntp', 'NTP', 'NTP status and configuration of this machine')}
            ${box('events', 'PTP events', 'Leaders elected, clocks heard / gone, contested domains')}
            ${box('offset', 'PTP − NTP', 'Each PTP leader against this machine’s NTP clock, plotted')}
          </div>
        </div>
        <div id="tmPtp"></div><div id="tmOffset"></div><div id="tmEvents"></div><div id="tmNtp"></div>
      </div></div>`;
    this.el.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-fix-open]')) this.syncFix(true);
      if (t.closest('[data-ntp-fix]') && this.ntp?.fix) this.showFix(this.ntp.fix, 'ntp', 'This closes by itself once the clock takes its time from the NRC.');
    });
    this.el.addEventListener('change', (e) => {
      const t = e.target as HTMLInputElement;
      const k = t.dataset?.opt as keyof Opts | undefined;
      if (!k) return;
      this.opts[k] = t.checked;
      configManager.storageSet(OPTS_KEY, JSON.stringify(this.opts));
      if (k === 'ntp' && t.checked) this.ntpAt = 0;
      this.poll();
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

  /** PTP: ask once per fix; it closes by itself when the daemon stops reporting it. */
  private syncFix(force = false): void {
    if (this.fixEl?.dataset.src === 'ntp') {
      if (!this.ntp?.fix) this.closeFix(); // NRC now in use
      return;
    }
    const fix = this.online ? this.ptp?.fix : null;
    if (!fix) return this.closeFix();
    if (this.fixEl?.dataset.key === this.fixKey(fix) || (!force && this.fixDismissed.has(this.fixKey(fix)))) return;
    this.showFix(fix, 'ptp', 'This closes by itself once the TAP can hear the clocks.');
  }

  private showFix(fix: any, src: 'ptp' | 'ntp', closes: string): void {
    const key = this.fixKey(fix);
    this.closeFix();
    const el = document.createElement('div');
    el.className = 'pg-fix-backdrop';
    el.dataset.key = key;
    el.dataset.src = src;
    el.innerHTML = `
      <div class="pg-fix" role="dialog" aria-modal="true" aria-labelledby="tmFixTitle">
        <div class="pg-fix-kicker">Timing · ${src.toUpperCase()}</div>
        <h3 id="tmFixTitle">${esc(fix.title)}</h3>
        <p class="pg-fix-why">${esc(fix.why)}</p>
        ${(fix.options ?? []).map((o: any, i: number) => `
          <div class="pg-fix-opt">
            <div class="pg-fix-opt-head"><b>${esc(o.label)}</b>${o.note ? `<span>${esc(o.note)}</span>` : ''}</div>
            <div class="pg-fix-cmd"><code>${esc(o.command)}</code><button type="button" data-fix-copy="${i}">Copy</button></div>
          </div>`).join('')}
        <p class="pg-fix-how">Paste it into a terminal and press Enter (it asks for your password).
          ${esc(closes)}</p>
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
    if (this.online && this.opts.ntp && performance.now() - this.ntpAt > NTP_POLL_MS) {
      this.ntpAt = performance.now();
      try {
        const r = await fetch(`${DAEMON}/api/ntp`, { cache: 'no-store' });
        this.ntp = r.ok ? await r.json() : null;
      } catch { this.ntp = null; }
    }
    this.recordOffsets();
    this.draw();
    this.drawOffset();
    this.drawEvents();
    this.drawNtp();
    if (this.el.offsetParent) this.syncFix();
  }

  private static gmKey(c: any): string {
    return `${ptpName(c)} · ${portOf(c)} · ${c.network} · ${c.identity}`;
  }

  /** Sample every leader's PTP − NTP, whether or not the plot is showing. */
  private recordOffsets(): void {
    const t = Date.now() / 1000;
    for (const g of this.ptp?.grandmasters ?? []) {
      const v = g.ptp_offset?.ptp_minus_ntp_ns;
      if (typeof v !== 'number') continue;
      const k = TimingView.gmKey(g);
      const h = this.offsets.get(k) ?? [];
      h.push({ t, v });
      if (h.length > OFFSET_KEEP) h.shift();
      this.offsets.set(k, h);
    }
  }

  /** One row per leader: the latest value and a plot of the last 10 minutes. Nothing at all without PTP. */
  private drawOffset(): void {
    const host = this.el.querySelector('#tmOffset') as HTMLElement | null;
    if (!host) return;
    const live = new Set((this.ptp?.grandmasters ?? []).map((g: any) => TimingView.gmKey(g)));
    const rows = [...this.offsets].filter(([k, h]) => live.has(k) && h.length > 1);
    if (!this.opts.offset || !rows.length) { host.innerHTML = ''; return; }
    host.innerHTML = `
      <div class="tm-head">PTP − NTP</div>
      ${rows.map(([k, h], i) => {
        const g = (this.ptp.grandmasters as any[]).find((x) => TimingView.gmKey(x) === k);
        const o = g?.ptp_offset ?? {};
        return `
        <div class="tm-off-row" title="Leader time minus this machine's NTP clock, plus a few µs of network delay${o.utc_offset_applied ? '' : '\nTAI→UTC offset not announced: the figure includes it'}">
          <div class="tm-off-name">${esc(ptpName(g))} · ${esc(portOf(g) || g.network)}<br><span>GM ${esc(g.identity)}</span></div>
          <div class="tm-off-val">${fmtNs(h[h.length - 1].v)}${o.spread_ns != null ? `<span>± ${fmtNs(o.spread_ns).slice(1)}</span>` : ''}</div>
          <canvas class="tm-off-plot" id="tmOffPlot${i}" height="54"></canvas>
        </div>`;
      }).join('')}`;
    rows.forEach(([, h], i) => this.plot(host.querySelector(`#tmOffPlot${i}`) as HTMLCanvasElement, h));
  }

  private plot(cv: HTMLCanvasElement | null, h: { t: number; v: number }[]): void {
    if (!cv) return;
    const w = (cv.width = Math.max(120, Math.round(cv.clientWidth * devicePixelRatio)));
    const ht = (cv.height = Math.round(54 * devicePixelRatio));
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const css = getComputedStyle(cv);
    const line = css.getPropertyValue('--pg-clock').trim() || '#b45309';
    const grid = css.getPropertyValue('--pg-lane-line').trim() || '#8c897b';
    let lo = Math.min(...h.map((p) => p.v)), hi = Math.max(...h.map((p) => p.v));
    if (hi - lo < 1) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.1;
    lo -= pad; hi += pad;
    const t0 = h[0].t, t1 = Math.max(h[h.length - 1].t, t0 + 1);
    const x = (t: number) => ((t - t0) / (t1 - t0)) * (w - 2) + 1;
    const y = (v: number) => ht - 2 - ((v - lo) / (hi - lo)) * (ht - 4);
    ctx.clearRect(0, 0, w, ht);
    if (lo < 0 && hi > 0) {
      ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(0, y(0)); ctx.lineTo(w, y(0)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = line; ctx.lineWidth = 1.5 * devicePixelRatio;
    ctx.beginPath();
    h.forEach((p, i) => (i ? ctx.lineTo(x(p.t), y(p.v)) : ctx.moveTo(x(p.t), y(p.v))));
    ctx.stroke();
  }

  /** What changed, newest first. Silent until something happens. */
  private drawEvents(): void {
    const host = this.el.querySelector('#tmEvents') as HTMLElement | null;
    if (!host) return;
    const ev: any[] = this.ptp?.events ?? [];
    if (!this.opts.events || !ev.length) { host.innerHTML = ''; return; }
    host.innerHTML = `
      <div class="tm-head">PTP EVENTS</div>
      <div class="tm-events">${ev.slice(-60).reverse().map((e) => `
        <div class="tm-ev tm-ev-${esc(e.kind)}"><span class="tm-ev-t">${hms(e.t)}</span><b>${esc(e.kind)}</b> ${esc(e.text)}</div>`).join('')}
      </div>`;
  }

  /** NTP: how this machine keeps time, and the configuration behind it. */
  private drawNtp(): void {
    const host = this.el.querySelector('#tmNtp') as HTMLElement | null;
    if (!host) return;
    const n = this.ntp;
    if (!this.opts.ntp || !n) { host.innerHTML = ''; return; }
    const st = n.status ?? {};
    const cell = (k: string, v: unknown) => (v != null && v !== '' ? `<div><span>${k}</span>${esc(v)}</div>` : '');
    const servers = Object.entries(n.servers ?? {}).filter(([, v]) => Array.isArray(v) && v.length)
      .map(([k, v]) => cell(k, (v as string[]).join(' '))).join('');
    host.innerHTML = `
      <div class="tm-head">NTP</div>
      <div class="pg-status"><span class="pg-chip pg-chip-${n.synchronized ? 'on' : 'off'}"><i></i>${n.synchronized ? 'synchronized' : n.enabled ? 'not synchronized' : 'NTP off'}</span><span class="pg-iface">${esc(n.daemon)}${n.timezone ? ` · ${esc(n.timezone)}` : ''}${n.nrc ? ' · NRC' : ''}</span>${n.fix ? '<button type="button" class="pg-fix-open" data-ntp-fix title="Take time from the National Research Council Canada">Use NRC time…</button>' : ''}</div>
      <div class="tm-kv">
        ${cell('server', st.server)}${cell('stratum', st.stratum)}${cell('offset', st.offset)}${cell('delay', st.delay)}
        ${cell('jitter', st.jitter)}${cell('poll', st.poll_interval)}${cell('root distance', st.root_distance)}${cell('leap', st.leap)}
        ${cell('frequency', st.frequency)}${cell('packets', st.packets)}
      </div>
      <div class="tm-head">NTP CONFIG</div>
      <div class="tm-kv">${servers}${cell('poll min', n.poll_min)}${cell('poll max', n.poll_max)}${cell('root distance max', n.root_distance_max)}</div>
      ${(n.config ?? []).map((f: any) => `
        <div class="tm-conf"><div class="tm-conf-file">${esc(f.file)}</div><pre>${esc((f.lines ?? []).join('\n') || '(defaults: nothing set)')}</pre></div>`).join('')}`;
  }

  private draw(): void {
    const host = this.el.querySelector('#tmPtp');
    const statusEl = this.el.querySelector('#tmStatus');
    if (!host || !statusEl) return;
    const p = this.ptp || {};
    const abc = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    // Keep everything ever heard; what is not reported now is drawn as gone. Alphabetical, so rows never jump.
    const keep = (seen: Map<string, any>, list: any[], key: (c: any) => string) => {
      const now = new Set<string>();
      for (const c of list) { const k = key(c); now.add(k); seen.set(k, c); }
      return [...seen].map(([k, c]) => (now.has(k) ? c : { ...c, gone: true }));
    };
    const gmKey = TimingView.gmKey;
    const clockKey = (c: any) => `${portOf(c)} · ${c.network} · ${ptpName(c)} · ${c.clock_identity}`;
    const gms: any[] = keep(this.seenGms, p.grandmasters ?? [], gmKey).sort((a, b) => abc(gmKey(a), gmKey(b)));
    const clocks: any[] = keep(this.seenClocks, p.clocks ?? [], clockKey);

    // No PTP on the wire is silence, not a fault: a grey chip and nothing below it.
    const quiet = this.online && p.listening && !clocks.length;
    const state = !this.online ? 'err' : p.listening ? (quiet ? 'off' : 'on') : 'err';
    const src = p.mode === 'passive' ? `MQTT · ${p.source || 'apk-ptp'}` : p.mode === 'apk-ptp' ? 'apk-ptp' : '224.0.1.129';
    // Offline, or an older TAP still waiting on the APK MQTT broker: point at the download.
    const getTap = !this.online || p.mode === 'passive';
    const status = !this.online
      ? 'TAP offline'
      : p.listening ? (quiet ? '' : `${src} · ${clocks.length} clock${clocks.length === 1 ? '' : 's'}${p.error ? ` · ${p.error}` : ''}`) : (p.error || 'PTP listener not running');

    const chips = gms.length
      ? gms.map((c) => {
          const contested = c.sync_health === 'contested';
          return `
            <div class="tm-gm tm-v${c.version}${contested ? ' tm-contested' : ''}${c.gone ? ' tm-gone' : ''}" title="Grandmaster ${esc(c.identity)}${c.source_ip ? ` from ${esc(c.source_ip)}` : ''}${portOf(c) ? ` on port ${esc(portOf(c))}` : ''}${c.version === 1 ? ` (subdomain ${esc(c.domain)})` : ''}${contested ? '\nContested: more than one grandmaster on this domain and port' : ''}${c.gone ? '\nNot heard now: kept as a placeholder' : ''}">
              <div class="tm-gm-name">⏱ ${esc(ptpName(c))} · ${esc(c.network)}${c.priority1 != null ? ` · p1 ${esc(c.priority1)}` : ''}</div>
              <div class="tm-gm-id">${contested ? '⚠ contested · ' : ''}GM ${esc(c.identity)}${portOf(c) ? ` · ${esc(portOf(c))}` : ''}</div>
            </div>`;
        }).join('')
      : '';

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

    statusEl.innerHTML = `<span class="pg-chip pg-chip-${state}"><i></i>PTP</span><span class="pg-iface">${esc(status)}${getTap ? `${status ? ' · ' : ''}<a href="${TAP_DOWNLOAD}" target="_blank" rel="noopener">${this.online ? 'update' : 'download'} the Ward-Beck Audio Tap</a> to hear PTP clocks` : ''}</span>${p.fix && this.online ? '<button type="button" class="pg-fix-open" data-fix-open>Fix…</button>' : ''}`;
    host.innerHTML = `
      ${gms.length ? `<div class="tm-head">GRANDMASTERS</div>
      <div class="tm-gms">${chips}</div>` : ''}
      ${clocks.length ? `
      <div class="tm-head">CLOCKS</div>
      <div class="tm-table-wrap"><table class="tm-table">
        <thead><tr><th></th><th>Identity</th><th>Vendor</th><th>PTP</th><th>Network</th><th>Port</th><th>P1 / P2</th><th>Class</th><th>Accuracy</th><th>Time source</th><th>Health</th><th>Seen</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : ''}`;
  }
}
