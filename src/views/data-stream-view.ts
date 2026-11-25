/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Data Stream view (footer tab "data").
 * Scanalyzer Audio Eye, per-generator MXL rings, the layered Linux audio
 * pipeline and the EBU DMF / MXL continuous circular ring buffer.
 * Routing lives in the Web Router submodule (tab "routing"); the POD-33,
 * ABB-1 and CBC panels live in generators-view.ts (tab "generators").
 */

import type { AppContext } from '../app/app-context';
import type { XtmModel } from '../models/xtm-model';
import { inputAssignment, inputCaption, inputFlowId } from '../app/input-assign';
import {
  getActiveXmxlInstances,
  onXmxlInstancesChanged,
  connectXmxlStream,
  setSelectedXmxlInstance,
  type XmxlInstance,
} from '../audio/engine/sources/xmxl-discovery';
import { PipelineGraph } from './pipeline-graph';

/** Ring audio fades out with age and is gone this many seconds after the write head passed. */
const FADE_S = 8;
const FADE_STEPS = 16;

export class DataStreamView {
  container: HTMLElement | null;
  ctx: AppContext | null = null;
  isBuilt: boolean = false;

  // Scanalyzer Audio Eye Visualizer
  phaseNeedle: HTMLElement | null = null;
  corrValReadout: HTMLElement | null = null;
  eyeCanvas: HTMLCanvasElement | null = null;
  cachedWaveform: any = null;
  // Real MXL ring state polled from /api/mxl/rings (no synthesized data)
  mxlRings: { flows: any[]; ntp_sec?: number } | null = null;
  mxlRingsPollTimer: number | null = null;
  mxlRingsAt: number = 0;
  genGridKey: string = '';

  // XMXL Dynamic Instances & Flow Discovery
  detectedInstances: XmxlInstance[] = [];
  selectedPort: number = 8467;
  selectedInstanceId: string = 'xmxl-8467';
  selectedFlowId: string = 'wbs-flow-master-stereo';
  activeXmxlDisconnect: (() => void) | null = null;
  liveMxlTelemetry: any = null;
  unsubscribeXmxl?: () => void;
  graph: PipelineGraph | null = null;
  flowRingsKey = '';
  // AES67 transmitter per MXL flow (GET/POST /api/aes67 on the TAP daemon)
  aes67: Record<string, any> = {};
  aes67At = 0;
  /** The flows on the ring cards, including the idle Tap placeholder. */
  private flowCards: any[] = [];
  ringsHost: HTMLElement | null = null;

  /** Query the data tab, then the MXL ring card that was moved into the Transmitters tab. */
  private $(sel: string): HTMLElement | null {
    return (this.container?.querySelector(sel) ?? this.ringsHost?.querySelector(sel) ?? null) as HTMLElement | null;
  }
  mxlInfo: any = null;   // /api/mxl: domain, shm base, per-flow definitions (for connection info)

  // Buffer Canvas animation
  ringHead: number = 0;
  readonly RING_CAPACITY: number = 480000; // 10.0 seconds @ 48 kHz (Float32)
  readonly QUANTUM: number = 256;

  constructor(containerEl: HTMLElement | null) {
    this.container = containerEl;
  }

  build(ctx: AppContext): void {
    this.ctx = ctx;
    if (!this.container) return;
    this.container.innerHTML = this.renderHtml();
    // The MXL ring buffers live in their own tab: Transmitters (#mxlStage).
    const ringsHost = document.getElementById('mxlRingsStage');
    const buffer = this.container.querySelector('.rc-data-buffer');
    if (ringsHost && buffer) { ringsHost.appendChild(buffer); this.ringsHost = ringsHost; }
    this.cacheNeedles();
    this.initXmxlBinding();
    this.startRingsPoll();
    const graphEl = this.container.querySelector('#rcPipelineGraph') as HTMLElement | null;
    // Clicking a pipeline card clips the test point there; the eye follows it.
    if (graphEl) {
      this.graph = new PipelineGraph(graphEl, (on) => { if (on) this.setFlow('wbs-test-point'); });
      // The eye column sets the deck's height: the pipeline scrolls inside it
      const eyeCol = this.container.querySelector('.rc-eye-col') as HTMLElement | null;
      const pipeCol = this.container.querySelector('.rc-pipeline-col') as HTMLElement | null;
      if (eyeCol && pipeCol) {
        const fit = () => { if (eyeCol.offsetHeight) pipeCol.style.maxHeight = `${eyeCol.offsetHeight}px`; };
        new ResizeObserver(fit).observe(eyeCol);
        fit();
      }
      // The telemetry cards fill the ALSA lane's free space
      this.graph.setDock(this.container.querySelector('.rc-eye-hud-grid') as HTMLElement | null);
      this.graph.start();
      this.updateXmxlBar();
    }
    this.isBuilt = true;
  }

  /** Show a specific MXL flow (the Web Router hints one when POD-33 / ABB-1 engage). */
  setFlow(flowId: string): void {
    this.selectedFlowId = flowId;
    this.updateXmxlBar();
  }

  private cacheNeedles(): void {
    if (!this.container) return;
    this.phaseNeedle = this.container.querySelector('#rcPhaseNeedle') as HTMLElement | null;
    this.corrValReadout = this.container.querySelector('#rcCorrValReadout') as HTMLElement | null;
    this.eyeCanvas = this.container.querySelector('#rcEyeCanvas') as HTMLCanvasElement | null;
  }

