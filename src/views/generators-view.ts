/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Generators view (footer tab "generators").
 * POD-33 AES DARS & precision tone generator, the CBC / Radio-Canada MXL
 * test pattern studio, and the ABS-1 Audio Bit Spitter feeding an ABB-1
 * Audio Bit Buddy (see bit-set-panel.ts).
 *
 * POD-33 and ABS-1 state lives in the Web Router (its CH 3 / CH 4 inputs
 * engage them), so these panels read and write it through the router.
 */

import type { WebRouter } from '../../WebRouter/src';
import { BitSetPanel } from './bit-set-panel';

const DAEMON = 'http://localhost:8467';

/** CBC / Radio-Canada MXL test containers, reached through the daemon (/api/cbc/*). */
const CBC_SERVICES: [string, string, number][] = [
  ['generator', 'Generator', 9600], ['player', 'File Player', 9602], ['webrtc', 'WebRTC', 9601], ['info', 'MXL Info', 9699],
];

interface CbcStatus {
  online?: boolean;
  running?: boolean;
  services?: Record<string, { label?: string; port?: number; url?: string; up?: boolean }>;
  patterns?: { video?: string[]; audio?: string[] };
  video_pattern?: string;
  audio_pattern?: string;
  level_db?: number;
  resolution?: string;
  framerate?: string;
  flows?: Record<string, string>;
}

export class GeneratorsView {
  private unsubscribe?: () => void;
  private bitSet: BitSetPanel;
  private cbc: CbcStatus = {};
  private cbcTimer = 0;
  private cbcBusy = false;

  constructor(private container: HTMLElement, private router: WebRouter) {
    this.bitSet = new BitSetPanel(router);
  }

  build(): void {
    this.container.innerHTML = this.renderHtml();
    this.attachEvents();
    this.bitSet.bind(this.container);
    this.startCbcPolling();
    this.unsubscribe?.();
    this.unsubscribe = this.router.onChange(() => this.refresh());
    this.refresh();
  }

