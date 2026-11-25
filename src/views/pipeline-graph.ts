/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Live signal-flow graph of the layered Linux audio pipeline (data tab).
 *
 *   1 ALSA HARDWARE → 2 PIPEWIRE GRAPH → 3 MXL SHARED MEMORY → 4 NETWORK AoIP
 *                                                        └── PTP clock band ──┘
 *
 * Fed by the ward-beck-audio-tab.py daemon: /api/pipeline (layers 1–3) and
 * /api/aoip (layer 4 + the "multicast" block: SAP sessions, PTP clocks, SIP).
 * PTP is read passively by the daemon from the apk-ptp MQTT topic.
 * Nothing is synthesized: an empty lane means the daemon reported nothing.
 *
 * Every card is a test point: clicking it opens a chooser of the receivers that can take it.
 * METER clips the daemon's test point onto it (POST /api/testpoint), which holds that point
 * in a 10 s ring buffer and meters it in the Scanalyzer eye. NETWORK RX / MOIP RX point a
 * router receiver at it (POST /api/receiver {slot, kind, ref, label}); AoIP and MXL audio
 * cards only. The holder is lit; pressing it again lifts it ({stop: true}).
 */

import type { XmxlInstance } from '../audio/engine/sources/xmxl-discovery';

const DAEMON = 'http://localhost:8467';
const POLL_MS = 4000;

const W = 1000;          // viewBox width
const LANE_W = 214;
const LANE_X = [8, 264, 520, 776]; // module faces span LANE_X-4 .. LANE_X+LANE_W+4: last ends at 994 < W
const NODE_H = 21;
const NODE_GAP = 4;
const FOOT = 26;         // module foot: thumb screw + WBS badge (M460 face)
const TOP = 28;          // first node y
const GROUP_GAP = 6;     // between groups of similar names

type Kind = 'hw' | 'pw' | 'mxl' | 'dante' | 'ravenna' | 'sap' | 'nmos' | 'sip' | 'moip' | 'hub';

interface GNode {
  id: string;
  lane: number;
  label: string;
  sub?: string;
  /** a second line that says nothing next to its neighbours: shown only on the clicked card */
  detail?: string;
  kind: Kind;
  live?: boolean;        // heard on the wire / actually running
  writing?: boolean;     // MXL flow: its write head moved since the last poll (green)
  title?: string;
  hub?: boolean;
  tap?: { kind: 'hw' | 'pw' | 'mxl' | 'aoip'; ref: string };
  pick?: { inst: string; flow: string };   // locally discovered node/flow: shown in the ring buffer
  gone?: boolean;        // seen earlier, not reported now: inactive placeholder
  badges?: string[];     // how it was heard (SAP, SIP), drawn on the node instead of a global chip
  domain?: string;       // MXL lane: the domain a flow / app belongs to (one hub per domain)
}

interface GEdge { from: string; to: string; clock?: boolean }

interface Listener { listening?: boolean; error?: string | null; packets?: number }

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
// mDNS / DNS-SD names arrive with decimal escapes (Desk\032preMO = "Desk preMO").
const dnsName = (s: string) => s.replace(/\\(\d{3})/g, (_, d) => String.fromCharCode(+d));
// Shorten an SVG <text> with an ellipsis until it is no wider than maxW (user units).
// Character-count trunc() guesses; this measures, so badges and tags never collide.
function fitText(t: SVGTextContentElement | null, maxW: number): void {
  if (!t || maxW <= 0) return;
  const full = t.textContent ?? '';
  if (t.getComputedTextLength() <= maxW) return;
  let lo = 0, hi = full.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    t.textContent = full.slice(0, mid).trimEnd() + '…';
    if (t.getComputedTextLength() <= maxW) lo = mid; else hi = mid - 1;
  }
  t.textContent = full.slice(0, lo).trimEnd() + '…';
}