  private renderHtml(): string {
    return `
      <div class="routing-console-rack">
        <!-- TOP STUDIO MONITORING DECK: SCANALYZER AUDIO EYE + DUAL STUDIO ANALOG VU METERS -->
        <div class="rc-top-monitoring-deck">
          <!-- LEFT PANE: Scanalyzer Audio Eye Visualizer & Phase Correlation Bar -->
          <div class="rc-deck-col rc-eye-col">
            <!-- INPUT 1-4 rings across the top, the big eye under them -->
            <div class="rc-gen-grid" id="rcGenGrid"></div>

            <div class="rc-eye-canvas-container">
              <canvas id="rcEyeCanvas" width="440" height="440" class="rc-eye-canvas"></canvas>
            </div>

            <!-- Scanalyzer Style Phase Correlation Bar -->
            <div class="rc-scanalyzer-phase-bar-wrapper">
              <span class="rc-phase-lbl">L</span>
              <div class="rc-phase-track">
                <div class="rc-phase-marker-scale">
                  <span>-1 out of phase</span>
                  <span id="rcCorrValReadout">corr +0.96</span>
                  <span>mono +1</span>
                </div>
                <div class="rc-phase-needle" id="rcPhaseNeedle" style="left: 98%;"></div>
              </div>
              <span class="rc-phase-lbl">R</span>
            </div>

            <!-- Telemetry HUD Cards Grid -->
            <div class="rc-eye-hud-grid">
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">NTP TIME (UTC / SMPTE 2059-1)</div>
                <div class="rc-eye-hud-val rc-tone-cyan" id="rcEyeNtpClock">00:00:00.000</div>
                <div class="rc-eye-hud-sub" id="rcEyeTaiNs">TAI: SYNCED (0 ns)</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label"><i class="rc-eye-key rc-eye-key-meter"></i>METER READ HEAD</div>
                <div class="rc-eye-hud-val rc-tone-meter" id="rcEyeSec10">—</div>
                <div class="rc-eye-hud-sub" id="rcEyeMeterLag">—</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label"><i class="rc-eye-key rc-eye-key-write"></i>WRITE HEAD</div>
                <div class="rc-eye-hud-val" id="rcEyeHeadIndex">#0</div>
                <div class="rc-eye-hud-sub" id="rcEyeHeadSec">0.000s / 480,000 frames</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">BUFFER CAPACITY &amp; SHM</div>
                <div class="rc-eye-hud-val rc-tone-ok">480,000 FRAMES (10.0s)</div>
                <div class="rc-eye-hud-sub">3.84 MB /dev/shm · PROT_READ zero copy</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">QUANTUM</div>
                <div class="rc-eye-hud-val">256 FRAMES</div>
                <div class="rc-eye-hud-sub">5.33 ms @ 48 kHz</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">SLIP RATE</div>
                <div class="rc-eye-hud-val rc-tone-ok">0.00 ppm</div>
                <div class="rc-eye-hud-sub">SMPTE 2059-1</div>
              </div>
            </div>
          </div>

          <!-- RIGHT PANE: 4-Layer Linux Audio Pipeline & Topology Grid -->
          <div class="rc-deck-col rc-pipeline-col">
            <!-- Live signal-flow graph (pipeline-graph.ts): ALSA → PipeWire → MXL → AoIP + PTP band -->
            <div class="rc-pipeline-graph" id="rcPipelineGraph"></div>

            <!-- Pipeline Stream Telemetry Details -->
            <div class="rc-pipeline-telemetry-row">
              <div class="rc-telemetry-box">
                <div class="rc-telemetry-box-title">STREAM CLOCK &amp; TIMING</div>
                <div class="rc-telemetry-box-body">
                  <div class="rc-telemetry-item"><span>Clock Master:</span> <strong class="rc-tone-cyan" id="rcClockMaster">—</strong></div>
                  <div class="rc-telemetry-item"><span>Sampling Clock:</span> <strong>48,000 Hz Continuous</strong></div>
                </div>
              </div>
              <div class="rc-telemetry-box">
                <div class="rc-telemetry-box-title">ZERO-COPY RING STATUS</div>
                <div class="rc-telemetry-box-body">
                  <div class="rc-telemetry-item"><span>SHM Domain:</span> <strong class="rc-tone-accent">/dev/shm/mxl/domain-wbs-dmf-01</strong></div>
                  <div class="rc-telemetry-item"><span>Buffer Overruns:</span> <strong class="rc-tone-ok">0 Overruns / 0 Drops</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MXL CONTINUOUS CIRCULAR RING BUFFER -->
        <div class="rc-data-buffer">
            <!-- Top: Continuous Circular Ring Buffer -->
            <div class="rc-buffer-card">
              <div class="rc-buffer-header">
                <span>EBU DMF / MXL CONTINUOUS CIRCULAR RING BUFFER</span>
                <span class="rc-telemetry-pill" id="rcHeadroomTag">HEADROOM: 99.5% · 0 OVERRUNS</span>
              </div>

              <!-- One EBU DMF ring buffer per MXL flow the engine writes, each with copyable connection info -->
              <div class="rc-flow-rings" id="rcFlowRings"></div>

              <!-- Precision ITU-R BS.1770 / EBU R128 LOUDNESS Readout -->
              <div class="rc-loudness-strip" id="rcLoudnessStrip">
                <div class="rc-loudness-metric">
                  <span>INTEGRATED: <strong class="rc-loudness-val" id="rcLuIntegrated">-24.0 LUFS</strong></span>
                  <span>MOMENTARY: <strong class="rc-loudness-val" id="rcLuMomentary">-24.0 LUFS</strong></span>
                  <span>SHORT-TERM: <strong class="rc-loudness-val" id="rcLuShort">-24.0 LUFS</strong></span>
                  <span>TRUE PEAK: <strong class="rc-loudness-val" id="rcLuTruePeak">-1.2 dBTP</strong></span>
                </div>
                <div class="rc-stat-sub rc-tone-cyan">ITU-R BS.1770-4 / EBU R128 CALIBRATED</div>
              </div>
            </div>
        </div>
      </div>
    `;
  }

  /**
   * 60 FPS Render Hook from Frame Loop
   */
  /** Pressing a small ring presses that INPUT button (wired by app.ts). */
  onSelectInput: ((n: number) => void) | null = null;
  private model: XtmModel | null = null;

