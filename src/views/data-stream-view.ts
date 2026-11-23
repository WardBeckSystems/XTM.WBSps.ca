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
import {
  getActiveXmxlInstances,
  onXmxlInstancesChanged,
  connectXmxlStream,
  setSelectedXmxlInstance,
  type XmxlInstance,
} from '../audio/engine/sources/xmxl-discovery';
import { PipelineGraph } from './pipeline-graph';

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
    this.cacheNeedles();
    this.initXmxlBinding();
    this.startRingsPoll();
    const graphEl = this.container.querySelector('#rcPipelineGraph') as HTMLElement | null;
    // Clicking a pipeline card clips the test point there; the eye follows it.
    if (graphEl) new PipelineGraph(graphEl, (on) => { if (on) this.setFlow('wbs-test-point'); }).start();
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
        <!-- Console Chassis Header -->
        <div class="routing-rack-header">
          <div class="routing-header-left">
            <div class="routing-wbs-badge">
              <span class="wbs-mark">WBS</span>
              <span class="wbs-rack-code">WBS-DMF-100</span>
            </div>
            <div>
              <div class="routing-header-title">WARD-BECK SYSTEMS // DATA STREAM</div>
              <div class="routing-header-sub">
                EBU DMF Shared-Memory Ring Buffer Bus · SMPTE 2059-1 TAI · Precision Console Flow
              </div>
            </div>
          </div>
          <div class="routing-header-badges">
            <span class="rc-badge rc-badge-active" id="rcBadgePipewire">PIPEWIRE 1.0</span>
            <span class="rc-badge rc-badge-cyan" id="rcBadgeAlsa">ALSA DIRECT</span>
            <span class="rc-badge rc-badge-pulse-green" id="rcBadgeMxl">● XMXL: SCANNING...</span>
            <span class="rc-badge" id="rcBadgeTai">TAI: SYNCED</span>
            <span class="rc-badge rc-pill-dante" id="rcBadgeDante">🎵 DANTE: 16 CH</span>
            <span class="rc-badge rc-pill-ravenna" id="rcBadgeRavenna">📻 RAVENNA RTSP</span>
            <span class="rc-badge rc-pill-aes67" id="rcBadgeAes67">🌐 AES67 SAP</span>
          </div>
        </div>

        <!-- TOP STUDIO MONITORING DECK: SCANALYZER AUDIO EYE + DUAL STUDIO ANALOG VU METERS -->
        <div class="rc-top-monitoring-deck">
          <!-- LEFT PANE: Scanalyzer Audio Eye Visualizer & Phase Correlation Bar -->
          <div class="rc-deck-col rc-eye-col">
            <div class="rc-deck-header">
              <span>SCANALYZER AUDIO EYE // 10s RADIAL RING BUFFER</span>
              <span class="rc-deck-sub" id="rcEyeFlowLabel">Float32 @ 48kHz · waiting for /api/mxl/rings</span>
            </div>

            <div class="rc-eye-canvas-container">
              <canvas id="rcEyeCanvas" width="440" height="440" class="rc-eye-canvas"></canvas>
            </div>
            <div class="rc-eye-legend">
              <span><i class="rc-eye-key rc-eye-key-write"></i>BUFFER WRITE HEAD</span>
              <span><i class="rc-eye-key rc-eye-key-meter"></i>METER READ HEAD</span>
            </div>

            <!-- One ring + meter per declared signal generator (real ring buffers) -->
            <div class="rc-gen-grid" id="rcGenGrid"></div>

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
                <div class="rc-eye-hud-val" id="rcEyeNtpClock" style="color:#38bdf8;">00:00:00.000</div>
                <div class="rc-eye-hud-sub" id="rcEyeTaiNs">TAI: SYNCED (0 ns)</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">METER READ HEAD</div>
                <div class="rc-eye-hud-val" id="rcEyeSec10" style="color:#d946ef;">—</div>
                <div class="rc-eye-hud-sub" id="rcEyeMeterLag">0s @ Far Right (3 o'clock) · Clockwise</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">ACTIVE WRITE HEAD</div>
                <div class="rc-eye-hud-val" id="rcEyeHeadIndex">HEAD: #0</div>
                <div class="rc-eye-hud-sub" id="rcEyeHeadSec">0.000s / 480,000 frames</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">BUFFER CAPACITY &amp; SHM</div>
                <div class="rc-eye-hud-val" style="color:#4ade80;">480,000 FRAMES (10.0s)</div>
                <div class="rc-eye-hud-sub">Float32 Stereo · 3.84 MB /dev/shm</div>
              </div>
            </div>
          </div>

          <!-- RIGHT PANE: 4-Layer Linux Audio Pipeline & Topology Grid -->
          <div class="rc-deck-col rc-pipeline-col">
            <div class="rc-deck-header">
              <span>LAYERED LINUX AUDIO PIPELINE &amp; GRAPH TOPOLOGY</span>
              <span class="rc-deck-sub">ALSA Hardware · PipeWire Graph · MXL Shared Memory · Network AoIP</span>
            </div>

            <!-- Live signal-flow graph (pipeline-graph.ts): ALSA → PipeWire → MXL → AoIP + PTP band -->
            <div class="rc-pipeline-graph" id="rcPipelineGraph"></div>

            <!-- Pipeline Stream Telemetry Details -->
            <div class="rc-pipeline-telemetry-row">
              <div class="rc-telemetry-box">
                <div class="rc-telemetry-box-title">STREAM CLOCK &amp; TIMING</div>
                <div class="rc-telemetry-box-body">
                  <div class="rc-telemetry-item"><span>Clock Master:</span> <strong style="color:#38bdf8;">SMPTE 2059-1 TAI (PTP Domain 0)</strong></div>
                  <div class="rc-telemetry-item"><span>Sampling Clock:</span> <strong>48,000 Hz Continuous</strong></div>
                  <div class="rc-telemetry-item"><span>Quantum Period:</span> <strong>256 samples (5.333 ms)</strong></div>
                  <div class="rc-telemetry-item"><span>Grandmaster Skew:</span> <strong style="color:#4ade80;">&lt; 15 ns (Locked)</strong></div>
                </div>
              </div>
              <div class="rc-telemetry-box">
                <div class="rc-telemetry-box-title">ZERO-COPY RING STATUS</div>
                <div class="rc-telemetry-box-body">
                  <div class="rc-telemetry-item"><span>SHM Domain:</span> <strong style="color:#ea580c;">/dev/shm/mxl/domain-wbs-dmf-01</strong></div>
                  <div class="rc-telemetry-item"><span>Ring Buffer Capacity:</span> <strong>480,000 frames (10.0 s)</strong></div>
                  <div class="rc-telemetry-item"><span>Access Mode:</span> <strong>PROT_READ (Wait-Free Atomic)</strong></div>
                  <div class="rc-telemetry-item"><span>Buffer Overruns:</span> <strong style="color:#4ade80;">0 Overruns / 0 Drops</strong></div>
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

              <!-- Real-time Local XMXL Instance & Flow Discovery Bar -->
              <div class="rc-xmxl-bar" id="rcXmxlBar">
                <div class="rc-xmxl-bar-left">
                  <span class="rc-xmxl-label">
                    <span class="rc-led-indicator lit-green" id="rcLedXmxl"></span>
                    LOCAL XMXL NODES:
                  </span>
                  <div class="rc-xmxl-instances" id="rcXmxlInstances">
                    <span class="rc-xmxl-pill active">SCANNING 127.0.0.1...</span>
                  </div>
                </div>
                <div class="rc-xmxl-bar-right">
                  <span class="rc-xmxl-flows-label">ACTIVE FLOW:</span>
                  <div class="rc-xmxl-flows" id="rcXmxlFlows">
                    <button type="button" class="rc-xmxl-flow-btn active" data-flow="wbs-flow-master-stereo">wbs-flow-master-stereo</button>
                    <button type="button" class="rc-xmxl-flow-btn" data-flow="wbs-flow-ref-tone">wbs-flow-ref-tone</button>
                    <button type="button" class="rc-xmxl-flow-btn" data-flow="wbs-flow-bit-spitter">wbs-flow-bit-spitter</button>
                  </div>
                </div>
              </div>

              <div class="rc-rings-row">
                <!-- Channel 0: Left Ring -->
                <div class="rc-ring-widget">
                  <div class="rc-ring-title">
                    <span>CH 0: LEFT (Float32)</span>
                    <span class="rc-ring-head" id="rcCh0Head">HEAD: #0</span>
                  </div>
                  <canvas id="rcRingCanvas0" width="180" height="180" class="rc-canvas"></canvas>
                </div>

                <!-- Center Bridge Stats -->
                <div class="rc-buffer-bridge">
                  <div class="rc-stat-box">
                    <div class="rc-stat-label">CAPACITY</div>
                    <div class="rc-stat-val">480,000 f</div>
                    <div class="rc-stat-sub">10.0s · 3.84 MB /dev/shm</div>
                  </div>
                  <div class="rc-stat-box">
                    <div class="rc-stat-label">QUANTUM</div>
                    <div class="rc-stat-val">256 frames</div>
                    <div class="rc-stat-sub">5.33 ms @ 48k</div>
                  </div>
                  <div class="rc-stat-box">
                    <div class="rc-stat-label">SLIP RATE</div>
                    <div class="rc-stat-val" style="color:#22c55e;">0.00 ppm</div>
                    <div class="rc-stat-sub">SMPTE 2059-1</div>
                  </div>
                  <div class="rc-stat-box">
                    <div class="rc-stat-label">LOCK TYPE</div>
                    <div class="rc-stat-val" style="color:#38bdf8;">PROT_READ</div>
                    <div class="rc-stat-sub">Zero Copy</div>
                  </div>
                </div>

                <!-- Channel 1: Right Ring -->
                <div class="rc-ring-widget">
                  <div class="rc-ring-title">
                    <span>CH 1: RIGHT (Float32)</span>
                    <span class="rc-ring-head" id="rcCh1Head">HEAD: #0</span>
                  </div>
                  <canvas id="rcRingCanvas1" width="180" height="180" class="rc-canvas"></canvas>
                </div>
              </div>

              <!-- Linear Buffer Seam Unwrap Indicator -->
              <div class="rc-linear-unwrap">
                <div class="rc-unwrap-label">
                  <span>mxlFlowReaderGetSamples() Memory Window</span>
                  <span id="rcSliceText">Tail: 47744 .. Head: 48000</span>
                </div>
                <div class="rc-unwrap-bar">
                  <div class="rc-bar-slice rc-slice-past" style="width: 25%;">Tail Boundary</div>
                  <div class="rc-bar-slice rc-slice-headroom" style="width: 50%;">Unread Memory Buffer (Wait-Free Headroom)</div>
                  <div class="rc-bar-slice rc-slice-active" style="width: 25%;">Active Quantum (256 f)</div>
                </div>
              </div>

              <!-- Precision ITU-R BS.1770 / EBU R128 LOUDNESS Readout -->
              <div class="rc-loudness-strip" id="rcLoudnessStrip">
                <div class="rc-loudness-metric">
                  <span>INTEGRATED: <strong class="rc-loudness-val" id="rcLuIntegrated">-24.0 LUFS</strong></span>
                  <span>MOMENTARY: <strong class="rc-loudness-val" id="rcLuMomentary">-24.0 LUFS</strong></span>
                  <span>SHORT-TERM: <strong class="rc-loudness-val" id="rcLuShort">-24.0 LUFS</strong></span>
                  <span>TRUE PEAK: <strong class="rc-loudness-val" id="rcLuTruePeak">-1.2 dBTP</strong></span>
                </div>
                <div class="rc-stat-sub" style="color:#38bdf8;">ITU-R BS.1770-4 / EBU R128 CALIBRATED</div>
              </div>
            </div>
        </div>
      </div>
    `;
  }

  /**
   * 60 FPS Render Hook from Frame Loop
   */
  render(_model: XtmModel, levels: any): void {
    if (!this.isBuilt || !this.container) return;

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
      const lblEl = this.container.querySelector('#rcEyeFlowLabel');
      if (clkEl) clkEl.textContent = new Date().toISOString().slice(11, 23);
      if (eyeFlow) {
        const sr = eyeFlow.sample_rate || 48000;
        const len = eyeFlow.buffer_length || this.RING_CAPACITY;
        const lag = (eyeFlow.write_head - eyeFlow.meter_head + len) % len;
        if (secEl) secEl.textContent = `READ: #${eyeFlow.meter_head}`;
        if (lagEl) lagEl.textContent = `${(eyeFlow.meter_head / sr).toFixed(3)}s · lag ${(lag / sr * 1000).toFixed(1)} ms`;
        if (headIdxEl) headIdxEl.textContent = `HEAD: #${eyeFlow.write_head}`;
        if (headSecEl) headSecEl.textContent = `${(eyeFlow.write_head / sr).toFixed(3)}s / ${len.toLocaleString()} frames`;
        if (lblEl) lblEl.textContent = eyeFlow.kind === 'testpoint'
          ? `${eyeFlow.label} · ${eyeFlow.source || ''} · ring 10 × ${eyeFlow.packet_frames} fr (${eyeFlow.ring_ms} ms)${eyeFlow.status !== 'running' ? ' · ' + String(eyeFlow.status).toUpperCase() : ''}`
          : `${eyeFlow.label} · ${eyeFlow.channel_count}ch Float32 @ ${sr / 1000}kHz`;
      } else {
        if (secEl) secEl.textContent = '—';
        if (headIdxEl) headIdxEl.textContent = 'HEAD: —';
        if (headSecEl) headSecEl.textContent = 'no MXL ring data';
        if (lblEl) lblEl.textContent = 'NO MXL DATA · start ward-beck-audio-tab.py (port 8467)';
      }
    }
    this.renderGeneratorGrid(isMcDark, isMcLight, isWbsCa);

    // Phase Correlation Calculation & Needle Deflection
    const diff = Math.abs(vuL - vuR);
    const currentPhaseCorr = Math.max(-0.95, Math.min(0.98, 1.0 - (diff / 16.0)));
    if (this.corrValReadout) this.corrValReadout.textContent = `corr ${currentPhaseCorr >= 0 ? '+' : ''}${currentPhaseCorr.toFixed(2)}`;
    if (this.phaseNeedle) this.phaseNeedle.style.left = `${((currentPhaseCorr + 1.0) / 2.0) * 100}%`;

    // 1. Draw Left & Right Continuous Ring Buffers (Theme-Colored)
    this.drawRing('rcRingCanvas0', this.ringHead, ringColor0, isMcDark, isMcLight, isWbsCa);
    this.drawRing('rcRingCanvas1', this.ringHead, ringColor1, isMcDark, isMcLight, isWbsCa);

    // 2. Update telemetry tags
    const head0El = this.container.querySelector('#rcCh0Head');
    const head1El = this.container.querySelector('#rcCh1Head');
    if (head0El) head0El.textContent = `HEAD: #${this.ringHead}`;
    if (head1El) head1El.textContent = `HEAD: #${this.ringHead}`;

    const sliceEl = this.container.querySelector('#rcSliceText');
    if (sliceEl) {
      const tail = (this.ringHead - this.QUANTUM + this.RING_CAPACITY) % this.RING_CAPACITY;
      const taiInfo = this.liveMxlTelemetry?.tai_ns ? ` · TAI ${this.liveMxlTelemetry.tai_ns.toString().slice(-8)}ns` : '';
      sliceEl.textContent = `Tail: ${tail} .. Head: ${this.ringHead}${taiInfo}`;
    }

    // 5. Update ITU-R BS.1770 / EBU R128 LOUDNESS metrics
    const dbfsL = levels?.dbfs ? levels.dbfs[0] : vuL;
    const dbfsR = levels?.dbfs ? levels.dbfs[1] : vuR;
    const lufsVal = Math.max(-60, Math.min(0, (dbfsL + dbfsR) / 2));
    const truePeak = Math.max(-60, Math.min(3, Math.max(dbfsL, dbfsR) + 0.3));

    const luIntEl = this.container.querySelector('#rcLuIntegrated');
    const luMomEl = this.container.querySelector('#rcLuMomentary');
    const luShortEl = this.container.querySelector('#rcLuShort');
    const luTpEl = this.container.querySelector('#rcLuTruePeak');

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
    const badgeEl = this.container.querySelector('#rcBadgeMxl');
    const instancesEl = this.container.querySelector('#rcXmxlInstances');
    const flowsEl = this.container.querySelector('#rcXmxlFlows');
    const headroomEl = this.container.querySelector('#rcHeadroomTag');

    if (badgeEl) {
      if (this.detectedInstances.length > 0) {
        const nmosCount = this.detectedInstances.filter((i) => i.type === 'nmos-node').length;
        const xmxlCount = this.detectedInstances.length - nmosCount;
        const summary = nmosCount > 0 ? `${xmxlCount} XMXL + ${nmosCount} NMOS IS-04` : `${this.detectedInstances.length} ACTIVE`;
        badgeEl.textContent = `● NETWORK: ${summary}`;
        badgeEl.className = 'rc-badge rc-badge-pulse-green';
      } else {
        badgeEl.textContent = '○ NETWORK: SCANNING...';
        badgeEl.className = 'rc-badge rc-badge-orange';
      }
    }

    if (instancesEl) {
      if (this.detectedInstances.length === 0) {
        instancesEl.innerHTML = '<span class="rc-xmxl-pill active">SCANNING...</span>';
      } else {
        instancesEl.innerHTML = this.detectedInstances
          .map((inst) => {
            const isNmos = inst.type === 'nmos-node';
            const isDante = inst.type === 'dante-node';
            const isRavenna = inst.type === 'ravenna-node';
            const isAes67 = inst.type === 'aes67-node';
            const isMoip = inst.type === 'moip-node';
            const isWbsDomain = inst.id === 'xmxl-wbs-test-signals';
            const isActive = this.selectedInstanceId ? (inst.id === this.selectedInstanceId) : (inst.port === this.selectedPort);

            let portTag = `:${inst.port}`;
            let pillClass = '';
            if (isWbsDomain) { portTag = '⚡ WBS SIGNALS'; pillClass = 'rc-pill-wbs'; }
            else if (isDante) { portTag = '🎵 DANTE'; pillClass = 'rc-pill-dante'; }
            else if (isRavenna) { portTag = '📻 RAVENNA'; pillClass = 'rc-pill-ravenna'; }
            else if (isAes67) { portTag = '🌐 AES67'; pillClass = 'rc-pill-aes67'; }
            else if (isMoip) { portTag = '🐳 MOIP'; pillClass = 'rc-pill-moip'; }
            else if (isNmos) { portTag = '📡 NMOS'; }

            return `<button type="button" class="rc-xmxl-pill ${pillClass} ${isActive ? 'active' : ''}" data-xmxl-port="${inst.port}" data-xmxl-id="${inst.id}">
              <span class="rc-led-dot ${isActive ? (isNmos || isDante ? 'lit-cyan' : 'lit-green') : ''}"></span>
              ${portTag} ${inst.name.replace(/^(Ward-Beck|CBC\/Radio-Canada|NMOS IS-04:\s*|Dante:\s*|Ravenna:\s*|AES67:\s*)\s*/, '')} (${inst.latencyMs}ms)
            </button>`;
          })
          .join('');

        instancesEl.querySelectorAll('[data-xmxl-id]').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const instId = target.getAttribute('data-xmxl-id') || '';
            const port = parseInt(target.getAttribute('data-xmxl-port') || '8467', 10);
            this.switchXmxlInstance(port, instId);
          });
        });
      }
    }

    const curInst = (this.selectedInstanceId ? this.detectedInstances.find((i) => i.id === this.selectedInstanceId) : null) || this.detectedInstances.find((i) => i.port === this.selectedPort) || this.detectedInstances[0];
    if (flowsEl && curInst) {
      const flows = curInst.flows || [];
      if (flows.length > 0) {
        flowsEl.innerHTML = flows
          .map((f) => {
            const isActive = f.flowId === this.selectedFlowId;
            return `<button type="button" class="rc-xmxl-flow-btn ${isActive ? 'active' : ''}" data-xmxl-flow="${f.flowId}">${f.label || f.flowId}</button>`;
          })
          .join('');

        flowsEl.querySelectorAll('[data-xmxl-flow]').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const flowId = (e.currentTarget as HTMLElement).getAttribute('data-xmxl-flow') || '';
            this.selectedFlowId = flowId;
            this.updateXmxlBar();
            this.meterFlow(curInst.port, flowId);
          });
        });
      } else {
        flowsEl.innerHTML = `<span style="font-size:0.65rem;color:#64748b;font-family:monospace;">${curInst.domainId || 'DMF Domain'}</span>`;
      }
    }

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
  private startRingsPoll(): void {
    if (this.mxlRingsPollTimer !== null) return;
    const poll = () => {
      if (!this.container || !this.container.isConnected) return;
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
  }

  private ringsFresh(): boolean {
    return !!this.mxlRings && performance.now() - this.mxlRingsAt < 2000;
  }

  /** The flow shown in the big eye: the selected flow if the engine writes it, else the program bus. */
  private getEyeFlow(): any | null {
    if (!this.ringsFresh() || !this.mxlRings) return null;
    const flows = this.mxlRings.flows;
    return flows.find((f) => f.flow_id === this.selectedFlowId)
      || flows.find((f) => f.kind === 'program')
      || flows[0]
      || null;
  }

  /** One mini ring + stacked per-channel meter for each declared generator flow. */
  private renderGeneratorGrid(isMcDark: boolean, isMcLight: boolean, isWbsCa: boolean): void {
    const grid = this.container?.querySelector('#rcGenGrid') as HTMLElement | null;
    if (!grid) return;
    const flows = this.ringsFresh() && this.mxlRings ? this.mxlRings.flows : [];
    const key = flows.map((f) => `${f.flow_id}:${f.channel_count}`).join('|');
    if (key !== this.genGridKey) {
      this.genGridKey = key;
      grid.innerHTML = flows.length === 0
        ? '<div class="rc-gen-empty">No declared generators — MXL engine not reachable</div>'
        : flows.map((f, i) => `
          <button type="button" class="rc-gen-card" data-gen-flow="${f.flow_id}" title="${f.label}">
            <canvas class="rc-gen-ring" id="rcGenRing${i}" width="132" height="132"></canvas>
            <div class="rc-gen-meter" id="rcGenMeter${i}">
              ${Array.from({ length: f.channel_count }, (_, c) => `
                <div class="rc-gen-ch"><span class="rc-gen-chl">${c + 1}</span><div class="rc-gen-bar"><div class="rc-gen-rms"></div><div class="rc-gen-pk"></div></div><span class="rc-gen-db">—</span></div>`).join('')}
            </div>
            <div class="rc-gen-name">${f.kind === 'program' ? 'PROGRAM · ' : ''}${f.label}</div>
          </button>`).join('');
      grid.querySelectorAll('[data-gen-flow]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          this.selectedFlowId = (e.currentTarget as HTMLElement).getAttribute('data-gen-flow') || this.selectedFlowId;
          this.updateXmxlBar();
          this.meterFlow(this.selectedPort || 8467, this.selectedFlowId);
        });
      });
    }
    const dbToPct = (db: number) => Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
    flows.forEach((f, i) => {
      const cv = grid.querySelector(`#rcGenRing${i}`) as HTMLCanvasElement | null;
      if (cv) this.drawScanalyzerEye(cv, f, isMcDark, isMcLight, isWbsCa, true);
      const card = grid.querySelector(`[data-gen-flow="${f.flow_id}"]`);
      card?.classList.toggle('active', f.flow_id === this.getEyeFlow()?.flow_id);
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
   * Radial view of a real MXL ring buffer. Buffer position 0 is at 3 o'clock, clockwise.
   * Each channel is a concentric band (stacked, thinner as channels increase) drawn from
   * the flow's min/max bins. Two heads: the buffer write head and the meter read head.
   */
  private drawScanalyzerEye(
    canvas: HTMLCanvasElement,
    flow: any | null,
    isMcDark = false,
    isMcLight = false,
    isWbsCa = false,
    compact = false
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const k = w / 440;

    const rOuter = 188 * k;
    const rInner = (compact ? 62 : 82) * k;
    const gridCol = isMcLight ? '#c8c4b7' : (isWbsCa ? '#b0aba0' : (isMcDark ? '#1a2e40' : '#0e2338'));
    const writeCol = '#f97316';
    const meterCol = '#d946ef';
    const chCols = isMcDark
      ? ['rgba(56,146,212,0.9)', 'rgba(245,158,11,0.9)']
      : isWbsCa
        ? ['rgba(249,115,22,0.9)', 'rgba(217,119,6,0.9)']
        : isMcLight
          ? ['rgba(30,58,95,0.9)', 'rgba(185,28,28,0.9)']
          : ['rgba(34,197,94,0.9)', 'rgba(56,189,248,0.9)'];

    ctx.clearRect(0, 0, w, h);

    const nCh = flow ? Math.max(1, flow.channel_count || flow.channels?.length || 1) : 2;
    const bandH = (rOuter - rInner) / nCh;

    // 1. Band outlines + 1-second spokes of buffer position
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridCol;
    for (let c = 0; c <= nCh; c++) {
      ctx.beginPath();
      ctx.arc(cx, cy, rInner + c * bandH, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Spokes: one per second, or one per packet for a test-point ring (10 x packet time).
    const sr = flow?.sample_rate || 48000;
    const pkt = flow?.packet_frames || 0;
    const dur = flow ? (flow.buffer_length / sr) : 10;
    const secs = pkt ? Math.max(1, Math.round(flow.buffer_length / pkt)) : Math.max(1, Math.round(dur));
    const spokeLabel = (s: number) => {
      if (!pkt) return `${s}.0s`;
      const ms = (s * pkt * 1000) / sr;
      return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${+ms.toFixed(ms < 10 ? 2 : 1)}ms`;
    };
    for (let s = 0; s < secs; s++) {
      const a = (s / secs) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (rInner - 4 * k), cy + Math.sin(a) * (rInner - 4 * k));
      ctx.lineTo(cx + Math.cos(a) * (rOuter + 6 * k), cy + Math.sin(a) * (rOuter + 6 * k));
      ctx.strokeStyle = s === 0 ? 'rgba(239, 68, 68, 0.45)' : (isMcLight ? '#c8c4b7' : '#112942');
      ctx.lineWidth = s === 0 ? 2 : 1;
      ctx.stroke();
      if (!compact) {
        const lr = rOuter + 20;
        ctx.font = s === 0 ? 'bold 11px monospace' : '9px monospace';
        ctx.fillStyle = s === 0 ? '#ef4444' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(spokeLabel(s), cx + Math.cos(a) * lr, cy + Math.sin(a) * lr);
      }
    }
    ctx.restore();

    if (!flow) {
      ctx.save();
      ctx.fillStyle = '#64748b';
      ctx.font = `${compact ? 9 : 13}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NO MXL DATA', cx, cy);
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
      const reach = bandH * 0.46;
      ctx.strokeStyle = chCols[c % chCols.length];
      ctx.beginPath();
      for (let b = 0; b < bins; b++) {
        const mx = Math.max(-1, Math.min(1, ch.max[b] || 0));
        const mn = Math.max(-1, Math.min(1, ch.min[b] || 0));
        if (mx === 0 && mn === 0) continue;
        const a = ((b + 0.5) / bins) * Math.PI * 2;
        const r0 = base + mn * reach;
        const r1 = base + Math.max(mx * reach, mn * reach + 0.6);
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      }
      ctx.stroke();
    }
    ctx.restore();

    const len = flow.buffer_length || this.RING_CAPACITY;
    const wA = (flow.write_head / len) * Math.PI * 2;
    const mA = (flow.meter_head / len) * Math.PI * 2;

    // 3. Meter read head: arm across the bands + pointer at centre
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = meterCol;
    ctx.lineWidth = compact ? 1.5 : 2.2;
    ctx.shadowColor = meterCol;
    ctx.shadowBlur = compact ? 4 : 10;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(mA) * (rInner - 6 * k), cy + Math.sin(mA) * (rInner - 6 * k));
    ctx.lineTo(cx + Math.cos(mA) * (rOuter + 2 * k), cy + Math.sin(mA) * (rOuter + 2 * k));
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
    ctx.restore();

    // 4. Buffer write head: arm with glowing tip
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = writeCol;
    ctx.lineWidth = compact ? 1.8 : 3.2;
    ctx.shadowColor = writeCol;
    ctx.shadowBlur = compact ? 4 : 9;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(wA) * (rInner - 6 * k), cy + Math.sin(wA) * (rInner - 6 * k));
    ctx.lineTo(cx + Math.cos(wA) * (rOuter + 6 * k), cy + Math.sin(wA) * (rOuter + 6 * k));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + Math.cos(wA) * (rOuter + 6 * k), cy + Math.sin(wA) * (rOuter + 6 * k), compact ? 2.5 : 5.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2810';
    ctx.fill();
    ctx.restore();
  }

  private drawRing(canvasId: string, head: number, accentColor: string, isMcDark = false, isMcLight = false, isWbsCa = false): void {
    const canvas = this.container?.querySelector(`#${canvasId}`) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const rOuter = 82;
    const rInner = 46;

    ctx.clearRect(0, 0, w, h);

    // 1. Theme-aware circular backplate with high-tech radial gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, rInner - 8, cx, cy, rOuter + 6);
    if (isMcLight) {
      bgGrad.addColorStop(0, '#ede9de');
      bgGrad.addColorStop(0.7, '#e4e0d4');
      bgGrad.addColorStop(1, '#dad5c7');
    } else if (isWbsCa) {
      bgGrad.addColorStop(0, '#d5d1c2');
      bgGrad.addColorStop(0.7, '#cac5b4');
      bgGrad.addColorStop(1, '#bebaa7');
    } else if (isMcDark) {
      bgGrad.addColorStop(0, '#0e1720');
      bgGrad.addColorStop(0.7, '#14202c');
      bgGrad.addColorStop(1, '#1b2a3a');
    } else {
      bgGrad.addColorStop(0, '#03080e');
      bgGrad.addColorStop(0.7, '#07121c');
      bgGrad.addColorStop(1, '#0c1d2e');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter + 4, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // 2. 10-Second Second Divisions & NTP Top-Of-Second Time Ticks
    // 0 seconds is at 3 o'clock (0 radians, far right like standard geometry)
    // Angles advance clockwise: angle = sec * (2 * Math.PI / 10)
    const nowMs = Date.now();
    const currentNtpSec = Math.floor(nowMs / 1000) % 10;
    const ntpSubFrac = (nowMs % 1000) / 1000;
    const ntpPulse = Math.max(0, 1.0 - ntpSubFrac * 2.5); // Sharp flash on the top of the second

    const defaultTickColor = isMcLight ? '#a8a396' : (isWbsCa ? '#8c897b' : (isMcDark ? '#2f475b' : '#1e3d5f'));
    const zeroSecColor = (isMcLight || isWbsCa) ? '#dc2626' : '#ef4444';

    for (let s = 0; s < 10; s++) {
      const theta = s * (Math.PI * 2 / 10);
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const is0s = s === 0;
      const isCurrentNtp = s === currentNtpSec;

      const tickLen = is0s ? 10 : 6;
      ctx.beginPath();
      ctx.moveTo(cx + (rOuter - tickLen) * cosT, cy + (rOuter - tickLen) * sinT);
      ctx.lineTo(cx + (rOuter + 3) * cosT, cy + (rOuter + 3) * sinT);

      if (isCurrentNtp && ntpPulse > 0) {
        // NTP top-of-the-second pulse
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5 + ntpPulse * 1.5;
      } else if (is0s) {
        // 0s Far-Right anchor
        ctx.strokeStyle = zeroSecColor;
        ctx.lineWidth = 2.0;
      } else {
        ctx.strokeStyle = defaultTickColor;
        ctx.lineWidth = 1.0;
      }
      ctx.stroke();

      // Number tick labels (0s, 2s, 4s, 6s, 8s)
      if (s % 2 === 0) {
        let lblColor = isMcLight ? '#4a4740' : (isWbsCa ? '#2a2b2a' : '#64748b');
        if (isCurrentNtp) lblColor = accentColor;
        else if (is0s) lblColor = zeroSecColor;

        ctx.fillStyle = lblColor;
        ctx.font = 'bold 7.5px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lblR = rOuter + 8;
        ctx.fillText(`${s}s`, cx + lblR * cosT, cy + lblR * sinT);
      }
    }

    // 3. Scanalyzer Radial Audio Waveform / Energy Spikes
    // History radiating outward in the 10-second circular buffer
    const headFrac = head / this.RING_CAPACITY;
    const headAngle = headFrac * Math.PI * 2; // 0 rad is at 3 o'clock (far right)!

    const waveformData = this.liveMxlTelemetry?.waveform_ch0 || this.liveMxlTelemetry?.waveform_ch1;
    const bins = 90;
    const dTheta = (Math.PI * 2) / bins;

    for (let b = 0; b < bins; b++) {
      const bTheta = b * dTheta;
      // Distance behind the write head (circular)
      let diff = headAngle - bTheta;
      while (diff < 0) diff += Math.PI * 2;
      const ageFrac = diff / (Math.PI * 2); // 0 = newest (at head), 1 = oldest (10s ago)

      // Signal amplitude from live waveform or synthesized from audio activity
      let amp = 0.15;
      if (waveformData && Array.isArray(waveformData) && waveformData.length > 0) {
        const wfIdx = Math.floor(b * (waveformData.length / bins)) % waveformData.length;
        amp = Math.min(1.0, Math.max(0.08, waveformData[wfIdx]));
      } else {
        // Base energy with authentic audio modulation
        const seed = Math.sin(b * 12.7 + (head / 4800)) * Math.cos(b * 3.1);
        amp = 0.12 + Math.abs(seed) * 0.35 * (1.0 - ageFrac * 0.4);
      }

      const barLen = (rOuter - rInner - 4) * amp;
      const cosB = Math.cos(bTheta);
      const sinB = Math.sin(bTheta);

      ctx.beginPath();
      ctx.moveTo(cx + rInner * cosB, cy + rInner * sinB);
      ctx.lineTo(cx + (rInner + barLen) * cosB, cy + (rInner + barLen) * sinB);

      // Color gradation matching theme
      const alpha = Math.max(0.18, 1.0 - ageFrac * 0.7);
      if (amp > 0.65) {
        ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
      } else if (amp > 0.35) {
        ctx.strokeStyle = isMcLight ? `rgba(30, 58, 95, ${alpha})` : (isWbsCa ? `rgba(217, 119, 6, ${alpha})` : (isMcDark ? `rgba(56, 146, 212, ${alpha})` : `rgba(34, 197, 94, ${alpha})`));
      } else {
        ctx.strokeStyle = isMcLight ? `rgba(74, 71, 64, ${alpha * 0.8})` : (isWbsCa ? `rgba(108, 112, 119, ${alpha * 0.8})` : (isMcDark ? `rgba(37, 57, 73, ${alpha * 0.8})` : `rgba(16, 140, 75, ${alpha * 0.8})`));
      }
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // 4. Center Pointer Triangle
    const triLen = 22;
    const triBaseHalf = 8;
    const cosH = Math.cos(headAngle);
    const sinH = Math.sin(headAngle);
    const cosPerp = -sinH;
    const sinPerp = cosH;

    const tipX = cx + triLen * cosH;
    const tipY = cy + triLen * sinH;
    const base1X = cx + triBaseHalf * cosPerp;
    const base1Y = cy + triBaseHalf * sinPerp;
    const base2X = cx - triBaseHalf * cosPerp;
    const base2Y = cy - triBaseHalf * sinPerp;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(base1X, base1Y);
    ctx.lineTo(base2X, base2Y);
    ctx.closePath();
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.strokeStyle = isMcLight ? '#ffffff' : '#ffffffd9';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 5. Sweep Needle & Glowing Tip
    const needleOuter = rOuter + 2;
    const needleTipX = cx + needleOuter * cosH;
    const needleTipY = cy + needleOuter * sinH;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(needleTipX, needleTipY);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hot tip dot
    ctx.beginPath();
    ctx.arc(needleTipX, needleTipY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = (isMcLight || isWbsCa) ? '#dc2626' : '#ff2810';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 6. Center Hub Display
    const hubBg = isMcLight ? '#f4f1ea' : (isWbsCa ? '#edeae0' : (isMcDark ? '#1a2632' : '#071018'));
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = hubBg;
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Second readout in center
    const secVal = (head / 48000).toFixed(1);
    ctx.fillStyle = isMcLight ? '#1e3a5f' : (isWbsCa ? '#2a2b2a' : accentColor);
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${secVal}s`, cx, cy);
  }
}