  private renderHtml(): string {
    const r = this.router;
    return `
      <div class="routing-console-rack">
        <div class="routing-rack-header">
          <div class="routing-header-left">
            <div class="routing-wbs-badge">
              <span class="wbs-mark">WBS</span>
              <span class="wbs-rack-code">GENERATORS</span>
            </div>
            <div class="routing-header-title">WARD-BECK SYSTEMS // SIGNAL GENERATORS</div>
          </div>
        </div>

        <div class="routing-aux-panels">
        <!-- POD-33 REFERENCE TONE GENERATOR -->
        <div class="rc-pod-panel">
          <div class="rc-panel-title">
            <div class="rc-panel-title-left">
              <strong>WBS POD-33 AES DARS &amp; PRECISION TONE GENERATOR</strong>
            </div>
            <button type="button" id="btnTogglePod33" class="rc-power-btn ${r.pod33Engaged ? 'active' : ''}">
              ${r.pod33Engaged ? '● POD-33 ACTIVE' : '○ ACTIVATE POD-33'}
            </button>
          </div>

          <div class="rc-pod-grid">
            <!-- Genlock Reference Clock -->
            <div class="rc-pod-col">
              <div class="rc-control-group-title">REFERENCE LOCK</div>
              <div class="rc-btn-group" role="group">
                <button type="button" class="rc-btn-sel ${r.pod33Config.refClock === 'video' ? 'active' : ''}" data-pod-ref="video">
                  <span class="rc-led-dot ${r.pod33Config.refClock === 'video' ? 'lit-green' : ''}"></span>
                  VIDEO
                </button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.refClock === 'aes' ? 'active' : ''}" data-pod-ref="aes">
                  <span class="rc-led-dot ${r.pod33Config.refClock === 'aes' ? 'lit-green' : ''}"></span>
                  AES DARS
                </button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.refClock === 'int48' ? 'active' : ''}" data-pod-ref="int48">
                  <span class="rc-led-dot ${r.pod33Config.refClock === 'int48' ? 'lit-green' : ''}"></span>
                  INT 48k
                </button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.refClock === 'int96' ? 'active' : ''}" data-pod-ref="int96">
                  <span class="rc-led-dot ${r.pod33Config.refClock === 'int96' ? 'lit-green' : ''}"></span>
                  INT 96k
                </button>
              </div>
            </div>

            <!-- Frequency Selection -->
            <div class="rc-pod-col">
              <div class="rc-control-group-title">CALIBRATED FREQUENCY</div>
              <div class="rc-btn-group" role="group">
                <button type="button" class="rc-btn-sel ${r.pod33Config.freq === 100 ? 'active' : ''}" data-pod-freq="100">100 Hz</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.freq === 400 ? 'active' : ''}" data-pod-freq="400">400 Hz</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.freq === 1000 ? 'active' : ''}" data-pod-freq="1000">1 kHz (0 VU)</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.freq === 0 ? 'active' : ''}" data-pod-freq="0">Silence</button>
              </div>
            </div>

            <!-- Level Selection (dBFS) -->
            <div class="rc-pod-col">
              <div class="rc-control-group-title">CALIBRATED LEVEL (dBFS)</div>
              <div class="rc-btn-group" role="group">
                <button type="button" class="rc-btn-sel ${r.pod33Config.levelDb === 0 ? 'active' : ''}" data-pod-lvl="0">0 dB</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.levelDb === -12 ? 'active' : ''}" data-pod-lvl="-12">-12</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.levelDb === -14 ? 'active' : ''}" data-pod-lvl="-14">-14</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.levelDb === -18 ? 'active' : ''}" data-pod-lvl="-18">-18 (EBU)</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.levelDb === -20 ? 'active' : ''}" data-pod-lvl="-20">-20 (SMPTE)</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.levelDb === -24 ? 'active' : ''}" data-pod-lvl="-24">-24</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.levelDb === -40 ? 'active' : ''}" data-pod-lvl="-40">-40</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.levelDb === -100 ? 'active' : ''}" data-pod-lvl="-100">OFF</button>
              </div>
            </div>

            <!-- Channel Routing & Phase Invert -->
            <div class="rc-pod-col">
              <div class="rc-control-group-title">CHANNEL &amp; PHASE</div>
              <div class="rc-btn-group" role="group">
                <button type="button" class="rc-btn-sel ${r.pod33Config.channelMode === 'stereo' ? 'active' : ''}" data-pod-ch="stereo">Stereo</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.channelMode === 'left' ? 'active' : ''}" data-pod-ch="left">Left Only</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.channelMode === 'right' ? 'active' : ''}" data-pod-ch="right">Right Only</button>
                <button type="button" class="rc-btn-sel ${r.pod33Config.channelMode === 'invert' ? 'active' : ''}" data-pod-ch="invert" title="Phase Invert 180° on Right channel">Ø Invert 180°</button>
              </div>
            </div>
          </div>
        </div>

        <!-- CBC / RADIO-CANADA MXL TEST GENERATOR & PATTERN STUDIO -->
        <div class="rc-cbc-studio-panel">
          <div class="rc-cbc-header">
            <div class="rc-cbc-title">
              <strong>CBC / RADIO-CANADA MXL TEST GENERATOR &amp; PATTERN STUDIO</strong>
            </div>
            <div class="rc-cbc-svcs" id="rcCbcSvcs">
              ${CBC_SERVICES.map(([k, label, port]) => `<a class="rc-cbc-svc" data-cbc-svc="${k}" href="http://localhost:${port}" target="_blank" rel="noopener" title="${label} (:${port})"><span class="rc-led-dot"></span>${label}</a>`).join('')}
              <button type="button" class="rc-power-btn" id="btnCbcPipeline" title="Start / stop the CBC test generator pipeline">○ START</button>
            </div>
          </div>

          <div class="rc-cbc-grid">
            <!-- Video Test Patterns -->
            <div class="rc-cbc-col">
              <div class="rc-cbc-label">VIDEO TEST PATTERN</div>
              <select id="rcCbcVideoSelect" class="rc-cbc-select"><option>—</option></select>
              <div class="rc-cbc-flow-info" id="rcCbcVideoFlow"></div>
            </div>

            <!-- Audio Test Patterns -->
            <div class="rc-cbc-col">
              <div class="rc-cbc-label">AUDIO TEST PATTERN</div>
              <select id="rcCbcAudioSelect" class="rc-cbc-select"><option>—</option></select>
              <div class="rc-cbc-flow-info" id="rcCbcAudioFlow"></div>
            </div>

            <!-- Calibrated Output Level -->
            <div class="rc-cbc-col">
              <div class="rc-cbc-label">OUTPUT LEVEL</div>
              <div class="rc-cbc-btn-group">
                <button type="button" class="rc-cbc-btn active" data-cbc-lvl="-20">-20 dBFS (EBU)</button>
                <button type="button" class="rc-cbc-btn" data-cbc-lvl="-18">-18 dBFS (0 VU)</button>
                <button type="button" class="rc-cbc-btn" data-cbc-lvl="-12">-12 dBFS</button>
                <button type="button" class="rc-cbc-btn" data-cbc-lvl="0">0 dBFS (Ceiling)</button>
              </div>
            </div>
          </div>
        </div>
${this.bitSet.html()}
        </div>
      </div>
    `;
  }