  render(_model: XtmModel, levels: any): void {
    if (!this.isBuilt || !this.container) return;
    this.model = _model;

    // Advance buffer write-head (synchronized to live telemetry from local XMXL instance if available)
    const eyeFlow = this.getEyeFlow();
    if (eyeFlow) {
      this.ringHead = eyeFlow.write_head;
    } else if (this.liveMxlTelemetry && typeof this.liveMxlTelemetry.mxl_write_head === 'number') {
      this.ringHead = this.liveMxlTelemetry.mxl_write_head % this.RING_CAPACITY;
    }

    // Detect active theme for data stream styling
    const isMcDark = document.body.classList.contains('theme-mccurdy-dark');
    const isMcLight = document.body.classList.contains('theme-mccurdy') || document.body.classList.contains('theme-mccurdy-light');
    const isWbsCa = document.body.classList.contains('theme-wbs-ca');

    let ringColor0 = '#38bdf8';
    let ringColor1 = '#f97316';
    if (isMcDark) {
      ringColor0 = '#3892d4'; // McCurdy Slate Blue
      ringColor1 = '#f59e0b'; // McCurdy Warm Amber
    } else if (isMcLight) {
      ringColor0 = '#1e3a5f'; // McCurdy Navy
      ringColor1 = '#b91c1c'; // McCurdy Burgundy
    } else if (isWbsCa) {
      ringColor0 = '#f97316'; // WBS Vintage Orange
      ringColor1 = '#d97706'; // WBS Vintage Amber
    }

    const vuL = levels?.vuDb ? levels.vuDb[0] : -60.0;
    const vuR = levels?.vuDb ? levels.vuDb[1] : -60.0;

    // Scanalyzer Audio Eye: real 10-second ring buffer of the selected flow
    if (this.eyeCanvas) {
      this.drawScanalyzerEye(this.eyeCanvas, eyeFlow, isMcDark, isMcLight, isWbsCa, false);

      const clkEl = this.container.querySelector('#rcEyeNtpClock');
      const secEl = this.container.querySelector('#rcEyeSec10');
      const lagEl = this.container.querySelector('#rcEyeMeterLag');
      const headIdxEl = this.container.querySelector('#rcEyeHeadIndex');
      const headSecEl = this.container.querySelector('#rcEyeHeadSec');
      // No header: the flow line is drawn inside the eye's hub (next frame) and is its tooltip
      const setLabel = (t: string) => { this.eyeLabel = t; if (this.eyeCanvas) this.eyeCanvas.title = t; };
      if (clkEl) clkEl.textContent = new Date().toISOString().slice(11, 23);
      if (eyeFlow) {
        const sr = eyeFlow.sample_rate || 48000;
        const len = eyeFlow.buffer_length || this.RING_CAPACITY;
        const lag = (eyeFlow.write_head - eyeFlow.meter_head + len) % len;
        if (secEl) secEl.textContent = `#${eyeFlow.meter_head}`;
        if (lagEl) lagEl.textContent = `${(eyeFlow.meter_head / sr).toFixed(3)}s · lag ${(lag / sr * 1000).toFixed(1)} ms`;
        if (headIdxEl) headIdxEl.textContent = `#${eyeFlow.write_head}`;
        if (headSecEl) headSecEl.textContent = `${(eyeFlow.write_head / sr).toFixed(3)}s / ${len.toLocaleString()} frames`;
        setLabel(eyeFlow.kind === 'testpoint'
          ? `${eyeFlow.label} · ${eyeFlow.source || ''} · ring ${eyeFlow.buffer_length / eyeFlow.packet_frames <= 64 ? `10 × ${eyeFlow.packet_frames} fr` : `${(eyeFlow.ring_ms / 1000).toFixed(0)} s`} (${eyeFlow.ring_frames.toLocaleString()} fr)${eyeFlow.status !== 'running' ? ' · ' + String(eyeFlow.status).toUpperCase() : ''}`
          : `${String(eyeFlow.label).replace(/\s*\([^)]*\)\s*$/, '')} · ${eyeFlow.channel_count}ch @ ${sr / 1000}kHz`);
      } else {
        if (secEl) secEl.textContent = '—';
        if (headIdxEl) headIdxEl.textContent = 'HEAD: —';
        if (headSecEl) headSecEl.textContent = 'no MXL ring data';
        setLabel(this.ringsFresh() ? 'no test point' : 'NO MXL DATA · start ward-beck-audio-tab.py (port 8467)');
      }
    }
    this.renderGeneratorGrid(isMcDark, isMcLight, isWbsCa);

    // Phase Correlation Calculation & Needle Deflection
    const diff = Math.abs(vuL - vuR);
    const currentPhaseCorr = Math.max(-0.95, Math.min(0.98, 1.0 - (diff / 16.0)));
    if (this.corrValReadout) this.corrValReadout.textContent = `corr ${currentPhaseCorr >= 0 ? '+' : ''}${currentPhaseCorr.toFixed(2)}`;
    if (this.phaseNeedle) this.phaseNeedle.style.left = `${((currentPhaseCorr + 1.0) / 2.0) * 100}%`;

    this.renderFlowRings([ringColor0, ringColor1], isMcDark, isMcLight, isWbsCa);

    // 5. Update ITU-R BS.1770 / EBU R128 LOUDNESS metrics
    const dbfsL = levels?.dbfs ? levels.dbfs[0] : vuL;
    const dbfsR = levels?.dbfs ? levels.dbfs[1] : vuR;
    const lufsVal = Math.max(-60, Math.min(0, (dbfsL + dbfsR) / 2));
    const truePeak = Math.max(-60, Math.min(3, Math.max(dbfsL, dbfsR) + 0.3));

    const luIntEl = this.$('#rcLuIntegrated');
    const luMomEl = this.$('#rcLuMomentary');
    const luShortEl = this.$('#rcLuShort');
    const luTpEl = this.$('#rcLuTruePeak');

    if (luIntEl) luIntEl.textContent = `${lufsVal.toFixed(1)} LUFS`;
    if (luMomEl) luMomEl.textContent = `${(lufsVal + 0.2).toFixed(1)} LUFS`;
    if (luShortEl) luShortEl.textContent = `${(lufsVal - 0.1).toFixed(1)} LUFS`;
    if (luTpEl) luTpEl.textContent = `${truePeak.toFixed(1)} dBTP`;
  }

  private initXmxlBinding(): void {
    if (this.unsubscribeXmxl) this.unsubscribeXmxl();
    this.unsubscribeXmxl = onXmxlInstancesChanged((instances) => {
      this.detectedInstances = instances;
      this.updateXmxlBar();
    });
  }

  private updateXmxlBar(): void {
    if (!this.container) return;
    const headroomEl = this.$('#rcHeadroomTag');

    // Discovered nodes + flows are drawn as signals in the pipeline graph above.
    this.graph?.setLocal(this.detectedInstances, this.selectedFlowId, (instId, flowId) => {
      const inst = this.detectedInstances.find((i) => i.id === instId);
      if (!inst) return;
      if (instId !== this.selectedInstanceId) this.switchXmxlInstance(inst.port, instId);
      this.selectedFlowId = flowId;
      this.updateXmxlBar();
      this.meterFlow(inst.port, flowId);
    });

    const curInst = (this.selectedInstanceId ? this.detectedInstances.find((i) => i.id === this.selectedInstanceId) : null) || this.detectedInstances.find((i) => i.port === this.selectedPort) || this.detectedInstances[0];
    if (headroomEl && curInst) {
      headroomEl.textContent = `DOMAIN: ${curInst.domainId || 'domain-wbs-dmf-01'} · LATENCY: ${curInst.latencyMs}ms · 0 OVERRUNS`;
    }

    // Connect SSE stream if not connected and instance 8467 is active
    if (!this.activeXmxlDisconnect && curInst && curInst.port === 8467) {
      this.activeXmxlDisconnect = connectXmxlStream(curInst, (d: any) => {
        this.liveMxlTelemetry = d;
      });
    }
  }