async function getJson(path: string): Promise<any | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    const res = await fetch(`${DAEMON}${path}`, { signal: ctl.signal });
    clearTimeout(t);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export class PipelineGraph {
  private timer: number | null = null;
  private pipeline: any = null;
  private aoip: any = null;
  private online = false;
  private testPoint: any = null;
  /** /api/receiver: the router's receivers (network, MoIP) and the point each one is pointed at. */
  private receivers: Record<string, any> = {};
  private taps = new Map<string, GNode>();
  private fixDismissed = new Set<string>();
  private fixEl: HTMLElement | null = null;
  private fixTimer: number | null = null;
  private local: XmxlInstance[] = [];
  /** Every node seen this session, by id: dropouts stay as inactive placeholders. */
  private seenNodes = new Map<string, GNode>();
  /** Last write_seq per MXL flow: a flow whose sequence moves is being written. */
  private mxlSeq = new Map<string, number>();
  private picked = '';
  /** The clicked card: brought to the front, highlighted, its details shown. */
  private focused = '';
  /** The card whose receiver chooser is open ('' = closed). */
  private chooser = '';
  private onPick?:(instId: string, flowId: string) => void;

  /** HTML docked in a lane's free space under its cards: lane 0 (ALSA) holds the telemetry
   *  cards, lane 1 (PipeWire) the INPUT 1-4 rings. */
  private docks: { el: HTMLElement; lane: number }[] = [];
  setDock(el: HTMLElement | null, lane = 0): void {
    if (!el) return;
    this.docks = this.docks.filter((d) => d.lane !== lane);
    this.docks.push({ el, lane });
    el.classList.add('pg-dock', `pg-dock-${lane}`);
  }

  constructor(private el: HTMLElement, private onTap?: (active: boolean) => void) {
    // One delegated listener: cards are re-rendered on every poll.
    this.el.addEventListener('click', (e) => {
      if ((e.target as Element).closest?.('[data-fix-open]')) {
        if (this.testPoint?.fix) this.fixDismissed.delete(this.fixKey(this.testPoint.fix));
        this.syncFixPrompt();
        return;
      }
      const rx = (e.target as Element).closest?.('[data-rx]');
      if (rx) {
        const n = this.taps.get(this.chooser);
        if (n) this.route(n, rx.getAttribute('data-rx') || '');
        return;
      }
      if ((e.target as Element).closest?.('.pg-chooser')) return;
      const card = (e.target as Element).closest?.('[data-node]');
      if (card) {
        const id = card.getAttribute('data-node') || '';
        this.focused = this.focused === id ? '' : id;
      }
      const g = (e.target as Element).closest?.('[data-tap]');
      const node = g ? this.taps.get(g.getAttribute('data-tap') || '') : undefined;
      // A tappable card toggles its chooser; anywhere else closes it.
      const was = this.chooser;
      this.chooser = node?.tap && this.chooser !== node.id ? node.id : '';
      if (card || was !== this.chooser) this.draw();
      if (node?.pick) this.onPick?.(node.pick.inst, node.pick.flow);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.chooser) { this.chooser = ''; this.draw(); }
    });
    // composedPath, not contains(): by now the clicked card has been re-rendered out of the DOM.
    document.addEventListener('click', (e) => {
      if (this.chooser && !e.composedPath().includes(this.el)) { this.chooser = ''; this.draw(); }
    });
  }

  /** Router receivers that can take this card: AoIP and MXL audio points, never a receiver's own output. */
  private rxSlots(n: GNode): string[] {
    if (!n.tap || (n.tap.kind !== 'aoip' && n.tap.kind !== 'mxl')) return [];
    const own = new Set(Object.values(this.receivers).flatMap((r: any) => [r?.flow_id, r?.fold_flow_id]).filter(Boolean));
    if (n.tap.kind === 'mxl' && own.has(n.tap.ref)) return [];
    return Object.keys(this.receivers);
  }

  private holds(slot: string, n: GNode): boolean {
    const r = this.receivers[slot];
    return !!(n.tap && r?.active && r.point && r.point.kind === n.tap.kind && r.point.ref === n.tap.ref);
  }

  /** A chooser button: 'meter' clips the test point; a receiver slot is pointed here, or lifted if it already is. */
  private async route(n: GNode, slot: string): Promise<void> {
    if (slot === 'meter') return this.clip(n);
    if (!this.rxSlots(n).includes(slot)) return;
    const body = this.holds(slot, n) ? { slot, stop: true } : { slot, kind: n.tap!.kind, ref: n.tap!.ref, label: n.label };
    try {
      const res = await fetch(`${DAEMON}/api/receiver`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = res.ok ? await res.json() : null;
      if (d && typeof d === 'object' && !d.error) this.receivers = d;
    } catch { /* the next poll shows the truth */ }
    this.draw();
  }

  /** Pop-over beside the open card: cap-coloured push-buttons, the current holder lit. */
  private chooserEl(n: GNode): HTMLElement {
    const el = document.createElement('div');
    el.className = 'pg-chooser';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', `Receivers for ${n.label}`);
    const btn = (slot: string, cap: string, text: string, lit: boolean) =>
      `<button type="button" class="pg-cap pg-cap-${cap}${lit ? ' lit' : ''}" data-rx="${esc(slot)}" aria-pressed="${lit}"><i></i>${esc(text)}</button>`;
    el.innerHTML = btn('meter', 'red', 'METER', this.isClipped(n))
      + this.rxSlots(n).map((s) => btn(s, 'yellow', `${s.toUpperCase()} RX`, this.holds(s, n))).join('');
    return el;
  }

  /** Locally discovered XMXL nodes and flows (xmxl-discovery): drawn as signals in the MXL / AoIP lanes. */
  setLocal(instances: XmxlInstance[], pickedFlow: string, onPick: (instId: string, flowId: string) => void): void {
    this.local = instances;
    this.picked = pickedFlow;
    this.onPick = onPick;
    this.draw();
  }

  /** Clip the test point onto a card, or lift it if that card is already clipped. */
  private async clip(n: GNode): Promise<void> {
    const lift = this.isClipped(n);
    const body = lift ? { stop: true } : { kind: n.tap!.kind, ref: n.tap!.ref, label: n.label };
    try {
      const res = await fetch(`${DAEMON}/api/testpoint`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = res.ok ? await res.json() : null;
      this.testPoint = d?.point ?? null;
    } catch {
      this.testPoint = null;
    }
    this.onTap?.(!!this.testPoint);
    this.draw();
  }

  // ───────────────────────── runtime prompt ─────────────────────────
  // When the daemon finds something only the user can do (e.g. open the firewall), it
  // returns point.fix = {title, why, options:[{label, note, command}]}. Ask for it right
  // then: a prompt with the command(s) to paste into a terminal. The probe keeps
  // listening, so the prompt closes by itself once the point starts metering.

  private fixKey(fix: any): string {
    return `${fix.title}|${(fix.options ?? []).map((o: any) => o.command).join('|')}`;
  }

  private syncFixPrompt(): void {
    const fix = this.testPoint?.fix;
    if (!fix || this.fixDismissed.has(this.fixKey(fix))) {
      const resolved = this.fixEl && !fix && this.testPoint?.status === 'running';
      this.closeFixPrompt(resolved ? `${this.testPoint.label} is metering` : '');
      return;
    }
    if (this.fixEl?.dataset.key === this.fixKey(fix)) return;
    this.closeFixPrompt('');
    const el = document.createElement('div');
    el.className = 'pg-fix-backdrop';
    el.dataset.key = this.fixKey(fix);
    el.innerHTML = `
      <div class="pg-fix" role="dialog" aria-modal="true" aria-labelledby="pgFixTitle">
        <div class="pg-fix-kicker">Test point · ${esc(this.testPoint.label)}</div>
        <h3 id="pgFixTitle">${esc(fix.title)}</h3>
        <p class="pg-fix-why">${esc(fix.why)}</p>
        ${(fix.options ?? []).map((o: any, i: number) => `
          <div class="pg-fix-opt">
            <div class="pg-fix-opt-head"><b>${esc(o.label)}</b>${o.note ? `<span>${esc(o.note)}</span>` : ''}</div>
            <div class="pg-fix-cmd"><code>${esc(o.command)}</code><button type="button" data-fix-copy="${i}">Copy</button></div>
          </div>`).join('')}
        <p class="pg-fix-how">Paste it into a terminal and press Enter (it asks for your password).
          The test point is still listening: this prompt closes by itself when audio arrives.</p>
        <div class="pg-fix-status" aria-live="polite">Waiting for audio…</div>
        <div class="pg-fix-actions"><button type="button" data-fix-dismiss>Not now</button></div>
      </div>`;
    el.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const copy = t.closest('[data-fix-copy]') as HTMLElement | null;
      if (copy) {
        const cmd = fix.options[Number(copy.dataset.fixCopy)]?.command ?? '';
        const done = () => { copy.textContent = 'Copied'; setTimeout(() => (copy.textContent = 'Copy'), 1500); };
        navigator.clipboard?.writeText(cmd).then(done, () => this.selectCode(copy));
        return;
      }
      if (t.closest('[data-fix-dismiss]') || t === el) {
        this.fixDismissed.add(el.dataset.key || '');
        this.closeFixPrompt('');
      }
    });
    document.body.appendChild(el);
    this.fixEl = el;
    (el.querySelector('[data-fix-copy]') as HTMLElement | null)?.focus();
    // Poll quickly while the user is in the terminal, so the prompt reacts as soon as audio flows.
    const poll = async () => {
      const t = await getJson('/api/testpoint');
      this.testPoint = t?.point ?? null;
      this.draw();
      if (this.fixEl) this.fixTimer = window.setTimeout(poll, 1000);
    };
    this.fixTimer = window.setTimeout(poll, 1000);
  }

  private selectCode(btn: HTMLElement): void {
    const code = btn.parentElement?.querySelector('code');
    if (!code) return;
    const r = document.createRange();
    r.selectNodeContents(code);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
    btn.textContent = 'Ctrl+C';
  }

  private closeFixPrompt(success: string): void {
    if (this.fixTimer !== null) clearTimeout(this.fixTimer);
    this.fixTimer = null;
    const el = this.fixEl;
    if (!el) return;
    this.fixEl = null;
    if (success) {
      const st = el.querySelector('.pg-fix-status');
      if (st) { st.textContent = `✓ Receiving — ${success}`; st.classList.add('ok'); }
      setTimeout(() => el.remove(), 1400);
    } else {
      el.remove();
    }
  }

  /** Router receivers (network, MoIP) pointed at this card's point. */
  private routedBy(n: GNode): string[] {
    if (!n.tap) return [];
    return Object.entries(this.receivers)
      .filter(([, r]) => r?.active && r.point && r.point.kind === n.tap!.kind && r.point.ref === n.tap!.ref)
      .map(([name, r]) => (r.ams81 ? `${name} ${r.ams81}` : name));
  }

  private isClipped(n: GNode): boolean {
    const tp = this.testPoint;
    return !!(tp && n.tap && tp.kind === n.tap.kind && tp.ref === n.tap.ref);
  }

  start(): void {
    this.draw();
    const tick = async () => {
      // Only poll while the data tab is on screen.
      if (this.el.offsetParent !== null) {
        const [p, a, t, r] = await Promise.all([getJson('/api/pipeline'), getJson('/api/aoip'), getJson('/api/testpoint'), getJson('/api/receiver')]);
        this.receivers = r ?? {};
        this.online = !!(p || a);
        this.pipeline = p?.pipeline ?? p;
        this.aoip = a;
        this.testPoint = t?.point ?? null;
        this.draw();
      }
      this.timer = window.setTimeout(tick, POLL_MS);
    };
    tick();
  }

  stop(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  // ───────────────────────── model ─────────────────────────

  private build(): { nodes: GNode[]; edges: GEdge[]; mc: any } {
    const nodes: GNode[] = [];
    const edges: GEdge[] = [];
    const layers = this.pipeline?.layers ?? {};
    const alsa = layers.layer1_kernel_hardware?.telemetry ?? {};
    const pw = layers.layer2_graph_session?.telemetry ?? {};
    const mxl = layers.layer3_shared_memory_mxl?.telemetry ?? {};
    const aoip = this.aoip ?? layers.layer4_network_aoip?.telemetry ?? {};
    const mc = aoip.multicast ?? null;

    // 1 · ALSA: one node per card (devices of the same card collapse).
    const cards = new Map<string, string[]>();
    for (const line of (alsa.cards ?? []) as string[]) {
      const m = /^card (\d+): (\S+) \[([^\]]+)\], device (\d+): (.*)$/.exec(line);
      const key = m ? `card ${m[1]} · ${m[3]}` : line;
      const dev = m ? `dev ${m[4]} ${m[5]}` : '';
      cards.set(key, [...(cards.get(key) ?? []), dev]);
    }
    [...cards].forEach(([name, devs]) => {
      const idx = /^card (\d+)/.exec(name)?.[1];
      nodes.push({ id: `hw_${name}`, lane: 0, kind: 'hw', label: name, sub: `${devs.length} PCM device${devs.length === 1 ? '' : 's'}`, title: devs.join('\n'), live: true, tap: idx ? { kind: 'hw', ref: idx } : undefined });
    });

    // 2 · PipeWire: graph hub, then streams.
    const rate = pw.graph_sample_rate, q = pw.graph_quantum;
    nodes.push({
      id: 'pw', lane: 1, kind: 'hub', hub: true, live: pw.status === 'running',
      label: 'PipeWire graph', sub: rate ? `${q} / ${rate / 1000}k · ${pw.graph_quantum_ms} ms` : 'not reported',
    });
    for (const s of (pw.streams ?? []) as string[]) {
      const oid = /^(\d+)\./.exec(String(s))?.[1];
      nodes.push({ id: `pws_${String(s).replace(/^\d+\.\s*/, '')}`, lane: 1, kind: 'pw', label: String(s).replace(/^\d+\.\s*/, ''), sub: 'stream', live: true, tap: oid ? { kind: 'pw', ref: oid } : undefined });
    }

    // 3 · MXL: domain hub, then flows.
    const flows: any[] = mxl.flows ?? [];
    // The TAP's domain: from its pipeline report, else from discovery of :8467, else a placeholder.
    const tapDomain = mxl.domain_id && mxl.domain_id !== 'none' ? mxl.domain_id
      : this.local.find((i) => i.port === 8467 && i.type === 'wbs-router')?.domainId || 'MXL domain';
    const domainLabel = new Map<string, string>([[tapDomain, tapDomain]]);
    nodes.push({
      id: 'mxl', lane: 2, kind: 'hub', hub: true, live: flows.length > 0, domain: tapDomain,
      label: tapDomain,
      sub: mxl.shm_base_dir ?? '/dev/shm/mxl',
    });
    for (const f of flows) {
      const over = (f.overrun_count ?? 0) + (f.underrun_count ?? 0);
      const seq = Number(f.write_seq ?? f.write_head ?? NaN);
      const prev = this.mxlSeq.get(f.flow_id);
      if (!isNaN(seq)) this.mxlSeq.set(f.flow_id, seq);
      const writing = prev !== undefined && !isNaN(seq) && seq !== prev;
      nodes.push({
        id: `fl_${f.flow_id}`, lane: 2, kind: 'mxl', live: true, writing, label: f.label || f.flow_id, domain: tapDomain,
        sub: `${f.channel_count}ch · ${(f.sample_rate ?? 48000) / 1000}k${over ? ` · ${over} xrun` : ''}`, title: f.flow_id,
        tap: { kind: 'mxl', ref: f.flow_id },
      });
    }

    const seenFlowIds = new Set<string>(flows.map((f) => f.flow_id));

    // 4 · AoIP: what multicast actually heard first, then mDNS/NMOS announcements.
    const heardIps = new Set<string>();
    for (const s of mc?.sap?.sessions ?? []) {
      heardIps.add(s.origin_ip);
      nodes.push({
        id: `sap_${s.id}`, lane: 3, kind: 'sap', live: true, label: s.session_name || s.multicast_ip,
        sub: `${s.multicast_ip}:${s.port} · ${s.channels ?? '?'}ch ${s.encoding ?? ''}`, badges: ['SAP'],
        title: `origin ${s.origin_ip}\nPTP GM ${s.ptp_grandmaster ?? '—'} (domain ${s.ptp_domain ?? '—'})`,
        tap: { kind: 'aoip', ref: s.id },
      });
    }
    for (const c of mc?.ptp?.clocks ?? []) heardIps.add(c.source_ip);
    // RAVENNA / NMOS / Dante cards tap their SAP-announced stream (by name, else the device's first one).
    const sapNames = new Set<string>((mc?.sap?.sessions ?? []).map((s: any) => s.session_name));
    for (const d of aoip.dante?.devices ?? [])
      nodes.push({ id: `dante_${d.ip}_${d.name}`, lane: 3, kind: 'dante', live: heardIps.has(d.ip), label: d.name, sub: `Dante · ${d.ip}`, title: `${d.manufacturer ?? ''} ${d.engine ?? ''} ${d.version ?? ''}`, tap: { kind: 'aoip', ref: d.ip } });
    for (const r of aoip.ravenna?.streams ?? [])
      nodes.push({ id: `rav_${r.ip}_${r.name}`, lane: 3, kind: 'ravenna', live: heardIps.has(r.ip), label: r.name, sub: `RAVENNA · ${r.ip}`, title: r.url, tap: { kind: 'aoip', ref: sapNames.has(r.name) ? r.name : r.ip }, badges: sapNames.has(r.name) ? ['SAP'] : undefined });
    for (const n of aoip.nmos?.nodes ?? [])
      nodes.push({ id: `nmos_${n.ip}_${n.name}`, lane: 3, kind: 'nmos', live: heardIps.has(n.ip), label: n.name, sub: `NMOS IS-04 · ${n.ip}`, tap: { kind: 'aoip', ref: n.ip } });
    for (const m of mc?.sip?.messages ?? [])
      nodes.push({ id: `sip_${m.method}_${m.from}`, lane: 3, kind: 'sip', live: true, label: `${m.method} ${m.from}`, sub: `${m.source_ip} · ×${m.count}`, title: m.user_agent, badges: ['SIP'] });

    // Every flow in every domain under /dev/shm/mxl (nested ones too), each with how long ago it
    // started, listed once under its home domain (the Tap marks copies elsewhere `home: false`).
    // Clicking an audio flow points the test point at it.
    const age = (sec: number) => sec < 90 ? `${Math.round(sec)}s` : sec < 5400 ? `${Math.round(sec / 60)}m`
      : sec < 172800 ? `${Math.round(sec / 3600)}h` : `${Math.round(sec / 86400)}d`;
    for (const [dlbl, dom] of Object.entries<any>(mxl.domains ?? {})) {
      for (const f of dom?.flows ?? []) {
        const fid = String(f.flow_id ?? f.id ?? '');
        if (!fid || f.home === false || seenFlowIds.has(fid)) continue;
        seenFlowIds.add(fid);
        const d = dlbl === mxl.domain_id ? tapDomain : dlbl;
        if (!domainLabel.has(d)) domainLabel.set(d, dlbl);
        const audio = String(f.format ?? '').includes('audio') || String(f.media_type ?? '').startsWith('audio');
        const sr = typeof f.sample_rate === 'object' ? f.sample_rate?.numerator : f.sample_rate;
        const what = audio ? `${f.channel_count ?? '?'}ch · ${(sr ?? 48000) / 1000}k` : String(f.media_type ?? f.format ?? 'flow').replace(/^.*[:/]/, '');
        const old = typeof f.age_sec === 'number' ? ` · ${age(f.age_sec)} old` : '';
        const started = typeof f.started_at === 'number' ? `\nstarted ${new Date(f.started_at * 1000).toLocaleString()}` : '';
        nodes.push({
          id: `fl_${fid}`, lane: 2, kind: 'mxl', live: f.active !== false, writing: f.active === true,
          label: f.label || fid, domain: d, sub: `${what}${old}`,
          title: `${fid}\n${f.path ?? ''}${started}${f.also_in?.length ? `\nalso in ${f.also_in.join(', ')}` : ''}`,
          tap: audio ? { kind: 'mxl', ref: fid } : undefined,
        });
      }
    }

    // Locally discovered nodes the daemon did not already report: MXL apps + their flows in lane 3,
    // network gateways in lane 4. Clicking one shows that flow in the ring buffer below.
    const base = (s: string) => s.replace(/\s*\(.*$/, '').trim().toLowerCase();
    const seen = new Set(nodes.map((n) => base(n.label)));
    const heardSap = (mc?.sap?.sessions ?? []).length > 0;
    const seenFlow = seenFlowIds;
    const short = (s: string) => s.replace(/^(Ward-Beck Systems|Ward-Beck|CBC\/Radio-Canada|NMOS IS-04:|Dante:|Ravenna:|AES67:|LikeDotAudio:)\s*/i, '').replace(/^⚡\s*/, '');
    const netKind: Partial<Record<XmxlInstance['type'], Kind>> = { 'dante-node': 'dante', 'ravenna-node': 'ravenna', 'aes67-node': 'sap', 'nmos-node': 'nmos', 'moip-node': 'moip' };
    for (const inst of this.local) {
      const nk = netKind[inst.type];
      const name = short(inst.name);
      const first = inst.flows[0]?.flowId ?? '';
      if (nk) {
        if (seen.has(base(name)) || (nk === 'sap' && heardSap)) continue;
        seen.add(base(name));
        nodes.push({ id: `loc_${inst.id}`, lane: 3, kind: nk, live: inst.status === 'online', label: name, sub: `${inst.flows.length} flow${inst.flows.length === 1 ? '' : 's'} · ${inst.latencyMs} ms`, pick: first ? { inst: inst.id, flow: first } : undefined });
        continue;
      }
      // One domain, one group: CBC apps name it by id ('exercise-4') or by UUID + label.
      const dom = inst.port === 8467 && !inst.domainId ? tapDomain : inst.domainLabel || inst.domainId || 'local';
      if (!domainLabel.has(dom)) domainLabel.set(dom, inst.domainLabel || dom);
      if (inst.port !== 8467)
        nodes.push({ id: `loc_${inst.id}`, lane: 2, kind: 'mxl', live: inst.status === 'online', label: name, sub: `:${inst.port} · ${inst.latencyMs} ms`, title: inst.domainId, domain: dom, pick: first ? { inst: inst.id, flow: first } : undefined });
      for (const f of inst.flows) {
        if (seenFlow.has(f.flowId)) continue;
        seenFlow.add(f.flowId);
        const label = short(f.label || f.flowId).replace(/\s*\(.*\)$/, '');
        if (seen.has(base(label))) continue;
        seen.add(base(label));
        // Green: a writer holds it (MXL lock), or its write head moved since the last poll
        let writing = f.active === true;
        if (!writing && f.writeSeq) {
          const prev = this.mxlSeq.get(f.flowId);
          this.mxlSeq.set(f.flowId, f.writeSeq);
          writing = prev !== undefined && prev !== f.writeSeq;
        }
        nodes.push({ id: `locf_${f.flowId}`, lane: 2, kind: 'mxl', live: true, writing, label, sub: `${f.channelCount}ch · ${f.sampleRate / 1000}k`, title: f.label, domain: dom, pick: { inst: inst.id, flow: f.flowId } });
      }
    }

    // A node that drops out stays as an inactive placeholder (pg-gone) instead of vanishing,
    // and each lane reads alphabetically (hubs first) so nothing jumps around.
    const now = new Set<string>();
    for (const n of nodes) {
      if (now.has(n.id)) continue;
      now.add(n.id);
      this.seenNodes.set(n.id, n);
    }
    // Same thing under another name (local discovery vs the daemon): not a placeholder.
    const flowOf = (n: GNode) => n.pick?.flow ?? (n.tap?.kind === 'mxl' ? n.tap.ref : /^(?:fl|locf)_(.+)$/.exec(n.id)?.[1]);
    const alias = new Set<string>();
    for (const n of nodes) {
      alias.add('l:' + base(short(n.label)));
      const f = flowOf(n);
      if (f) alias.add('f:' + f);
    }
    for (const [id, n] of this.seenNodes) {
      if (now.has(id) || n.hub) continue;
      const f = flowOf(n);
      const sapDup = heardSap && n.kind === 'sap' && id.startsWith('loc_'); // AES67 node shown as its SAP sessions
      if (sapDup || alias.has('l:' + base(short(n.label))) || (f && alias.has('f:' + f))) { this.seenNodes.delete(id); continue; }
      nodes.push({ ...n, live: false, gone: true, tap: undefined, pick: undefined, title: `${n.title ? n.title + '\n' : ''}Not seen now: kept as a placeholder` });
    }
    const uniq = new Map(nodes.map((n) => [n.id, n] as const));
    nodes.length = 0;
    // MXL lane: one hub per domain with its flows and apps under it (the TAP's domain first).
    const mxlNodes = [...uniq.values()].filter((n) => n.lane === 2);
    for (const d of new Set(mxlNodes.map((n) => n.domain ?? tapDomain))) {
      if (mxlNodes.some((n) => n.hub && (n.domain ?? tapDomain) === d)) continue;
      const kids = mxlNodes.filter((n) => (n.domain ?? tapDomain) === d);
      uniq.set(`dom_${d}`, {
        id: `dom_${d}`, lane: 2, kind: 'hub', hub: true, domain: d, live: kids.some((k) => k.live && !k.gone),
        label: domainLabel.get(d) ?? d, sub: `${kids.length} flow${kids.length === 1 ? '' : 's'} / app${kids.length === 1 ? '' : 's'}`, title: `MXL domain ${d}`,
      });
    }
    // Similar names sit together: grouped by their first four letters (POD-…, WBS-…, ABB-…)
    const group = (n: GNode) => n.label.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
    const domRank = (n: GNode) => (n.lane !== 2 ? '' : (n.domain ?? tapDomain) === tapDomain ? '0' : '1' + (domainLabel.get(n.domain!) ?? n.domain));
    nodes.push(...[...uniq.values()].sort((a, b) =>
      a.lane - b.lane || domRank(a).localeCompare(domRank(b)) || Number(!!b.hub) - Number(!!a.hub)
      || group(a).localeCompare(group(b)) || a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })));

    // A second line only when it tells this card apart: one most of its column shares (every flow
    // "2ch · 48k", every PipeWire node "stream") says nothing, so it moves to the tooltip.
    for (const lane of [0, 1, 2, 3]) {
      const inLane = nodes.filter((n) => n.lane === lane && !n.hub && n.sub);
      const count = new Map<string, number>();
      inLane.forEach((n) => count.set(n.sub!, (count.get(n.sub!) ?? 0) + 1));
      for (const n of inLane) {
        if (n.sub === 'stream' || (inLane.length > 2 && count.get(n.sub!)! > inLane.length / 2)) {
          n.detail = n.sub;
          n.sub = undefined;
        }
      }
    }

    // Edges: every card feeds the graph; graph feeds MXL; MXL bridges to the network.
    for (const n of nodes) {
      if (n.lane === 0) edges.push({ from: n.id, to: 'pw' });
      if (n.lane === 1 && !n.hub) edges.push({ from: 'pw', to: n.id });
      if (n.lane === 2 && !n.hub) edges.push({ from: (n.domain ?? tapDomain) === tapDomain ? 'mxl' : `dom_${n.domain}`, to: n.id });
    }
    edges.push({ from: 'pw', to: 'mxl' });

    return { nodes, edges, mc };
  }

  // ───────────────────────── view ─────────────────────────

  private tpChip(): string {
    const tp = this.testPoint;
    if (!tp) return '';
    const state = tp.status === 'running' ? 'on' : tp.status === 'error' ? 'err' : 'off';
    const ring = tp.ring_ms ? `${(tp.ring_ms / 1000).toFixed(0)} s ring · ${tp.ring_frames.toLocaleString()} fr · ${tp.packet_frames}-fr packets` : '';
    const lost = tp.lost_packets ? ` · ${tp.lost_packets} lost` : '';
    const why = [tp.status, ring, tp.source, tp.error || tp.hint].filter(Boolean).join('\n');
    return `<span class="pg-chip pg-chip-${state} pg-tp-chip" title="${esc(why)}"><i></i>TP ${esc(trunc(tp.label, 24))}${lost}</span>`
      + (tp.error || tp.hint ? `<span class="pg-tp-why">${esc(tp.error || tp.hint)}</span>` : '')
      + (tp.fix ? `<button type="button" class="pg-fix-open" data-fix-open>Fix…</button>` : '');
  }

  private draw(): void {
    const { nodes, edges, mc } = this.build();

    // Lay out each lane top-down, every node shown; a small gap opens between groups of
    // similar names (first four letters) and between domains.
    const pos = new Map<string, { x: number; y: number }>();
    const shown: GNode[] = [];
    const extra: { lane: number; n: number; y: number }[] = [];
    const groupOf = (n: GNode) => `${n.domain ?? ''}|${n.hub ? '' : n.label.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase()}`;
    let bottom = TOP;
    const laneBottom = [TOP, TOP, TOP, TOP];
    // Docked cards sit at the top of their lane; the lane's own cards follow below them.
    // the drawn svg's own width (phone width scrolls a wider svg inside the console)
    const scale = (this.el.querySelector('.pg-svg')?.getBoundingClientRect().width || this.el.clientWidth || W) / W;
    const dockTop = [TOP, TOP, TOP, TOP];
    const laneStart = [TOP, TOP, TOP, TOP];
    for (const d of this.docks) laneStart[d.lane] = TOP + (d.el.offsetHeight || 330) / scale + 8;
    for (let lane = 0; lane < 4; lane++) {
      let y = laneStart[lane], prev: string | null = null;
      for (const n of nodes.filter((n) => n.lane === lane)) {
        const g = groupOf(n);
        if (prev !== null && g !== prev) y += GROUP_GAP;
        prev = g;
        pos.set(n.id, { x: LANE_X[lane], y });
        shown.push(n);
        y += NODE_H + NODE_GAP;
      }
      bottom = Math.max(bottom, y);
      laneBottom[lane] = y;
    }
    for (const d of this.docks) bottom = Math.max(bottom, laneStart[d.lane]);
    const H = Math.max(bottom, TOP + NODE_H + NODE_GAP) + 6 + FOOT; // PTP clocks live in the Timing tab

    // Network nodes hang off the MXL hub.
    const netLinks = shown.filter((n) => n.lane === 3).map((n) => ({ from: 'mxl', to: n.id, live: n.live }));

    const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const x1 = a.x + LANE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
      if (x2 <= x1) { // same lane: hub → child, drawn down the left gutter
        const gx = a.x - 2;
        return `M ${a.x + 10} ${a.y + NODE_H} C ${gx} ${a.y + NODE_H + 8}, ${gx} ${y2}, ${b.x} ${y2}`;
      }
      const mx = (x1 + x2) / 2;
      return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    };

    const edgeSvg = [...edges, ...netLinks].map((e) => {
      const a = pos.get(e.from), b = pos.get(e.to);
      if (!a || !b) return '';
      const live = (e as any).live !== false;
      return `<path class="pg-edge${live ? ' pg-live' : ''}" d="${curve(a, b)}"/>`;
    }).join('');

    this.taps.clear();
    const front = [...shown.filter((n) => n.id !== this.focused), ...shown.filter((n) => n.id === this.focused)];
    const nodeSvg = front.map((n) => {
      const p = pos.get(n.id)!;
      if (n.tap) this.taps.set(n.id, n);
      if (n.pick) this.taps.set(n.id, n);
      const clipped = this.isClipped(n);
      const routed = this.routedBy(n);
      const tags = [clipped ? '● METER' : '', routed.length ? '⇄ ROUTED' : ''].filter(Boolean);
      const picked = !!n.pick && n.pick.flow === this.picked;
      const tapAttr = n.tap || n.pick ? ` data-tap="${esc(n.id)}" role="button" tabindex="0"` : '';
      const focus = n.id === this.focused;
      const line2 = n.sub ?? (focus ? n.detail : undefined);
      const tapHint = (routed.length ? `\n⇄ routed by ${routed.join(', ')}` : '')
        + (n.pick ? '\nClick to show in the ring buffer' : n.tap ? '\nClick to choose a receiver: METER' + (this.rxSlots(n).length ? ' or a router receiver' : '') : '');
      return `
        <g class="pg-node pg-${n.kind}${n.live ? ' pg-on' : ''}${n.writing ? ' pg-writing' : ''}${n.hub ? ' pg-hub' : ''}${n.gone ? ' pg-gone' : ''}${n.tap ? ' pg-tappable' : ''}${n.pick ? ' pg-pickable' : ''}${clipped ? ' pg-tp' : ''}${routed.length ? ' pg-routed' : ''}${picked ? ' pg-pick' : ''}${focus ? ' pg-focus' : ''}" data-node="${esc(n.id)}"${tapAttr} transform="translate(${p.x} ${p.y})">
          <title>${esc(dnsName(n.label))}${n.sub ?? n.detail ? ` — ${esc(n.sub ?? n.detail!)}` : ''}${n.title ? `\n${esc(n.title)}` : ''}${tapHint}</title>
          <rect width="${LANE_W}" height="${NODE_H}" rx="4"/>
          <circle class="pg-dot" cx="8" cy="${NODE_H / 2}" r="2.6"/>
          <text class="pg-label" x="15" y="9">${esc(trunc(dnsName(n.label), n.badges?.length ? 34 : 40))}</text>
          ${n.badges?.length ? `<text class="pg-badge" x="${LANE_W - 5}" y="9" text-anchor="end">${esc(n.badges.join(' '))}</text>` : ''}
          ${line2 ? `<text class="pg-sub" x="15" y="17.5">${esc(trunc(line2, tags.length ? 50 - 10 * tags.length : 50))}</text>` : ''}
          ${tags.length ? `<text x="${LANE_W - 5}" y="17.5" text-anchor="end">${tags.map((t) => `<tspan class="${t.includes('METER') ? 'pg-tp-tag' : 'pg-rt-tag'}" dx="3">${t}</tspan>`).join('')}</text>` : ''}
        </g>`;
    }).join('');

    const more = extra.map((e) => `<text class="pg-more" x="${LANE_X[e.lane] + 8}" y="${e.y + 10}">+${e.n} more</text>`).join('');


    // Each lane is a module on the console, faced like an M460: anodized panel, silver trim
    // rails down both edges, a thumb screw at each end, engraved lettering, WBS badge at the foot.
    const laneHead = ['1 · ALSA HARDWARE', '2 · PIPEWIRE GRAPH', '3 · MXL SHARED MEMORY', '4 · NETWORK AoIP'];
    const laneBadge = ['ALSA', 'PW', 'MXL', 'AoIP'];
    const screw = (x: number, y: number) => `<use href="#pgScrew" x="${x}" y="${y}"/>`;
    const heads = laneHead.map((t, i) => {
      const x = LANE_X[i] - 4, w = LANE_W + 8, h = H - 8;
      return `
      <rect class="pg-lane" x="${x}" y="4" width="${w}" height="${h}"/>
      <rect class="pg-trim" x="${x}" y="4" width="3.5" height="${h}"/>
      <rect class="pg-trim" x="${x + w - 3.5}" y="4" width="3.5" height="${h}"/>
      ${screw(x + w - 14, 15)}
      <text class="pg-head" x="${LANE_X[i] + 4}" y="18">${t}</text>
      ${screw(x + 16, H - 17)}
      <text class="pg-brand" x="${x + w - 10}" y="${H - 13}" text-anchor="end">WBS <tspan class="pg-model">${laneBadge[i]}</tspan></text>`;
    }).join('');
    const defs = `<defs>
      <linearGradient id="pgPanel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#383e44"/><stop offset="0.06" stop-color="#2c3136"/>
        <stop offset="0.94" stop-color="#25292e"/><stop offset="1" stop-color="#1d2024"/></linearGradient>
      <linearGradient id="pgTrim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff"/><stop offset="0.45" stop-color="#d2d6da"/>
        <stop offset="0.55" stop-color="#9ca2a8"/><stop offset="1" stop-color="#e4e7ea"/></linearGradient>
      <linearGradient id="pgPlate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#202327"/><stop offset="1" stop-color="#16191c"/></linearGradient>
      <radialGradient id="pgLedGreen" cx="35%" cy="35%" r="65%"><stop offset="0" stop-color="#75ffad"/><stop offset="0.5" stop-color="#12a84e"/><stop offset="1" stop-color="#054a20"/></radialGradient>
      <radialGradient id="pgLedAmber" cx="35%" cy="35%" r="65%"><stop offset="0" stop-color="#ffe875"/><stop offset="0.5" stop-color="#d99b00"/><stop offset="1" stop-color="#664700"/></radialGradient>
      <radialGradient id="pgLedRed" cx="35%" cy="35%" r="65%"><stop offset="0" stop-color="#ff8a75"/><stop offset="0.5" stop-color="#d41e08"/><stop offset="1" stop-color="#5e0900"/></radialGradient>
      <radialGradient id="pgLedOff" cx="35%" cy="35%" r="65%"><stop offset="0" stop-color="#484d54"/><stop offset="0.65" stop-color="#202327"/><stop offset="1" stop-color="#0e1012"/></radialGradient>
      <filter id="pgGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <g id="pgScrew"><circle r="7" fill="#111315" stroke="#454b52" stroke-width="0.7"/><circle r="5" fill="#2c3136" stroke="#687078" stroke-width="0.8"/>
        <line x1="-3.3" x2="3.3" stroke="#111315" stroke-width="1.2"/><line y1="-3.3" y2="3.3" stroke="#111315" stroke-width="1.2"/></g>
    </defs>`;

    const empty = (lane: number, msg: string) =>
      nodes.some((n) => n.lane === lane) ? '' : `<text class="pg-sub" x="${LANE_X[lane] + 6}" y="${TOP + 12}">${msg}</text>`;

    this.el.innerHTML = `
      <div class="pg-status">
        ${this.online ? '' : `<span class="pg-iface">TAP offline: <a href="https://github.com/WardBeckSystems/Ward-Beck-Audio-Tap/releases/latest" target="_blank" rel="noopener">download the Ward-Beck Audio Tap</a> (Linux, Windows, macOS) and run its installer</span>`}
        ${this.tpChip()}
      </div>
      <svg class="pg-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Audio pipeline signal flow: ALSA to PipeWire to MXL to network AoIP">
        ${defs}${heads}${edgeSvg}${nodeSvg}${more}
        ${this.online ? empty(0, 'no ALSA cards reported') : ''}
      </svg>
      ${[mc?.sap, mc?.sip].some((l) => l?.error) ? `<div class="pg-errors">${[['SAP', mc.sap], ['SIP', mc.sip]].filter(([, l]) => l?.error).map(([n, l]) => `<div><b>${n}</b> ${esc(l.error)}</div>`).join('')}</div>` : ''}
    `;
    const svg = this.el.querySelector('.pg-svg') as SVGSVGElement | null;
    // Measured fit: label clears the badge, sub line clears the METER / ROUTED tags, all inside the card.
    svg?.querySelectorAll<SVGGElement>('.pg-node').forEach((g) => {
      const left = (e: Element | null, dflt: number) => (e ? (e as SVGTextElement).getBBox().x : dflt);
      const badge = g.querySelector('.pg-badge'), tag = g.querySelector('text:not([class])');
      fitText(g.querySelector('.pg-label'), left(badge, LANE_W - 4) - 4 - 15);
      fitText(g.querySelector('.pg-sub'), left(tag, LANE_W - 4) - 4 - 15);
    });
    if (svg && this.docks.length) {
      const k = svg.getBoundingClientRect().width / W;
      const top0 = svg.getBoundingClientRect().top - this.el.getBoundingClientRect().top;
      this.el.style.position = 'relative';
      for (const d of this.docks) {
        Object.assign(d.el.style, {
          position: 'absolute',
          left: `${LANE_X[d.lane] * k}px`,
          top: `${top0 + dockTop[d.lane] * k}px`,
          width: `${LANE_W * k}px`,
        });
        this.el.appendChild(d.el);
      }
    }
    // The receiver chooser hangs under its card (closes if the card stops being tappable).
    const open = this.taps.get(this.chooser), at = pos.get(this.chooser);
    if (!open?.tap || !at || !svg) this.chooser = '';
    else {
      const k = svg.getBoundingClientRect().width / W;
      const top0 = svg.getBoundingClientRect().top - this.el.getBoundingClientRect().top;
      this.el.style.position = 'relative';
      const c = this.chooserEl(open);
      // Left lanes open rightwards from the card's left edge; the network lane leftwards from its right edge.
      const right = open.lane === 3;
      Object.assign(c.style, {
        left: `${(at.x + (right ? LANE_W : 0)) * k}px`, top: `${top0 + (at.y + NODE_H + 2) * k}px`,
        transform: right ? 'translateX(-100%)' : '',
      });
      this.el.appendChild(c);
    }
    this.syncFixPrompt();
  }
}