  private post(path: string, body: unknown): void {
    fetch(`${DAEMON}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
  }

  private attachEvents(): void {
    const root = this.container;
    const r = this.router;

    root.addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest('button');
      if (!t || !root.contains(t)) return;
      const d = t.dataset;
      if (t.id === 'btnTogglePod33') return r.setPod33(!r.pod33Engaged);
      if (t.id === 'btnCbcPipeline') return this.toggleCbcPipeline();
      if (d.podRef !== undefined) return r.setPod33Config({ refClock: d.podRef as any });
      if (d.podFreq !== undefined) return r.setPod33Config({ freq: +d.podFreq });
      if (d.podLvl !== undefined) return r.setPod33Config({ levelDb: +d.podLvl });
      if (d.podCh !== undefined) return r.setPod33Config({ channelMode: d.podCh as any });
      if (d.abbPat !== undefined) return r.setBitBuddyConfig({ pattern: d.abbPat as any });
      if (d.abbPro !== undefined) return r.setBitBuddyConfig({ proMode: d.abbPro === 'pro' });
      if (d.abbData !== undefined) return r.setBitBuddyConfig({ audioData: d.abbData as any });
      if (d.cbcLvl !== undefined) {
        const lvl = parseFloat(d.cbcLvl);
        root.querySelectorAll('[data-cbc-lvl]').forEach((b) => b.classList.toggle('active', b === t));
        this.post('/api/cbc/audio_level', { level_db: lvl });
      }
    });

    const onPattern = (target: 'video' | 'audio') => (e: Event) =>
      this.post('/api/cbc/pattern', { target, pattern: (e.target as HTMLSelectElement).value });
    root.querySelector('#rcCbcVideoSelect')?.addEventListener('change', onPattern('video'));
    root.querySelector('#rcCbcAudioSelect')?.addEventListener('change', onPattern('audio'));
  }

  /* ---------------- CBC / Radio-Canada MXL test generators ---------------- */

  /** Poll /api/cbc/status every 2.5 s while the routing tab is on screen. */
  private startCbcPolling(): void {
    window.clearInterval(this.cbcTimer);
    const tick = () => {
      if (!this.container.isConnected) return window.clearInterval(this.cbcTimer);
      if (this.container.offsetParent !== null) this.pollCbc();
    };
    this.cbcTimer = window.setInterval(tick, 2500);
    tick();
  }

  private async pollCbc(): Promise<void> {
    try {
      const res = await fetch(`${DAEMON}/api/cbc/status`, { cache: 'no-store' });
      this.cbc = res.ok ? await res.json() : {};
    } catch {
      this.cbc = {}; // daemon not running
    }
    this.paintCbc();
  }

  private async toggleCbcPipeline(): Promise<void> {
    if (this.cbcBusy) return;
    this.cbcBusy = true;
    this.paintCbc();
    try {
      await fetch(`${DAEMON}/api/cbc/pipeline/${this.cbc.running ? 'stop' : 'start'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
    } catch { /* daemon offline: paint shows it */ }
    this.cbcBusy = false;
    await this.pollCbc();
  }

  private paintCbc(): void {
    const root = this.container, st = this.cbc;
    const daemon = st.online !== undefined;
    CBC_SERVICES.forEach(([k, label, port]) => {
      const a = root.querySelector<HTMLAnchorElement>(`[data-cbc-svc="${k}"]`);
      if (!a) return;
      const svc = st.services?.[k];
      const up = svc ? !!svc.up : k === 'generator' && !!st.online;
      a.classList.toggle('up', up);
      a.querySelector('.rc-led-dot')?.classList.toggle('lit-green', up);
      if (svc?.url) a.href = svc.url;
      a.title = `${svc?.label ?? label} (:${svc?.port ?? port}) — ${!daemon ? 'daemon offline' : up ? 'up' : 'down'}`;
    });
    const btn = root.querySelector<HTMLButtonElement>('#btnCbcPipeline');
    if (btn) {
      btn.disabled = !st.online || this.cbcBusy;
      btn.classList.toggle('active', !!st.running);
      btn.textContent = this.cbcBusy ? '… WAIT' : st.running ? '● RUNNING' : '○ START';
      btn.title = !daemon ? 'Daemon offline (localhost:8467)' : !st.online ? 'Generator container (:9600) not reachable'
        : st.running ? 'Stop the CBC test generator pipeline' : 'Start the CBC test generator pipeline';
    }
    const fill = (id: string, list: string[] | undefined, cur: string | undefined) => {
      const sel = root.querySelector<HTMLSelectElement>(`#${id}`);
      if (!sel || !list?.length || document.activeElement === sel) return;
      const key = list.join('|');
      if (sel.dataset.key !== key) {
        sel.innerHTML = list.map((p) => `<option value="${p.replace(/"/g, '&quot;')}">${p}</option>`).join('');
        sel.dataset.key = key;
      }
      if (cur && list.includes(cur)) sel.value = cur;
    };
    fill('rcCbcVideoSelect', st.patterns?.video, st.video_pattern);
    fill('rcCbcAudioSelect', st.patterns?.audio, st.audio_pattern);
    const flows = st.flows ?? {};
    const short = (u?: string) => (u ? u.slice(0, 8) + '…' : '');
    const vid = root.querySelector('#rcCbcVideoFlow');
    if (vid) {
      vid.textContent = flows.video ? `${short(flows.video)} · ${st.resolution ?? ''} @ ${st.framerate ?? ''}` : '';
      (vid as HTMLElement).title = flows.video ?? '';
    }
    const aud = root.querySelector('#rcCbcAudioFlow');
    if (aud) {
      const ids = ['audio1', 'audio2'].filter((k) => flows[k]);
      aud.textContent = ids.map((k) => short(flows[k])).join(' · ');
      (aud as HTMLElement).title = ids.map((k) => `${k}: ${flows[k]}`).join('\n');
    }
    if (typeof st.level_db === 'number') {
      root.querySelectorAll('[data-cbc-lvl]').forEach((b) =>
        b.classList.toggle('active', Math.abs(+b.getAttribute('data-cbc-lvl')! - st.level_db!) < 0.05));
    }
  }

  /** Mirror router generator state onto buttons and LEDs. */
  private refresh(): void {
    const root = this.container;
    const r = this.router;
    const pc = r.pod33Config;

    const pod = root.querySelector('#btnTogglePod33');
    if (pod) {
      pod.classList.toggle('active', r.pod33Engaged);
      pod.textContent = r.pod33Engaged ? '● POD-33 ACTIVE' : '○ ACTIVATE POD-33';
    }
    const mark = (attr: string, match: (v: string) => boolean) =>
      root.querySelectorAll(`[${attr}]`).forEach((b) => b.classList.toggle('active', match(b.getAttribute(attr)!)));
    mark('data-pod-ref', (v) => v === pc.refClock);
    mark('data-pod-freq', (v) => +v === pc.freq);
    mark('data-pod-lvl', (v) => +v === pc.levelDb);
    mark('data-pod-ch', (v) => v === pc.channelMode);
    root.querySelectorAll('[data-pod-ref] .rc-led-dot').forEach((dot) =>
      dot.classList.toggle('lit-green', dot.parentElement?.getAttribute('data-pod-ref') === pc.refClock));
    this.bitSet.paint(root);
  }
}