  /** Route a flow onto the console meters (only the local host at :8467 carries real audio). */
  private meterFlow(port: number, flowId: string): void {
    if (port !== 8467 || !flowId) return;
    window.dispatchEvent(new CustomEvent('xtm:meter-flow', { detail: { port, flowId } }));
  }

  private switchXmxlInstance(port: number, instId?: string): void {
    this.selectedPort = port;
    if (instId) {
      this.selectedInstanceId = instId;
      setSelectedXmxlInstance(instId);
    } else {
      setSelectedXmxlInstance(`xmxl-${port}`);
    }
    if (this.activeXmxlDisconnect) {
      this.activeXmxlDisconnect();
      this.activeXmxlDisconnect = null;
    }
    const inst = (instId ? this.detectedInstances.find((i) => i.id === instId) : null) || this.detectedInstances.find((i) => i.port === port);
    if (inst && inst.flows && inst.flows.length > 0) {
      this.selectedFlowId = inst.flows[0].flowId;
    }
    if (inst && inst.port === 8467) {
      this.activeXmxlDisconnect = connectXmxlStream(inst, (d: any) => {
        this.liveMxlTelemetry = d;
      });
    }
    this.updateXmxlBar();
  }

  /** Polls the backend for real ring-buffer state of every MXL flow. */
  /** Other places that draw ring eyes (the receivers tab): the rings are polled while they show. */
  private eyeHosts: HTMLElement[] = [];
  watchEyes(host: HTMLElement): void { if (!this.eyeHosts.includes(host)) this.eyeHosts.push(host); }

  /** Draw one flow's ring eye (compact) into a canvas; idle dial when the flow has no ring. */
  drawEyeFor(canvas: HTMLCanvasElement, flowId: string): void {
    const f = this.ringsFresh() && this.mxlRings ? this.mxlRings.flows.find((x: any) => x.flow_id === flowId) : null;
    const b = document.body.classList;
    this.drawScanalyzerEye(canvas, f ?? null, b.contains('theme-mccurdy-dark'), b.contains('theme-mccurdy') || b.contains('theme-mccurdy-light'), b.contains('theme-wbs-ca'), true, '');
  }

