/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
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
 * Every card is a test point: clicking it clips the daemon's test point onto it
 * (POST /api/testpoint), which rings that point at 10 x its packet time and meters
 * it in the Scanalyzer eye. Clicking the clipped card again lifts the probe.
 */

import type { XmxlInstance } from '../audio/engine/sources/xmxl-discovery';

const DAEMON = 'http://localhost:8467';
const POLL_MS = 4000;

const W = 1000;          // viewBox width
const LANE_W = 214;
const LANE_X = [8, 270, 532, 794];
const NODE_H = 21;
const NODE_GAP = 4;
const TOP = 28;          // first node y
const MAX_NODES = 18;    // per lane, then "+N more"

type Kind = 'hw' | 'pw' | 'mxl' | 'dante' | 'ravenna' | 'sap' | 'nmos' | 'sip' | 'moip' | 'hub';

interface GNode {
  id: string;
  lane: number;
  label: string;
  sub?: string;
  kind: Kind;
  live?: boolean;        // heard on the wire / actually running
  title?: string;
  hub?: boolean;
  tap?: { kind: 'hw' | 'pw' | 'mxl' | 'aoip'; ref: string };
  pick?: { inst: string; flow: string };   // locally discovered node/flow: shown in the ring buffer
}

interface GEdge { from: string; to: string; clock?: boolean }