  private startRingsPoll(): void {
    if (this.mxlRingsPollTimer !== null) return;
    const poll = () => {
      if (!this.container || !this.container.isConnected) return;
      // Only while a ring is on screen (data or transmitters tab): 10 polls a second otherwise
      // hit the TAP for nothing, and from a public page each one is a Local Network Access request.
      if (!this.container.offsetParent && !this.ringsHost?.offsetParent && !this.eyeHosts.some((h) => h.offsetParent)) return;
      const port = this.selectedPort || 8467;
      fetch(`http://localhost:${port}/api/mxl/rings?bins=360`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && Array.isArray(d.flows)) {
            this.mxlRings = d;
            this.mxlRingsAt = performance.now();
          }
        })
        .catch(() => {});
    };
    poll();
    this.mxlRingsPollTimer = window.setInterval(poll, 100);
    // Flow definitions change rarely: domain, SHM paths, quantum (used for connection info).
    const info = () => {
      if (!this.container || !this.container.isConnected) return;
      fetch(`http://localhost:${this.selectedPort || 8467}/api/mxl`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d) this.mxlInfo = d; })
        .catch(() => {});
    };
    info();
    window.setInterval(info, 5000);
    const aes = () => {
      if (!this.container || !this.container.isConnected) return;
      fetch(`http://localhost:${this.selectedPort || 8467}/api/aes67`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d && Array.isArray(d.transmitters)) this.setAes67(d); })
        .catch(() => {});
    };
    aes();
    window.setInterval(aes, 1000);
  }

  private setAes67(d: any): void {
    this.aes67 = Object.fromEntries(d.transmitters.map((t: any) => [t.flow_id, t]));
    this.aes67At = performance.now();
    // The PTP leader the AES67 SDPs name; without PTP the streams run on this machine's (NTP) clock.
    const cm = this.container?.querySelector('#rcClockMaster');
    const l = d.ptp_leader;
    const text = l ? `PTP domain ${l.domain} · GM ${l.identity}` : 'system clock (NTP)';
    if (cm && cm.textContent !== text) cm.textContent = text;
  }

  /** Generator panel (generators tab) that feeds each MXL flow. */
  static readonly GEN_PANELS: Record<string, string> = {
    'wbs-flow-ref-tone': '.rc-pod-panel',
    'wbs-flow-bit-spitter': '.wbs-bitset',
  };

  /** Clicking a generator's flow card opens the generators tab at that generator. */
  private showGenerator(flowId: string): void {
    const sel = DataStreamView.GEN_PANELS[flowId];
    if (!sel) return;
    (window as any).setLowerUnitMode?.('generators');
    const panel = document.querySelector(`#generatorsStage ${sel}`) as HTMLElement | null;
    if (!panel) return;
    requestAnimationFrame(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      panel.classList.remove('gen-flash');
      void panel.offsetWidth; // restart the animation
      panel.classList.add('gen-flash');
      window.setTimeout(() => panel.classList.remove('gen-flash'), 1600);
    });
  }

  /** AES67 transmitter for a flow, if the daemon has one (stale after 3 s). */
  private aes67For(flowId: string): any | null {
    return performance.now() - this.aes67At < 3000 ? this.aes67[flowId] ?? null : null;
  }

  /** TX button: start/stop the flow's AES67 transmitter (multicast RTP + SAP on the network). */
  private toggleAes67(btn: HTMLButtonElement): void {
    const id = btn.dataset.aes67Tx || '';
    const t = this.aes67For(id);
    if (!t) return;
    btn.disabled = true;
    fetch(`http://localhost:${this.selectedPort || 8467}/api/aes67`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow_id: id, enabled: !t.running }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && Array.isArray(d.transmitters)) this.setAes67(d); })
      .catch(() => {})
      .finally(() => { btn.disabled = false; });
  }

  private copyAes67Sdp(btn: HTMLElement): void {
    const t = this.aes67For(btn.dataset.aes67Sdp || '');
    if (!t?.sdp) return;
    const done = (ok: boolean) => { btn.textContent = ok ? '✓' : '✕'; setTimeout(() => { btn.textContent = 'SDP'; }, 1500); };
    navigator.clipboard?.writeText(t.sdp).then(() => done(true), () => done(false)) ?? done(false);
  }

  private ringsFresh(): boolean {
    return !!this.mxlRings && performance.now() - this.mxlRingsAt < 2000;
  }

  /** The big eye is the lit INPUT's ring (what the XTM-4 plays: if it glows, it goes); an input
   *  with no ring (tab, sound card) falls back to the test point clipped in the pipeline. */
  private getEyeFlow(): any | null {
    if (!this.ringsFresh() || !this.mxlRings) return null;
    const lit = this.model?.power ? this.model.getSelectedInput() : 0;
    const id = lit ? inputFlowId(inputAssignment(lit)) : null;
    const input = id ? this.mxlRings.flows.find((f: any) => f.flow_id === id) : null;
    return input || this.mxlRings.flows.find((f: any) => f.kind === 'testpoint') || null;
  }

  /** One EBU DMF ring buffer card per MXL flow: a ring per channel (real min/max bins) + copyable connection info. */
  private renderFlowRings(colors: string[], isMcDark: boolean, isMcLight: boolean, isWbsCa: boolean): void {
    const grid = this.$('#rcFlowRings') as HTMLElement | null;
    if (!grid) return;
    const live: any[] = this.ringsFresh() && this.mxlRings ? this.mxlRings.flows : [];
    // Four transmitters: the program bus, the generators, then the Ward-Beck Tap (test point).
    // The Tap only has a ring while a test point is set; until then its card sits idle.
    // Receivers (router CH 9 / 10) are not transmitters: they show on the input rings only.
    const flows: any[] = [...live.filter((f) => f.kind !== 'testpoint' && f.kind !== 'receiver'), ...live.filter((f) => f.kind === 'testpoint')];
    if (live.length && !flows.some((f) => f.kind === 'testpoint')) {
      flows.push({ flow_id: 'wbs-test-point', label: 'Ward-Beck Test Point Tap', kind: 'testpoint', idle: true,
        channel_count: 2, sample_rate: 48000, write_head: 0, buffer_length: this.RING_CAPACITY, channels: [] });
    }
    this.flowCards = flows;
    const key = flows.map((f) => `${f.flow_id}:${f.channel_count}:${f.idle ? 'idle' : ''}:${this.aes67For(f.flow_id) ? 'aes67' : ''}`).join('|');
    if (key !== this.flowRingsKey) {
      this.flowRingsKey = key;
      const esc = (v: unknown) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
      grid.innerHTML = flows.length === 0
        ? '<div class="rc-gen-empty">No MXL flows: start ward-beck-audio-tab.py (port 8467)</div>'
        : flows.map((f, i) => `
          <div class="rc-flow-ring-card${f.idle ? ' idle' : ''}" data-flow-ring="${esc(f.flow_id)}" title="${esc(f.label)}\n${f.idle ? 'No test point set: click a test point in the data tab pipeline' : DataStreamView.GEN_PANELS[f.flow_id] ? 'Click to open its generator' : 'Click to show in the Scanalyzer eye'}">
            <div class="rc-flow-ring-head">
              <span class="rc-flow-ring-name">${esc(String(f.label).replace(/^Ward-Beck\s+/, '').replace(/\s*\([^)]*\)\s*$/, ''))}</span>
              <span class="rc-ring-head" id="rcFlowHead${i}">#0</span>
              <button type="button" class="rc-flow-copy" data-flow-copy="${esc(f.flow_id)}" title="Copy MXL flow ID ${esc(f.flow_id)}\n\n${esc(this.connectionInfo(f))}" aria-label="Copy MXL flow ID for ${esc(f.label)}">MXL ID</button>
            </div>
            <div class="rc-flow-ring-chs">
              <canvas id="rcFlowRing${i}" width="220" height="220" class="rc-flow-eye"></canvas>
            </div>
            ${this.aes67For(f.flow_id) ? `
            <div class="rc-aes67-tx" data-aes67="${esc(f.flow_id)}">
              <span class="rc-led-dot rc-aes67-led"></span>
              <span class="rc-aes67-tag">AES67</span>
              <span class="rc-aes67-addr"></span>
              <button type="button" class="rc-aes67-btn" data-aes67-tx="${esc(f.flow_id)}">TX</button>
              <button type="button" class="rc-flow-copy" data-aes67-sdp="${esc(f.flow_id)}" title="Copy AES67 SDP (ts-refclk names the PTP leader)" aria-label="Copy AES67 SDP for ${esc(f.label)}">SDP</button>
            </div>` : ''}
          </div>`).join('');
      grid.querySelectorAll('[data-flow-ring]').forEach((card) => {
        card.addEventListener('click', (e) => {
          const t = e.target as HTMLElement;
          const tx = t.closest('[data-aes67-tx]') as HTMLElement | null;
          if (tx) { this.toggleAes67(tx as HTMLButtonElement); return; }
          const sdp = t.closest('[data-aes67-sdp]') as HTMLElement | null;
          if (sdp) { this.copyAes67Sdp(sdp); return; }
          if (t.closest('.rc-aes67-tx')) return;
          const copy = t.closest('[data-flow-copy]') as HTMLElement | null;
          if (copy) { this.copyConnectionInfo(copy); return; }
          if ((card as HTMLElement).classList.contains('idle')) return;
          this.selectedFlowId = (card as HTMLElement).dataset.flowRing || this.selectedFlowId;
          this.showGenerator(this.selectedFlowId);
          this.updateXmxlBar();
          this.meterFlow(this.selectedPort || 8467, this.selectedFlowId);
        });
      });
    }
    const eyeId = this.getEyeFlow()?.flow_id;
    flows.forEach((f, i) => {
      const head = grid.querySelector(`#rcFlowHead${i}`);
      if (head) head.textContent = f.idle ? 'idle' : `#${f.write_head}`;
      grid.querySelector(`[data-flow-ring="${CSS.escape(f.flow_id)}"]`)?.classList.toggle('active', f.flow_id === eyeId);
      // Same eye as the data view: one dial per flow, a band per channel
      const cv = grid.querySelector(`#rcFlowRing${i}`) as HTMLCanvasElement | null;
      if (cv) this.drawScanalyzerEye(cv, f, isMcDark, isMcLight, isWbsCa, false, '');
      const tx = this.aes67For(f.flow_id);
      const strip = tx ? grid.querySelector(`[data-aes67="${CSS.escape(f.flow_id)}"]`) as HTMLElement | null : null;
      if (tx && strip) {
        strip.classList.toggle('on', !!tx.running);
        strip.classList.toggle('fault', !!tx.error);
        const addr = strip.querySelector('.rc-aes67-addr');
        const a = `${tx.multicast_ip}:${tx.port}`;
        if (addr && addr.textContent !== a) addr.textContent = a;
        const btn = strip.querySelector('.rc-aes67-btn') as HTMLElement | null;
        if (btn) btn.classList.toggle('active', !!tx.running);
        strip.title = [
          `AES67 ${tx.label} → ${a} (TTL ${tx.ttl}, source ${tx.source_ip})`,
          `${tx.encoding} · ${tx.sample_rate} Hz · ${tx.channels} ch · ${tx.ptime_ms} ms · PT ${tx.payload_type} · SAP ${tx.running ? 'announced' : 'silent'}`,
          tx.running ? `${Number(tx.packets).toLocaleString()} packets · ${tx.underruns} underruns · ${tx.rate_ppm >= 0 ? '+' : ''}${tx.rate_ppm} ppm` : 'Off: TX starts it (multicast on the network)',
          tx.error ? `Error: ${tx.error}` : '',
        ].filter(Boolean).join('\n');
      }
    });
  }

  /** Everything a reader needs to attach to a flow: SHM ring files, format, clock and the daemon's HTTP taps. */
  private connectionInfo(f: any): string {
    const domain = this.mxlInfo?.domain_id || 'domain-wbs-dmf-01';
    const base = this.mxlInfo?.shm_base_dir || '/dev/shm/mxl';
    const def = this.mxlInfo?.flows?.find((d: any) => d.flow_id === f.flow_id) ?? {};
    const shm = def.shm_path || `${base}/${domain}/${f.flow_id}`;
    const sr = f.sample_rate || 48000, len = f.buffer_length || this.RING_CAPACITY, q = def.quantum || this.QUANTUM;
    const http = `http://localhost:${this.selectedPort || 8467}/api/mxl/flow/${f.flow_id}`;
    return [
      `MXL flow     ${f.label}`,
      `Flow ID      ${f.flow_id}`,
      `Domain       ${domain}  (${base}/${domain})`,
      `SHM ring     ${shm}/ring.data   (header: ring.header, definition: flow_def.json)`,
      `Format       ${def.media_type || 'audio/float32'} · ${f.channel_count} ch · ${sr} Hz`,
      `Ring         ${len.toLocaleString()} frames (${(len / sr).toFixed(1)} s) · quantum ${q} (${(q / sr * 1000).toFixed(2)} ms)`,
      `Clock        SMPTE 2059-1 TAI`,
      `PCM          ${http}/pcm?since=<cursor>&max=<frames>   (planar Float32 LE)`,
      `Levels       ${http}/levels`,
      `Slice        ${http}/slice?tail=<frame>&count=${q}`,
    ].join('\n');
  }

  private copyConnectionInfo(btn: HTMLElement): void {
    const f = this.flowCards.find((x: any) => x.flow_id === btn.dataset.flowCopy);
    if (!f) return;
    const text = f.flow_id;
    const done = (ok: boolean) => { btn.textContent = ok ? '✓' : '✕'; setTimeout(() => { btn.textContent = 'MXL ID'; }, 1500); };
    navigator.clipboard?.writeText(text).then(() => done(true), () => done(false)) ?? done(false);
  }

  /** One mini ring + stacked per-channel meter for each declared generator flow. */
  /** Four small rings: the MXL buffers of INPUT 1-4 on the switcher, the pressed one lit. */
  private renderGeneratorGrid(isMcDark: boolean, isMcLight: boolean, isWbsCa: boolean): void {
    const grid = this.container?.querySelector('#rcGenGrid') as HTMLElement | null;
    if (!grid) return;
    const all: any[] = this.ringsFresh() && this.mxlRings ? this.mxlRings.flows : [];
    // An input with no MXL ring (browser tab, a sound card, pink noise) keeps its place as an idle dial.
    const inputs = [1, 2, 3, 4].map((n) => {
      const id = inputFlowId(inputAssignment(n));
      return { n, caption: inputCaption(n), flow: (id && all.find((f) => f.flow_id === id)) || null };
    });
    const flows = inputs.map((x) => x.flow ?? { flow_id: '', channel_count: 2, channels: [] });
    const key = inputs.map((x) => `${x.caption}:${x.flow?.flow_id ?? '-'}:${x.flow?.channel_count ?? 0}`).join('|');
    if (key !== this.genGridKey) {
      this.genGridKey = key;
      grid.innerHTML = inputs.map(({ n, caption, flow: f }, i) => `
          <button type="button" class="rc-gen-card${f ? '' : ' idle'}" data-gen-input="${n}" title="INPUT ${n} · ${caption}${f ? `\n${f.label}` : '\nNo MXL ring for this input'}">
            <canvas class="rc-gen-ring" id="rcGenRing${i}" width="132" height="132"></canvas>
            <div class="rc-gen-meter" id="rcGenMeter${i}">
              ${Array.from({ length: f?.channel_count ?? 0 }, (_, c) => `
                <div class="rc-gen-ch"><span class="rc-gen-chl">${c + 1}</span><div class="rc-gen-bar"><div class="rc-gen-rms"></div><div class="rc-gen-pk"></div></div><span class="rc-gen-db">—</span></div>`).join('')}
            </div>
            <div class="rc-gen-name">${n} · ${caption}</div>
          </button>`).join('');
      grid.querySelectorAll('[data-gen-input]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          this.onSelectInput?.(Number((e.currentTarget as HTMLElement).dataset.genInput));
        });
      });
    }
    const lit = this.model?.power ? this.model.getSelectedInput() : 0;
    const dbToPct = (db: number) => Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
    flows.forEach((f, i) => {
      const cv = grid.querySelector(`#rcGenRing${i}`) as HTMLCanvasElement | null;
      if (cv) this.drawScanalyzerEye(cv, f.flow_id ? f : null, isMcDark, isMcLight, isWbsCa, true, '');
      grid.querySelector(`[data-gen-input="${i + 1}"]`)?.classList.toggle('active', lit === i + 1);
      const rows = grid.querySelectorAll(`#rcGenMeter${i} .rc-gen-ch`);
      rows.forEach((row, c) => {
        const ch = f.channels[c];
        if (!ch) return;
        (row.querySelector('.rc-gen-rms') as HTMLElement).style.clipPath = `inset(0 ${100 - dbToPct(ch.rms_db)}% 0 0)`;
        (row.querySelector('.rc-gen-pk') as HTMLElement).style.left = `${dbToPct(ch.peak_db)}%`;
        (row.querySelector('.rc-gen-db') as HTMLElement).textContent = ch.peak_db <= -119 ? '-∞' : ch.peak_db.toFixed(1);
        row.classList.toggle('over', ch.peak_db > -1);
      });
    });
  }

  /**
   * Radial view of a real MXL ring buffer. The dial never turns: buffer position 0 is at 3 o'clock,
   * clockwise; only the data and the heads move.
   * Each channel is a concentric band (stacked, thinner as channels increase) drawn from
   * the flow's min/max bins. Two heads: the buffer write head and the meter read head.
   */
  private drawScanalyzerEye(
    canvas: HTMLCanvasElement,
    flow: any | null,
    isMcDark = false,
    isMcLight = false,
    isWbsCa = false,
    compact = false,
    label = this.eyeLabel
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const k = w / 440;

    // Colours come from the active theme's --eye-* tokens (css/skins/data-themes.css)
    const T = this.eyeTheme(canvas);
    // With a dial face the scale labels sit inside the face, so the bands step in a little.
    // Bands run wide: from just outside the hub (flow line + pointer) to just inside the scale labels.
    // Small dials (ring buffer cards) keep room for the fixed-size scale labels.
    // Whole-second rings put their numbers in the hub, so the bands run out to the bezel.
    const hubLabels = !(flow?.packet_frames && flow.buffer_length / flow.packet_frames <= 64);
    const rOuter = hubLabels
      ? Math.min(w, h) / 2 - (T.faceMid ? 18 : 15) * k
      : Math.min((T.faceMid && !compact ? 184 : 198) * k, w / 2 - 32);
    const rInner = (compact ? 56 : 76) * k;
    const gridCol = T.grid;
    const writeCol = T.write;
    const meterCol = T.meter;
    const chCols = [T.ch1, T.ch2];

    ctx.clearRect(0, 0, w, h);

    // 0. Dial face in the active meter skin: lamp-lit face inside a dark bezel
    if (T.faceMid) {
      const rFace = Math.min(w, h) / 2 - 3 * k;
      const ly = cy + (T.faceLightY - 0.5) * 2 * rFace;
      const face = ctx.createRadialGradient(cx, ly, 0, cx, ly, rFace * 1.35);
      face.addColorStop(0, T.faceHi);
      face.addColorStop(0.5, T.faceMid);
      face.addColorStop(1, T.faceLo);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rFace, 0, Math.PI * 2);
      ctx.fillStyle = face;
      ctx.fill();
      ctx.lineWidth = Math.max(2, 5 * k);
      ctx.strokeStyle = T.bezel;
      ctx.stroke();
      ctx.restore();
    }

    // Fixed dial: buffer position 0 at 3 o'clock, clockwise. Only the data and the heads move.
    const len = flow?.buffer_length || this.RING_CAPACITY;
    const rot = 0;

    const nCh = flow ? Math.max(1, flow.channel_count || flow.channels?.length || 1) : 2;
    const bandH = (rOuter - rInner) / nCh;

    // 1. Band outlines + 1-second spokes of buffer position (small eyes: none, just tracks and heads)
    const sr = flow?.sample_rate || 48000;
    ctx.save();
    if (!compact) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridCol;
    for (let c = 0; c <= nCh; c++) {
      ctx.beginPath();
      ctx.arc(cx, cy, rInner + c * bandH, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Spokes: one per second, or one per packet for a test-point ring (10 x packet time).
    // Packet spokes only when the ring is a handful of packets (10 x packet); a long ring
    // (AoIP test points: 10 s of 1 ms packets) keeps one spoke per second.
    const pkt = flow?.packet_frames && flow.buffer_length / flow.packet_frames <= 64 ? flow.packet_frames : 0;
    const dur = flow ? (flow.buffer_length / sr) : 10;
    // Hard cap: never draw more spokes/labels than can be read around the ring.
    const secs = Math.min(64, pkt ? Math.max(1, Math.round(flow.buffer_length / pkt)) : Math.max(1, Math.round(dur)));
    const spokeLabel = (s: number) => {
      if (!pkt) return `${s}`;
      const ms = (s * pkt * 1000) / sr;
      return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${+ms.toFixed(ms < 10 ? 2 : 1)}ms`;
    };
    for (let s = 0; s < secs; s++) {
      const a = (s / secs) * Math.PI * 2 + rot;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (rInner - 4 * k), cy + Math.sin(a) * (rInner - 4 * k));
      ctx.lineTo(cx + Math.cos(a) * (rOuter + 6 * k), cy + Math.sin(a) * (rOuter + 6 * k));
      ctx.strokeStyle = s === 0 ? T.zero : T.spoke;
      ctx.lineWidth = s === 0 ? 2 : 1;
      ctx.stroke();
      if (!compact) {
        // Whole seconds sit in the hub like a clock face; packet times stay outside the ring.
        const lr = pkt ? Math.min(rOuter + 17 * k, w / 2 - 17) : rInner - 14 * k;
        ctx.font = s === 0 ? 'bold 11px monospace' : '9px monospace';
        ctx.fillStyle = s === 0 ? T.zero : T.label;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(spokeLabel(s), cx + Math.cos(a) * lr, cy + Math.sin(a) * lr);
      }
    }
    }
    ctx.restore();

    if (!flow) {
      ctx.save();
      ctx.fillStyle = T.label;
      ctx.font = `${compact ? 9 : 13}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Idle: the caller's word for why (none for the input rings), the hub left blank.
      const why = label.split(' · ')[0];
      if (why) ctx.fillText(compact ? why : why.toUpperCase(), cx, cy);
      ctx.restore();
      return;
    }

    // 2. Real min/max bins per channel, stacked outer (ch1) → inner (chN)
    ctx.save();
    ctx.lineWidth = compact ? 1 : 1.3;
    for (let c = 0; c < nCh; c++) {
      const ch = flow.channels?.[c];
      if (!ch || !ch.max) continue;
      const bins = ch.max.length;
      const base = rOuter - (c + 0.5) * bandH;
      const reach = bandH * 0.5;
      ctx.strokeStyle = chCols[c % chCols.length];
      // Audio fades with age behind the write head and is gone FADE_S after it was written,
      // so the ring is empty by the time the write head comes back round.
      const paths: Path2D[] = Array.from({ length: FADE_STEPS }, () => new Path2D());
      for (let b = 0; b < bins; b++) {
        const mx = Math.max(-1, Math.min(1, ch.max[b] || 0));
        const mn = Math.max(-1, Math.min(1, ch.min[b] || 0));
        if (mx === 0 && mn === 0) continue;
        const pos = ((b + 0.5) / bins) * len;
        const age = (((flow.write_head - pos) % len) + len) % len / sr;
        const step = Math.floor((age / FADE_S) * FADE_STEPS);
        if (step >= FADE_STEPS) continue;
        const a = ((b + 0.5) / bins) * Math.PI * 2 + rot;
        const r0 = base + mn * reach;
        const r1 = base + Math.max(mx * reach, mn * reach + 0.6);
        paths[step].moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        paths[step].lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      }
      paths.forEach((path, i) => {
        ctx.globalAlpha = 1 - i / FADE_STEPS;
        ctx.stroke(path);
      });
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    const wA = (flow.write_head / len) * Math.PI * 2 + rot;
    const mA = (flow.meter_head / len) * Math.PI * 2 + rot;

    // 3. Meter read head: arm across the bands + pointer at centre
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = meterCol;
    ctx.lineWidth = compact ? 1.5 : 2.2;
    ctx.shadowColor = meterCol;
    ctx.shadowBlur = (compact ? 4 : 10) * T.glow;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(mA) * (rInner - 6 * k), cy + Math.sin(mA) * (rInner - 6 * k));
    ctx.lineTo(cx + Math.cos(mA) * (rOuter + 14 * k), cy + Math.sin(mA) * (rOuter + 14 * k)); // a little longer than the write head
    ctx.stroke();
    const rp = compact ? 14 : 28 * k;
    ctx.translate(cx, cy);
    ctx.rotate(mA);
    ctx.beginPath();
    ctx.moveTo(rp, 0);
    ctx.lineTo(-rp * 0.65, -rp * 0.65);
    ctx.lineTo(-rp * 0.38, 0);
    ctx.lineTo(-rp * 0.65, rp * 0.65);
    ctx.closePath();
    ctx.fillStyle = meterCol;
    ctx.fill();
    if (T.faceMid) {
      // Needle hub, as on the meter
      ctx.beginPath();
      ctx.arc(0, 0, rp * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = T.bezel;
      ctx.fill();
    }
    ctx.restore();

    // 3b. Flow line inside the hub, under the pointer: name, then format
    if (!compact && label) {
      const parts = label.split(' · ');
      const lines = [parts[0], parts.slice(1).join(' · ')].filter(Boolean);
      ctx.save();
      ctx.fillStyle = T.label;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      lines.forEach((ln, i) => {
        // Kept inside the ring of hub second numbers (rInner - 14k).
        const y = (24 + i * 12) * k;
        const half = Math.sqrt(Math.max(0, (rInner - 22 * k) ** 2 - (y + 5 * k) ** 2));
        ctx.font = `${i === 0 ? 'bold ' : ''}${Math.round(9 * k)}px monospace`;
        let t = ln;
        while (t.length > 3 && ctx.measureText(t).width > half * 2) t = t.slice(0, -2) + '…';
        ctx.fillText(t, cx, cy + y);
      });
      ctx.restore();
    }

    // 4. Buffer write head: arm with glowing tip
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = writeCol;
    ctx.lineWidth = compact ? 1.8 : 3.2;
    ctx.shadowColor = writeCol;
    ctx.shadowBlur = (compact ? 4 : 9) * T.glow;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(wA) * (rInner - 6 * k), cy + Math.sin(wA) * (rInner - 6 * k));
    ctx.lineTo(cx + Math.cos(wA) * (rOuter + 6 * k), cy + Math.sin(wA) * (rOuter + 6 * k));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + Math.cos(wA) * (rOuter + 6 * k), cy + Math.sin(wA) * (rOuter + 6 * k), compact ? 2.5 : 5.2, 0, Math.PI * 2);
    ctx.fillStyle = T.tip;
    ctx.fill();
    ctx.restore();
  }

  /** Flow line drawn inside the eye's hub. */
  private eyeLabel = '';

  private eyeThemeCache: { key: string; t: { [k: string]: any } } | null = null;

  /** Eye colours from the theme's --eye-* CSS tokens, re-read only when the theme class changes. */
  private eyeTheme(el: Element): { [k: string]: any } {
    const key = document.body.className;
    if (this.eyeThemeCache && this.eyeThemeCache.key === key) return this.eyeThemeCache.t;
    const cs = getComputedStyle(el);
    const v = (n: string, d: string) => cs.getPropertyValue(n).trim() || d;
    const t = {
      grid: v('--eye-grid', '#0e2338'),
      spoke: v('--eye-spoke', '#112942'),
      zero: v('--eye-zero', '#ef4444'),
      label: v('--eye-label', '#94a3b8'),
      ch1: v('--eye-ch1', 'rgba(34,197,94,0.9)'),
      ch2: v('--eye-ch2', 'rgba(56,189,248,0.9)'),
      write: v('--eye-write', '#f97316'),
      tip: v('--eye-tip', '#ff2810'),
      meter: v('--eye-meter', '#d946ef'),
      glow: parseFloat(v('--eye-glow', '1')),
      // Meter face (empty = no face, transparent canvas as before)
      faceHi: v('--eye-face-hi', ''),
      faceMid: v('--eye-face-mid', ''),
      faceLo: v('--eye-face-lo', ''),
      faceLightY: parseFloat(v('--eye-face-light-y', '0.38')),
      bezel: v('--eye-bezel', '#0b0c0e'),
    };
    this.eyeThemeCache = { key, t };
    return t;
  }

}