interface Listener { listening?: boolean; error?: string | null; packets?: number }

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

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
  private taps = new Map<string, GNode>();
  private fixDismissed = new Set<string>();
  private fixEl: HTMLElement | null = null;
  private fixTimer: number | null = null;
  private local: XmxlInstance[] = [];
  private picked = '';
  private onPick?: (instId: string, flowId: string) => void;

  constructor(private el: HTMLElement, private onTap?: (active: boolean) => void) {
    // One delegated listener: cards are re-rendered on every poll.
    this.el.addEventListener('click', (e) => {
      if ((e.target as Element).closest?.('[data-fix-open]')) {
        if (this.testPoint?.fix) this.fixDismissed.delete(this.fixKey(this.testPoint.fix));
        this.syncFixPrompt();
        return;
      }
      const g = (e.target as Element).closest?.('[data-tap]');
      const node = g ? this.taps.get(g.getAttribute('data-tap') || '') : undefined;
      if (node?.pick) { this.onPick?.(node.pick.inst, node.pick.flow); return; }
      if (node?.tap) this.clip(node);
    });
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

  private isClipped(n: GNode): boolean {
    const tp = this.testPoint;
    return !!(tp && n.tap && tp.kind === n.tap.kind && tp.ref === n.tap.ref);
  }

  start(): void {
    this.draw();
    const tick = async () => {
      // Only poll while the data tab is on screen.
      if (this.el.offsetParent !== null) {
        const [p, a, t] = await Promise.all([getJson('/api/pipeline'), getJson('/api/aoip'), getJson('/api/testpoint')]);
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

  private build(): { nodes: GNode[]; edges: GEdge[]; clocks: any[]; mc: any } {
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
    [...cards].forEach(([name, devs], i) => {
      const idx = /^card (\d+)/.exec(name)?.[1];
      nodes.push({ id: `hw${i}`, lane: 0, kind: 'hw', label: name, sub: `${devs.length} PCM device${devs.length === 1 ? '' : 's'}`, title: devs.join('\n'), live: true, tap: idx ? { kind: 'hw', ref: idx } : undefined });
    });

    // 2 · PipeWire: graph hub, then streams.
    const rate = pw.graph_sample_rate, q = pw.graph_quantum;
    nodes.push({
      id: 'pw', lane: 1, kind: 'hub', hub: true, live: pw.status === 'running',
      label: 'PipeWire graph', sub: rate ? `${q} / ${rate / 1000}k · ${pw.graph_quantum_ms} ms` : 'not reported',
    });
    for (const [i, s] of ((pw.streams ?? []) as string[]).entries()) {
      const oid = /^(\d+)\./.exec(String(s))?.[1];
      nodes.push({ id: `pws${i}`, lane: 1, kind: 'pw', label: String(s).replace(/^\d+\.\s*/, ''), sub: 'stream', live: true, tap: oid ? { kind: 'pw', ref: oid } : undefined });
    }

    // 3 · MXL: domain hub, then flows.
    const flows: any[] = mxl.flows ?? [];
    nodes.push({
      id: 'mxl', lane: 2, kind: 'hub', hub: true, live: flows.length > 0,
      label: mxl.domain_id && mxl.domain_id !== 'none' ? mxl.domain_id : 'MXL domain',
      sub: mxl.shm_base_dir ?? '/dev/shm/mxl',
    });
    for (const f of flows) {
      const over = (f.overrun_count ?? 0) + (f.underrun_count ?? 0);
      nodes.push({
        id: `fl_${f.flow_id}`, lane: 2, kind: 'mxl', live: true, label: f.label || f.flow_id,
        sub: `${f.channel_count}ch · ${(f.sample_rate ?? 48000) / 1000}k${over ? ` · ${over} xrun` : ''}`, title: f.flow_id,
        tap: { kind: 'mxl', ref: f.flow_id },
      });
    }

    // 4 · AoIP: what multicast actually heard first, then mDNS/NMOS announcements.
    const heardIps = new Set<string>();
    for (const s of mc?.sap?.sessions ?? []) {
      heardIps.add(s.origin_ip);
      nodes.push({
        id: `sap_${s.id}`, lane: 3, kind: 'sap', live: true, label: s.session_name || s.multicast_ip,
        sub: `SAP · ${s.multicast_ip}:${s.port} · ${s.channels ?? '?'}ch ${s.encoding ?? ''}`,
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
      nodes.push({ id: `rav_${r.ip}_${r.name}`, lane: 3, kind: 'ravenna', live: heardIps.has(r.ip), label: r.name, sub: `RAVENNA · ${r.ip}`, title: r.url, tap: { kind: 'aoip', ref: sapNames.has(r.name) ? r.name : r.ip } });
    for (const n of aoip.nmos?.nodes ?? [])
      nodes.push({ id: `nmos_${n.ip}_${n.name}`, lane: 3, kind: 'nmos', live: heardIps.has(n.ip), label: n.name, sub: `NMOS IS-04 · ${n.ip}`, tap: { kind: 'aoip', ref: n.ip } });
    for (const m of mc?.sip?.messages ?? [])
      nodes.push({ id: `sip_${m.method}_${m.from}`, lane: 3, kind: 'sip', live: true, label: `${m.method} ${m.from}`, sub: `SIP · ${m.source_ip} · ×${m.count}`, title: m.user_agent });

    // Locally discovered nodes the daemon did not already report: MXL apps + their flows in lane 3,
    // network gateways in lane 4. Clicking one shows that flow in the ring buffer below.
    const base = (s: string) => s.replace(/\s*\(.*$/, '').trim().toLowerCase();
    const seen = new Set(nodes.map((n) => base(n.label)));
    const heardSap = (mc?.sap?.sessions ?? []).length > 0;
    const seenFlow = new Set(flows.map((f) => f.flow_id));
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
      if (inst.port !== 8467)
        nodes.push({ id: `loc_${inst.id}`, lane: 2, kind: 'mxl', live: inst.status === 'online', label: name, sub: `:${inst.port} · ${inst.latencyMs} ms`, title: inst.domainId, pick: first ? { inst: inst.id, flow: first } : undefined });
      for (const f of inst.flows) {
        if (seenFlow.has(f.flowId)) continue;
        seenFlow.add(f.flowId);
        const label = short(f.label || f.flowId).replace(/\s*\(.*\)$/, '');
        if (seen.has(base(label))) continue;
        seen.add(base(label));
        nodes.push({ id: `locf_${f.flowId}`, lane: 2, kind: 'mxl', live: true, label, sub: `${f.channelCount}ch · ${f.sampleRate / 1000}k`, title: f.label, pick: { inst: inst.id, flow: f.flowId } });
      }
    }

    // Edges: every card feeds the graph; graph feeds MXL; MXL bridges to the network.
    for (const n of nodes) {
      if (n.lane === 0) edges.push({ from: n.id, to: 'pw' });
      if (n.lane === 1 && !n.hub) edges.push({ from: 'pw', to: n.id });
      if (n.lane === 2 && !n.hub) edges.push({ from: 'mxl', to: n.id });
    }
    edges.push({ from: 'pw', to: 'mxl' });

    const clocks: any[] = mc?.ptp?.grandmasters ?? [];
    return { nodes, edges, clocks, mc };
  }

  // ───────────────────────── view ─────────────────────────

  private tpChip(): string {
    const tp = this.testPoint;
    if (!tp) return '<span class="pg-chip pg-chip-off" title="Click any card to meter it"><i></i>test point · click a card</span>';
    const state = tp.status === 'running' ? 'on' : tp.status === 'error' ? 'err' : 'off';
    const ring = !tp.ring_frames ? ''
      : tp.ring_frames / tp.packet_frames <= 64 ? ` · ring ${tp.ring_frames} fr = 10 × ${tp.packet_frames} (${tp.ring_ms} ms)`
      : ` · ring ${(tp.ring_ms / 1000).toFixed(0)} s (${tp.ring_frames.toLocaleString()} fr · ${tp.packet_frames}-fr packets)`;
    const lost = tp.lost_packets ? ` · ${tp.lost_packets} lost` : '';
    const why = tp.error || tp.hint || tp.source || '';
    return `<span class="pg-chip pg-chip-${state} pg-tp-chip" title="${esc(why)}"><i></i>TP ${esc(trunc(tp.label, 24))} · ${esc(tp.status)}${ring}${lost}</span>`
      + (tp.error || tp.hint ? `<span class="pg-tp-why">${esc(tp.error || tp.hint)}</span>` : '')
      + (tp.fix ? `<button type="button" class="pg-fix-open" data-fix-open>Fix…</button>` : '');
  }

  private draw(): void {
    const { nodes, edges, clocks, mc } = this.build();

    // Lay out each lane top-down; overflow collapses to "+N more".
    const pos = new Map<string, { x: number; y: number }>();
    const shown: GNode[] = [];
    const extra: { lane: number; n: number; y: number }[] = [];
    for (let lane = 0; lane < 4; lane++) {
      const inLane = nodes.filter((n) => n.lane === lane);
      inLane.slice(0, MAX_NODES).forEach((n, i) => {
        pos.set(n.id, { x: LANE_X[lane], y: TOP + i * (NODE_H + NODE_GAP) });
        shown.push(n);
      });
      if (inLane.length > MAX_NODES)
        extra.push({ lane, n: inLane.length - MAX_NODES, y: TOP + MAX_NODES * (NODE_H + NODE_GAP) });
    }
    const rows = Math.max(1, ...[0, 1, 2, 3].map((l) => Math.min(MAX_NODES + 1, nodes.filter((n) => n.lane === l).length || 1)));
    const clockY = TOP + rows * (NODE_H + NODE_GAP) + 6;
    const H = clockY + 30;

    // Network nodes hang off the MXL hub, and off the PTP band when a clock exists.
    const mxlPos = pos.get('mxl');
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
    const nodeSvg = shown.map((n) => {
      const p = pos.get(n.id)!;
      if (n.tap) this.taps.set(n.id, n);
      if (n.pick) this.taps.set(n.id, n);
      const clipped = this.isClipped(n);
      const picked = !!n.pick && n.pick.flow === this.picked;
      const tapAttr = n.tap || n.pick ? ` data-tap="${esc(n.id)}" role="button" tabindex="0"` : '';
      const tapHint = n.pick ? '\nClick to show in the ring buffer' : n.tap ? (clipped ? '\n● TEST POINT — click to lift the probe' : '\nClick to meter this point (test point)') : '';
      return `
        <g class="pg-node pg-${n.kind}${n.live ? ' pg-on' : ''}${n.hub ? ' pg-hub' : ''}${n.tap ? ' pg-tappable' : ''}${n.pick ? ' pg-pickable' : ''}${clipped ? ' pg-tp' : ''}${picked ? ' pg-pick' : ''}"${tapAttr} transform="translate(${p.x} ${p.y})">
          <title>${esc(n.label)}${n.sub ? ` — ${esc(n.sub)}` : ''}${n.title ? `\n${esc(n.title)}` : ''}${tapHint}</title>
          <rect width="${LANE_W}" height="${NODE_H}" rx="4"/>
          <circle class="pg-dot" cx="8" cy="${NODE_H / 2}" r="2.6"/>
          <text class="pg-label" x="15" y="9">${esc(trunc(n.label, 40))}</text>
          ${n.sub ? `<text class="pg-sub" x="15" y="17.5">${esc(trunc(n.sub, clipped ? 34 : 50))}</text>` : ''}
          ${clipped ? `<text class="pg-tp-tag" x="${LANE_W - 5}" y="17.5" text-anchor="end">● TP</text>` : ''}
        </g>`;
    }).join('');

    const more = extra.map((e) => `<text class="pg-more" x="${LANE_X[e.lane] + 8}" y="${e.y + 10}">+${e.n} more</text>`).join('');

    // PTP clock band: one chip per grandmaster, dashed to the MXL hub (TAI) and the AoIP lane.
    const bandX = LANE_X[2], bandW = LANE_X[3] + LANE_W - bandX;
    const chipW = clocks.length ? Math.min(220, (bandW - 8 * (clocks.length - 1)) / clocks.length) : bandW;
    const clockSvg = clocks.length
      ? clocks.map((c, i) => {
          const x = bandX + i * (chipW + 8);
          const label = `${c.version === 1 ? 'PTPv1' : 'PTPv2'} ${c.version === 1 ? c.domain : 'd' + c.domain} · ${c.network}${c.priority1 != null ? ` · p1 ${c.priority1}` : ''}`;
          const contested = c.sync_health === 'contested';
          return `
            <g class="pg-clock pg-v${c.version}${contested ? ' pg-contested' : ''}" transform="translate(${x} ${clockY})">
              <title>Grandmaster ${esc(c.identity)}${c.source_ip ? ` from ${esc(c.source_ip)}` : ''}${contested ? '\nContested: more than one grandmaster on this domain' : ''}</title>
              <rect width="${chipW}" height="21" rx="10.5"/>
              <text class="pg-label" x="10" y="9">⏱ ${esc(trunc(label, 40))}</text>
              <text class="pg-sub" x="10" y="17.5">${contested ? '⚠ contested · ' : ''}GM ${esc(trunc(String(c.identity), contested ? 26 : 38))}</text>
            </g>`;
        }).join('')
      : `<text class="pg-sub" x="${bandX + 4}" y="${clockY + 13}">${mc ? (mc.ptp?.mode === 'passive' ? 'No PTP master reported by apk-ptp yet' : 'No PTP grandmaster heard on 224.0.1.129 yet') : 'PTP: waiting for daemon multicast listener'}</text>`;
    const clockLink = mxlPos ? `<path class="pg-edge pg-clock-edge" d="M ${mxlPos.x + LANE_W / 2} ${clockY} V ${TOP + NODE_H}"/>` : '';

    const laneHead = ['1 · ALSA HARDWARE', '2 · PIPEWIRE GRAPH', '3 · MXL SHARED MEMORY', '4 · NETWORK AoIP'];
    const heads = laneHead.map((t, i) => `
      <rect class="pg-lane" x="${LANE_X[i] - 4}" y="4" width="${LANE_W + 8}" height="${H - 8}" rx="7"/>
      <text class="pg-head" x="${LANE_X[i] + 4}" y="17">${t}</text>`).join('');

    const empty = (lane: number, msg: string) =>
      nodes.some((n) => n.lane === lane) ? '' : `<text class="pg-sub" x="${LANE_X[lane] + 6}" y="${TOP + 12}">${msg}</text>`;

    const chip = (name: string, l: (Listener & { mode?: string; clocks?: unknown[] }) | undefined) => {
      const state = !mc ? 'off' : l?.listening ? 'on' : 'err';
      const text = !mc ? 'n/a'
        : l?.mode === 'passive' ? (l.listening ? `passive · ${l.clocks?.length ?? 0} clocks` : 'passive · broker down')
        : l?.listening ? `${l.packets ?? 0} pkts` : 'not listening';
      return `<span class="pg-chip pg-chip-${state}" title="${esc(l?.error ?? (mc ? '' : 'daemon has no multicast listener'))}"><i></i>${name} ${text}</span>`;
    };

    this.el.innerHTML = `
      <div class="pg-status">
        <span class="pg-chip ${this.online ? 'pg-chip-on' : 'pg-chip-err'}"><i></i>daemon ${this.online ? 'online :8467' : 'offline'}</span>
        ${chip('SAP', mc?.sap)}${chip('PTP', mc?.ptp)}${chip('SIP', mc?.sip)}
        ${mc?.iface ? `<span class="pg-iface">iface ${esc(mc.iface)}</span>` : ''}
        ${this.online ? '' : `<span class="pg-iface">Run the TAP: <code>docker compose up -d</code> in Ward-Beck-Audio-Tab · guide at <a href="${DAEMON}/setup" target="_blank" rel="noopener">:8467/setup</a></span>`}
        ${this.tpChip()}
      </div>
      <svg class="pg-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Audio pipeline signal flow: ALSA to PipeWire to MXL to network AoIP">
        ${heads}${edgeSvg}${clockLink}${nodeSvg}${more}${clockSvg}
        ${empty(0, this.online ? 'no ALSA cards reported' : 'TAP offline: docker compose up -d')}
        ${empty(3, mc ? 'nothing heard or announced' : 'no AoIP data')}
      </svg>
      ${[mc?.sap, mc?.ptp, mc?.sip].some((l) => l?.error) ? `<div class="pg-errors">${[['SAP', mc.sap], ['PTP', mc.ptp], ['SIP', mc.sip]].filter(([, l]) => l?.error).map(([n, l]) => `<div><b>${n}</b> ${esc(l.error)}</div>`).join('')}</div>` : ''}
    `;
    this.syncFixPrompt();
  }
}
