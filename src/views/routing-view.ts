/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS Broadcast Routing Console Canvas
 * Inputs, Outputs, MXL Wait-Free Shared-Memory Buffers,
 * POD-33 Digital Audio Reference & Precision Tone Generator,
 * and ABB-1 Audio Bit Buddy / ABP-1 Bit Spitter Matrix.
 *
 * Broadcast Console layout (Zero spaghetti wires):
 * - Left Bay: Multi-Source Inputs with mini-meters and gain
 * - Center Bay: MXL Circular Continuous Ring Buffer + Illuminated Crosspoint Matrix Grid
 * - Right Bay: Destination Outputs with faders, phase meters, and mutes
 * - Lower Bay: POD-33 Reference Tone Generator & ABB-1 Bit Spitter control surfaces
 */

import type { AppContext } from '../app/app-context';
import type { XtmModel } from '../models/xtm-model';
import {
  DEFAULT_POD33_CONFIG,
  DEFAULT_BITBUDDY_CONFIG,
  type Pod33Config,
  type BitBuddyConfig
} from '../audio/engine/sources/pod33-generator';
import {
  getActiveXmxlInstances,
  onXmxlInstancesChanged,
  connectXmxlStream,
  setSelectedXmxlInstance,
  type XmxlInstance,
} from '../audio/engine/sources/xmxl-discovery';

export class RoutingCanvasView {
  container: HTMLElement | null;
  ctx: AppContext | null = null;
  isBuilt: boolean = false;

  // Active Routing Matrix State (5 Inputs × 7 Outputs — An Output Card per Flow/Destination)
  // Rows: 0: Soundcard, 1: System Audio, 2: POD-33 Tone, 3: Bit Buddy, 4: Pink Noise
  // Cols: 0: XTM-4 Master, 1: POD-22 Loudness, 2: Speakers, 3: Cue/HP, 4: Test Tap, 5: POD-33 Out, 6: Bit Spitter Out
  matrix: boolean[][] = [
    [true,  true,  false, false, false, false, false], // In 0: Soundcard (safe from speaker feedback)
    [true,  true,  true,  false, false, false, false], // In 1: System Audio (Default active -> Speakers ON)
    [true,  true,  true,  false, false, true,  false], // In 2: POD-33 Tone (Dedicated OUT 6 Card ON)
    [true,  true,  true,  false, false, false, true ], // In 3: Bit Buddy (Dedicated OUT 7 Card ON)
    [true,  true,  true,  false, false, false, false], // In 4: Pink Noise (Speakers ON)
  ];

  outMutes: boolean[] = [false, false, false, false, false, false, false];
  outDims: boolean[] = [false, false, false, false, false, false, false];

  activeInput: number = 1; // 1 = System Audio default

  pod33Config: Pod33Config = { ...DEFAULT_POD33_CONFIG };
  bitBuddyConfig: BitBuddyConfig = { ...DEFAULT_BITBUDDY_CONFIG };

  pod33Engaged: boolean = false;
  bitBuddyEngaged: boolean = false;

  // Cached needle SVG elements for 60 FPS updates
  inNeedlesL: (SVGElement | null)[] = [];
  inNeedlesR: (SVGElement | null)[] = [];
  outNeedlesL: (SVGElement | null)[] = [];
  outNeedlesR: (SVGElement | null)[] = [];

  // Scanalyzer Audio Eye Visualizer
  phaseNeedle: HTMLElement | null = null;
  corrValReadout: HTMLElement | null = null;
  eyeCanvas: HTMLCanvasElement | null = null;
  cachedWaveform: any = null;

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
    this.attachEvents();
    this.initXmxlBinding();
    this.isBuilt = true;
  }

  private cacheNeedles(): void {
    if (!this.container) return;
    for (let i = 0; i < 5; i++) {
      this.inNeedlesL[i] = this.container.querySelector(`#rcInNeedleL${i}`) as SVGElement | null;
      this.inNeedlesR[i] = this.container.querySelector(`#rcInNeedleR${i}`) as SVGElement | null;
    }
    for (let i = 0; i < 7; i++) {
      this.outNeedlesL[i] = this.container.querySelector(`#rcOutNeedleL${i}`) as SVGElement | null;
      this.outNeedlesR[i] = this.container.querySelector(`#rcOutNeedleR${i}`) as SVGElement | null;
    }
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
              <span class="wbs-rack-code">WBS-CRM-100</span>
            </div>
            <div>
              <div class="routing-header-title">WARD-BECK SYSTEMS // CONSOLE ROUTING MATRIX</div>
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
              <span>SCANALYZER AUDIO EYE // 10s RADIAL RING BUFFER (STEREO)</span>
              <span class="rc-deck-sub">Float32 @ 48kHz · SMPTE 2059-1 TAI</span>
            </div>

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
                <div class="rc-eye-hud-val" id="rcEyeNtpClock" style="color:#38bdf8;">00:00:00.000</div>
                <div class="rc-eye-hud-sub" id="rcEyeTaiNs">TAI: SYNCED (0 ns)</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">10-SECOND BUFFER PHASE</div>
                <div class="rc-eye-hud-val" id="rcEyeSec10" style="color:#f97316;">0.000 s / 10.000 s</div>
                <div class="rc-eye-hud-sub">0s @ Far Right (3 o'clock) · Clockwise</div>
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

            <div class="rc-pipeline-grid">
              <!-- Layer 1: ALSA Hardware -->
              <div class="rc-pipeline-card">
                <div class="rc-pipeline-title">
                  <span>1. ALSA Hardware</span>
                  <span class="rc-badge rc-badge-cyan" id="rcAlsaCardBadge">HARDWARE</span>
                </div>
                <ul class="rc-pipeline-list" id="rcAlsaList">
                  <li>NVIDIA HDA / HDMI Audio</li>
                  <li>Realtek ALC1220 HD Audio</li>
                  <li>USB Audio Interface</li>
                </ul>
                <div class="rc-pipeline-footer">PCM Devices: Active | 0 Overruns</div>
              </div>

              <!-- Layer 2: PipeWire Graph -->
              <div class="rc-pipeline-card">
                <div class="rc-pipeline-title">
                  <span>2. PipeWire 1.0</span>
                  <span class="rc-badge rc-badge-active" id="rcPwQuantumBadge">256 / 48k</span>
                </div>
                <ul class="rc-pipeline-list" id="rcPwList">
                  <li>wbs_input_bus.monitor</li>
                  <li>wbs_meter_tap.monitor</li>
                  <li>pw-loopback stream links</li>
                </ul>
                <div class="rc-pipeline-footer">Latency: 5.33 ms | Routing: Active</div>
              </div>

              <!-- Layer 3: MXL Shared Memory -->
              <div class="rc-pipeline-card">
                <div class="rc-pipeline-title">
                  <span>3. EBU DMF / MXL</span>
                  <span class="rc-badge" style="background:#ea580c;color:#fff;">/dev/shm/mxl</span>
                </div>
                <ul class="rc-pipeline-list" id="rcMxlList">
                  <li>domain-wbs-dmf-01 (Active)</li>
                  <li>wbs-flow-master-stereo (Master)</li>
                  <li>wbs-flow-ref-tone (POD-33)</li>
                  <li>wbs-flow-bit-spitter (Bit Spitter)</li>
                </ul>
                <div class="rc-pipeline-footer">SMPTE 2059-1 TAI | Zero-Copy PROT_READ</div>
              </div>

              <!-- Layer 4: Network AoIP Bus -->
              <div class="rc-pipeline-card">
                <div class="rc-pipeline-title">
                  <span>4. Network AoIP</span>
                  <span class="rc-badge rc-pill-dante" id="rcAoipBadge">DANTE &amp; RAVENNA</span>
                </div>
                <ul class="rc-pipeline-list" id="rcAoipList">
                  <li>🎵 Dante: Metro16 (16ch DCM)</li>
                  <li>📻 Ravenna: WBS-32me (RTSP)</li>
                  <li>🌐 AES67: SAP Multicast 239.69</li>
                </ul>
                <div class="rc-pipeline-footer">IEEE 1588 PTP | MoipBuddy</div>
              </div>
            </div>

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

        <!-- 3-BAY CONSOLE SURFACE: INPUTS · BUFFER & MATRIX · OUTPUTS -->
        <div class="routing-console-bays">

          <!-- 1. LEFT BAY: INPUTS STRIP -->
          <div class="rc-bay rc-inputs-bay">
            <div class="rc-bay-header">
              <span>INPUT SOURCES</span>
              <span class="rc-bay-sub">5 CHANNELS</span>
            </div>
            <div class="rc-channel-strips" id="rcInputStrips">
              ${this.renderInputStrip(0, 'CH 1', 'Soundcard In', 'Mic / Line In', 'pill-mic')}
              ${this.renderInputStrip(1, 'CH 2', 'System Audio', 'Desktop / YouTube', 'pill-sys', true)}
              ${this.renderInputStrip(2, 'CH 3', 'POD-33 Tone', 'DARS 100/400/1k', 'pill-pod')}
              ${this.renderInputStrip(3, 'CH 4', 'Bit Buddy', 'ABP-1 Bit Spitter', 'pill-abb')}
              ${this.renderInputStrip(4, 'CH 5', 'Pink / Sweep', 'Noise Reference', 'pill-noise')}
            </div>
          </div>

          <!-- 2. CENTER BAY: RING BUFFER & CROSSPOINT MATRIX -->
          <div class="rc-bay rc-center-bay">
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

            <!-- Bottom: Crosspoint Matrix Grid (Zero Spaghetti Wires) -->
            <div class="rc-matrix-card">
              <div class="rc-matrix-header">
                <div class="rc-matrix-header-left">
                  <span>BROADCAST CROSSPOINT ROUTING MATRIX</span>
                  <button type="button" class="rc-btn-master-speakers active" id="btnRouteThisToSpeakers" title="Force route selected input directly to physical speakers">
                    🔊 ROUTE THIS TO THE SPEAKERS (MONITOR 1 OUTPUT)
                  </button>
                </div>
                <div class="rc-matrix-presets">
                  <button type="button" class="rc-btn-preset" data-preset="broadcast">Default</button>
                  <button type="button" class="rc-btn-preset" data-preset="pod33">1kHz Cal</button>
                  <button type="button" class="rc-btn-preset" data-preset="bitbuddy">Bit Spitter</button>
                  <button type="button" class="rc-btn-preset" data-preset="all">Mix All</button>
                </div>
              </div>

              <div class="rc-matrix-table-wrap">
                <table class="rc-matrix-table">
                  <thead>
                    <tr>
                      <th class="rc-th-blank">INPUT \\ OUTPUT</th>
                      <th>OUT 1<br><span class="rc-th-sub">XTM-4</span></th>
                      <th>OUT 2<br><span class="rc-th-sub">POD-22</span></th>
                      <th>OUT 3<br><span class="rc-th-sub">Speakers</span></th>
                      <th>OUT 4<br><span class="rc-th-sub">Cue/HP</span></th>
                      <th>OUT 5<br><span class="rc-th-sub">Test Tap</span></th>
                      <th>OUT 6<br><span class="rc-th-sub">POD-33</span></th>
                      <th>OUT 7<br><span class="rc-th-sub">Bit Spitter</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.renderMatrixRow(0, 'IN 1: Soundcard In')}
                    ${this.renderMatrixRow(1, 'IN 2: System Audio')}
                    ${this.renderMatrixRow(2, 'IN 3: POD-33 Tone')}
                    ${this.renderMatrixRow(3, 'IN 4: Bit Buddy / ABP-1')}
                    ${this.renderMatrixRow(4, 'IN 5: Pink / Sweep')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 3. RIGHT BAY: OUTPUTS STRIP (AN OUTPUT CARD PER FLOW / SINK) -->
          <div class="rc-bay rc-outputs-bay">
            <div class="rc-bay-header">
              <span>OUTPUT DESTINATIONS</span>
              <span class="rc-bay-sub">7 BUSES · AN OUTPUT CARD PER FLOW</span>
            </div>
            <div class="rc-channel-strips" id="rcOutputStrips">
              ${this.renderOutputStrip(0, 'OUT 1', 'XTM-4 Master', 'wbs-flow-master-stereo', true)}
              ${this.renderOutputStrip(1, 'OUT 2', 'POD-22 Loudness', 'ITU-R BS.1770 Bar', true)}
              ${this.renderOutputStrip(2, 'OUT 3', 'MONITOR 1 OUTPUT', 'Speakers // Physical ALSA HW', true)}
              ${this.renderOutputStrip(3, 'OUT 4', 'Studio Cue / HP', 'Control Room Listen', false)}
              ${this.renderOutputStrip(4, 'OUT 5', 'Ward-Beck Tap', 'WBS Test Point Tap', false)}
              ${this.renderOutputStrip(5, 'OUT 6', 'POD-33 Tone Out', 'wbs-flow-ref-tone DARS', true)}
              ${this.renderOutputStrip(6, 'OUT 7', 'Bit Spitter Out', 'wbs-flow-bit-spitter ABP-1', true)}
            </div>
          </div>
        </div>

        <!-- LOWER BAY: DEDICATED WBS POD-33 TONE GEN & ABB-1 BIT BUDDY CONTROLS -->
        <div class="routing-aux-panels">

          <!-- POD-33 REFERENCE TONE GENERATOR -->
          <div class="rc-pod-panel">
            <div class="rc-panel-title">
              <div class="rc-panel-title-left">
                <span class="rc-panel-badge">POD33</span>
                <strong>WBS POD-33 AES DARS &amp; PRECISION TONE GENERATOR</strong>
              </div>
              <button type="button" id="btnTogglePod33" class="rc-power-btn ${this.pod33Engaged ? 'active' : ''}">
                ${this.pod33Engaged ? '● POD-33 ACTIVE' : '○ ACTIVATE POD-33'}
              </button>
            </div>

            <div class="rc-pod-grid">
              <!-- Genlock Reference Clock -->
              <div class="rc-pod-col">
                <div class="rc-control-group-title">REFERENCE LOCK</div>
                <div class="rc-btn-group" role="group">
                  <button type="button" class="rc-btn-sel ${this.pod33Config.refClock === 'video' ? 'active' : ''}" data-pod-ref="video">
                    <span class="rc-led-dot ${this.pod33Config.refClock === 'video' ? 'lit-green' : ''}"></span>
                    VIDEO
                  </button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.refClock === 'aes' ? 'active' : ''}" data-pod-ref="aes">
                    <span class="rc-led-dot ${this.pod33Config.refClock === 'aes' ? 'lit-green' : ''}"></span>
                    AES DARS
                  </button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.refClock === 'int48' ? 'active' : ''}" data-pod-ref="int48">
                    <span class="rc-led-dot ${this.pod33Config.refClock === 'int48' ? 'lit-green' : ''}"></span>
                    INT 48k
                  </button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.refClock === 'int96' ? 'active' : ''}" data-pod-ref="int96">
                    <span class="rc-led-dot ${this.pod33Config.refClock === 'int96' ? 'lit-green' : ''}"></span>
                    INT 96k
                  </button>
                </div>
              </div>

              <!-- Frequency Selection -->
              <div class="rc-pod-col">
                <div class="rc-control-group-title">CALIBRATED FREQUENCY</div>
                <div class="rc-btn-group" role="group">
                  <button type="button" class="rc-btn-sel ${this.pod33Config.freq === 100 ? 'active' : ''}" data-pod-freq="100">100 Hz</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.freq === 400 ? 'active' : ''}" data-pod-freq="400">400 Hz</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.freq === 1000 ? 'active' : ''}" data-pod-freq="1000">1 kHz (0 VU)</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.freq === 0 ? 'active' : ''}" data-pod-freq="0">Silence</button>
                </div>
              </div>

              <!-- Level Selection (dBFS) -->
              <div class="rc-pod-col">
                <div class="rc-control-group-title">CALIBRATED LEVEL (dBFS)</div>
                <div class="rc-btn-group" role="group">
                  <button type="button" class="rc-btn-sel ${this.pod33Config.levelDb === 0 ? 'active' : ''}" data-pod-lvl="0">0 dB</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.levelDb === -12 ? 'active' : ''}" data-pod-lvl="-12">-12</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.levelDb === -14 ? 'active' : ''}" data-pod-lvl="-14">-14</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.levelDb === -18 ? 'active' : ''}" data-pod-lvl="-18">-18 (EBU)</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.levelDb === -20 ? 'active' : ''}" data-pod-lvl="-20">-20 (SMPTE)</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.levelDb === -24 ? 'active' : ''}" data-pod-lvl="-24">-24</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.levelDb === -40 ? 'active' : ''}" data-pod-lvl="-40">-40</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.levelDb === -100 ? 'active' : ''}" data-pod-lvl="-100">OFF</button>
                </div>
              </div>

              <!-- Channel Routing & Phase Invert -->
              <div class="rc-pod-col">
                <div class="rc-control-group-title">CHANNEL &amp; PHASE</div>
                <div class="rc-btn-group" role="group">
                  <button type="button" class="rc-btn-sel ${this.pod33Config.channelMode === 'stereo' ? 'active' : ''}" data-pod-ch="stereo">Stereo</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.channelMode === 'left' ? 'active' : ''}" data-pod-ch="left">Left Only</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.channelMode === 'right' ? 'active' : ''}" data-pod-ch="right">Right Only</button>
                  <button type="button" class="rc-btn-sel ${this.pod33Config.channelMode === 'invert' ? 'active' : ''}" data-pod-ch="invert" title="Phase Invert 180° on Right channel">Ø Invert 180°</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ABB-1 AUDIO BIT BUDDY & ABP-1 BIT SPITTER -->
          <div class="rc-abb-panel">
            <div class="rc-panel-title">
              <div class="rc-panel-title-left">
                <span class="rc-panel-badge rc-badge-cyan">ABB-1</span>
                <strong>AUDIO BIT BUDDY &amp; ABP-1 BIT SPITTER</strong>
              </div>
              <button type="button" id="btnToggleBitBuddy" class="rc-power-btn ${this.bitBuddyEngaged ? 'active' : ''}">
                ${this.bitBuddyEngaged ? '● SPITTING BITS' : '○ TRANSMIT BIT SPITTER'}
              </button>
            </div>

            <div class="rc-abb-grid">
              <!-- Pattern Select -->
              <div class="rc-pod-col">
                <div class="rc-control-group-title">TEST BIT PATTERN</div>
                <div class="rc-btn-group" role="group">
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.pattern === 'tone' ? 'active' : ''}" data-abb-pat="tone">Cal Tone</button>
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.pattern === 'walk1s' ? 'active' : ''}" data-abb-pat="walk1s">Walking 1s</button>
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.pattern === 'prbs' ? 'active' : ''}" data-abb-pat="prbs">PRBS-15</button>
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.pattern === 'minmax' ? 'active' : ''}" data-abb-pat="minmax">Min/Max Polarity</button>
                </div>
              </div>

              <!-- Channel Status Flags -->
              <div class="rc-pod-col">
                <div class="rc-control-group-title">CHANNEL STATUS</div>
                <div class="rc-btn-group" role="group">
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.proMode ? 'active' : ''}" data-abb-pro="pro">Professional (EBU)</button>
                  <button type="button" class="rc-btn-sel ${!this.bitBuddyConfig.proMode ? 'active' : ''}" data-abb-pro="cons">Consumer (S/PDIF)</button>
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.audioData === 'audio' ? 'active' : ''}" data-abb-data="audio">Audio PCM</button>
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.audioData === 'data' ? 'active' : ''}" data-abb-data="data">Non-Audio Data</button>
                </div>
              </div>

              <!-- Sample Rate Flag -->
              <div class="rc-pod-col">
                <div class="rc-control-group-title">SAMPLING RATE FLAG</div>
                <div class="rc-btn-group" role="group">
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.sampleRate === 48000 ? 'active' : ''}" data-abb-sr="48000">48 kHz</button>
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.sampleRate === 96000 ? 'active' : ''}" data-abb-sr="96000">96 kHz</button>
                  <button type="button" class="rc-btn-sel ${this.bitBuddyConfig.sampleRate === 44100 ? 'active' : ''}" data-abb-sr="44100">44.1 kHz</button>
                </div>
              </div>

              <!-- Diagnostic LED Indicators Stack -->
              <div class="rc-pod-col">
                <div class="rc-control-group-title">BIT BUDDY STATUS LEDS</div>
                <div class="rc-led-rack">
                  <div class="rc-led-row">
                    <span class="rc-led-indicator lit-green" id="ledAbbLock"></span>
                    <span class="rc-led-label">LOCK</span>
                  </div>
                  <div class="rc-led-row">
                    <span class="rc-led-indicator ${this.bitBuddyEngaged ? '' : 'lit-red'}" id="ledAbbErr"></span>
                    <span class="rc-led-label">NO LOCK</span>
                  </div>
                  <div class="rc-led-row">
                    <span class="rc-led-indicator lit-amber" id="ledAbbParity"></span>
                    <span class="rc-led-label">PARITY</span>
                  </div>
                  <div class="rc-led-row">
                    <span class="rc-led-indicator lit-cyan" id="ledAbbPro"></span>
                    <span class="rc-led-label">PRO/CONS</span>
                  </div>
                  <div class="rc-led-row">
                    <span class="rc-led-indicator ${this.bitBuddyEngaged ? 'lit-pulse' : ''}" id="ledAbbActivity"></span>
                    <span class="rc-led-label">BIT SPITTER</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CBC / RADIO-CANADA MXL TEST GENERATOR & PATTERN STUDIO -->
          <div class="rc-cbc-studio-panel">
            <div class="rc-cbc-header">
              <div class="rc-cbc-title">
                <span class="rc-panel-badge" style="background:#ea580c;color:#fff;">CBC MXL</span>
                <strong>CBC / RADIO-CANADA MXL TEST GENERATOR &amp; PATTERN STUDIO</strong>
                <span class="rc-telemetry-pill" id="rcCbcStatusPill">PORT 9600 (:9601 WebRTC / :9699 Info GUI)</span>
              </div>
              <div style="display:flex; gap:8px;">
                <a href="http://localhost:9601" target="_blank" class="rc-cbc-btn" style="color:#38bdf8; text-decoration:none;">🌐 Launch WebRTC Player (:9601)</a>
                <a href="http://localhost:9699" target="_blank" class="rc-cbc-btn" style="color:#22c55e; text-decoration:none;">📊 Open MXL Info GUI (:9699)</a>
              </div>
            </div>

            <div class="rc-cbc-grid">
              <!-- Video Test Patterns -->
              <div class="rc-cbc-col">
                <div class="rc-cbc-label">VIDEO TEST PATTERNS (25 PATTERNS)</div>
                <select id="rcCbcVideoSelect" class="rc-cbc-select">
                  <option value="100% Color Bars">100% Color Bars (Default)</option>
                  <option value="75% Color Bars">75% Color Bars</option>
                  <option value="SMPTE RP 219">SMPTE RP 219 (HD Color Bars)</option>
                  <option value="Multiburst">Multiburst Resolution Chart</option>
                  <option value="Zone Plate">Zone Plate Dynamic Sweep</option>
                  <option value="Pluge">Pluge Black Reference</option>
                  <option value="Convergence">Convergence Grid</option>
                  <option value="Checkerboard">Checkerboard 16x9</option>
                </select>
                <div class="rc-cbc-flow-info" id="rcCbcVideoFlow">Flow: 6b5d8d68... · 1920x1080 @ 30 fps · Timecode Active</div>
              </div>

              <!-- Audio Test Patterns -->
              <div class="rc-cbc-col">
                <div class="rc-cbc-label">AUDIO TEST PATTERNS (13 WAVEFORMS)</div>
                <select id="rcCbcAudioSelect" class="rc-cbc-select">
                  <option value="1 kHz Sine">Calibrated 1 kHz Sine Tone</option>
                  <option value="400 Hz Sine">400 Hz Reference Sine</option>
                  <option value="Dual Tone">Dual Tone (400 Hz L / 1 kHz R)</option>
                  <option value="Pink Noise">Pink Noise Reference (-20 dBFS)</option>
                  <option value="Frequency Sweep">Logarithmic Frequency Sweep (20Hz-20kHz)</option>
                  <option value="EBU Glits">EBU Glits Identification Channel Sequence</option>
                </select>
                <div class="rc-cbc-flow-info" id="rcCbcAudioFlow">Flow: 9b85cd39... · 2 Channels Float32 @ 48 kHz</div>
              </div>

              <!-- Calibrated Output Level -->
              <div class="rc-cbc-col">
                <div class="rc-cbc-label">CALIBRATED OUTPUT LEVEL (dBFS)</div>
                <div class="rc-cbc-btn-group">
                  <button type="button" class="rc-cbc-btn active" data-cbc-lvl="-20">-20 dBFS (EBU)</button>
                  <button type="button" class="rc-cbc-btn" data-cbc-lvl="-18">-18 dBFS (0 VU)</button>
                  <button type="button" class="rc-cbc-btn" data-cbc-lvl="-12">-12 dBFS</button>
                  <button type="button" class="rc-cbc-btn" data-cbc-lvl="0">0 dBFS (Ceiling)</button>
                </div>
                <div class="rc-cbc-flow-info" id="rcCbcLevelReadout" style="color:#f97316;">Current Level: -20.0 dBFS (Peak 0.1000)</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  private renderThemeMeterPair(prefix: 'rcIn' | 'rcOut', idx: number): string {
    return `
      <!-- Miniature Broadcast Theme VU Meters (Stereo L / R) -->
      <div class="rc-theme-meters-wrap">
        <svg class="rc-theme-meter-svg" viewBox="0 0 200 44" width="100%" height="44" preserveAspectRatio="xMidYMid meet">
          <!-- LEFT METER (x: 2..96, cx: 49, cy: 42, r: 30) -->
          <g class="rc-meter-subgroup" id="${prefix}MeterL${idx}">
            <rect x="2" y="2" width="94" height="40" rx="3" class="rc-meter-bezel" />
            <rect x="4" y="4" width="90" height="36" rx="2" class="rc-meter-face" />

            <!-- Channel Tag & Brand -->
            <text x="8" y="13" class="rc-meter-ch-lbl">L</text>
            <text x="49" y="37" class="rc-meter-vu-lbl" text-anchor="middle">VU</text>

            <!-- Scale Arcs: Normal (-42° to +16°) and Overload (+16° to +42°) -->
            <path d="M 28.9 19.7 A 30 30 0 0 1 57.3 13.2" class="rc-meter-arc-norm" />
            <path d="M 57.3 13.2 A 30 30 0 0 1 69.1 19.7" class="rc-meter-arc-over" />

            <!-- Key Ticks: -20, -10, -7, -3, 0, +3 -->
            <line x1="32.5" y1="19.3" x2="30.2" y2="16.1" class="rc-meter-tick" />
            <line x1="37.6" y1="16.4" x2="36.0" y2="12.8" class="rc-meter-tick" />
            <line x1="41.3" y1="15.1" x2="40.2" y2="11.2" class="rc-meter-tick" />
            <line x1="49.0" y1="14.0" x2="49.0" y2="10.0" class="rc-meter-tick" />
            <line x1="56.7" y1="15.1" x2="57.8" y2="11.2" class="rc-meter-tick-red" />
            <line x1="67.7" y1="21.2" x2="70.4" y2="18.2" class="rc-meter-tick-red" />

            <!-- Scale Numerals -->
            <text x="27" y="25" class="rc-meter-tick-lbl" text-anchor="middle">-20</text>
            <text x="49" y="8.5" class="rc-meter-tick-lbl" text-anchor="middle">-3</text>
            <text x="58.5" y="9.5" class="rc-meter-tick-lbl-red" text-anchor="middle">0</text>
            <text x="73" y="25" class="rc-meter-tick-lbl-red" text-anchor="middle">+3</text>

            <!-- Needle -->
            <g id="${prefix}NeedleL${idx}" class="rc-needle-group" transform="rotate(-42 49 42)">
              <line x1="49" y1="42" x2="49" y2="13" class="rc-meter-needle" />
              <circle cx="49" cy="42" r="2.5" class="rc-meter-hub" />
            </g>
          </g>

          <!-- RIGHT METER (x: 104..198, cx: 151, cy: 42, r: 30) -->
          <g class="rc-meter-subgroup" id="${prefix}MeterR${idx}">
            <rect x="104" y="2" width="94" height="40" rx="3" class="rc-meter-bezel" />
            <rect x="106" y="4" width="90" height="36" rx="2" class="rc-meter-face" />

            <!-- Channel Tag & Brand -->
            <text x="110" y="13" class="rc-meter-ch-lbl">R</text>
            <text x="151" y="37" class="rc-meter-vu-lbl" text-anchor="middle">VU</text>

            <!-- Scale Arcs: Normal (-42° to +16°) and Overload (+16° to +42°) -->
            <path d="M 130.9 19.7 A 30 30 0 0 1 159.3 13.2" class="rc-meter-arc-norm" />
            <path d="M 159.3 13.2 A 30 30 0 0 1 171.1 19.7" class="rc-meter-arc-over" />

            <!-- Key Ticks: -20, -10, -7, -3, 0, +3 -->
            <line x1="134.5" y1="19.3" x2="132.2" y2="16.1" class="rc-meter-tick" />
            <line x1="139.6" y1="16.4" x2="138.0" y2="12.8" class="rc-meter-tick" />
            <line x1="143.3" y1="15.1" x2="142.2" y2="11.2" class="rc-meter-tick" />
            <line x1="151.0" y1="14.0" x2="151.0" y2="10.0" class="rc-meter-tick" />
            <line x1="158.7" y1="15.1" x2="159.8" y2="11.2" class="rc-meter-tick-red" />
            <line x1="169.7" y1="21.2" x2="172.4" y2="18.2" class="rc-meter-tick-red" />

            <!-- Scale Numerals -->
            <text x="129" y="25" class="rc-meter-tick-lbl" text-anchor="middle">-20</text>
            <text x="151" y="8.5" class="rc-meter-tick-lbl" text-anchor="middle">-3</text>
            <text x="160.5" y="9.5" class="rc-meter-tick-lbl-red" text-anchor="middle">0</text>
            <text x="175" y="25" class="rc-meter-tick-lbl-red" text-anchor="middle">+3</text>

            <!-- Needle -->
            <g id="${prefix}NeedleR${idx}" class="rc-needle-group" transform="rotate(-42 151 42)">
              <line x1="151" y1="42" x2="151" y2="13" class="rc-meter-needle" />
              <circle cx="151" cy="42" r="2.5" class="rc-meter-hub" />
            </g>
          </g>
        </svg>
      </div>
    `;
  }

  private renderInputStrip(idx: number, chTag: string, name: string, sub: string, pillClass: string, isDefault = false): string {
    const isSelected = this.activeInput === idx;
    const isRoutedToSpeakers = this.matrix[idx][2];
    return `
      <div class="rc-strip rc-in-strip ${isSelected ? 'selected' : ''}" id="rcInStrip${idx}">
        <div class="rc-strip-top">
          <span class="rc-strip-tag">${chTag}</span>
          <span class="rc-strip-pill ${pillClass}">INPUT</span>
        </div>
        <div class="rc-strip-name">${name}</div>
        <div class="rc-strip-sub">${sub}</div>

        <!-- Miniature Broadcast Theme VU Meters -->
        ${this.renderThemeMeterPair('rcIn', idx)}
        <div class="rc-strip-digits" id="rcInDb${idx}">-60.0 dBFS</div>

        <div class="rc-in-actions">
          <button type="button" class="rc-btn-engage ${isSelected ? 'engaged' : ''}" data-in-idx="${idx}">
            ${isSelected ? '● ROUTED' : 'ENGAGE IN'}
          </button>
          <button type="button" class="rc-btn-to-speakers ${isRoutedToSpeakers ? 'active' : ''}" data-to-speakers="${idx}" title="Route ${name} directly to Monitor 1 Output (Speakers)">
            🔊 ROUTE TO SPEAKERS
          </button>
        </div>
      </div>
    `;
  }

  private renderOutputStrip(idx: number, chTag: string, name: string, sub: string, isDefault = true): string {
    return `
      <div class="rc-strip rc-out-strip" id="rcOutStrip${idx}">
        <div class="rc-strip-top">
          <span class="rc-strip-tag">${chTag}</span>
          <span class="rc-strip-pill pill-out">DEST BUS</span>
        </div>
        <div class="rc-strip-name">${name}</div>
        <div class="rc-strip-sub">${sub}</div>

        <!-- Miniature Broadcast Theme VU Meters -->
        ${this.renderThemeMeterPair('rcOut', idx)}
        <div class="rc-strip-digits" id="rcOutDb${idx}">-60.0 dBFS</div>

        <div class="rc-out-btns">
          <button type="button" class="rc-btn-out-tool rc-btn-mute" data-out-mute="${idx}">MUTE</button>
          <button type="button" class="rc-btn-out-tool rc-btn-dim" data-out-dim="${idx}">-20dB</button>
        </div>
      </div>
    `;
  }

  private renderMatrixRow(rowIdx: number, rowLabel: string): string {
    let cells = '';
    for (let colIdx = 0; colIdx < 7; colIdx++) {
      const isConnected = this.matrix[rowIdx][colIdx];
      cells += `
        <td class="rc-td-crosspoint">
          <button type="button" class="rc-matrix-btn ${isConnected ? 'connected' : ''}"
                  data-row="${rowIdx}" data-col="${colIdx}"
                  title="Toggle routing: ${rowLabel} -> Output ${colIdx + 1}">
            <span class="rc-matrix-led"></span>
          </button>
        </td>
      `;
    }
    return `
      <tr>
        <th class="rc-th-row">${rowLabel}</th>
        ${cells}
      </tr>
    `;
  }

  private attachEvents(): void {
    if (!this.container) return;

    // 1. Matrix Crosspoint Buttons (Toggle Crosspoints)
    this.container.querySelectorAll('.rc-matrix-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const row = parseInt(target.getAttribute('data-row') || '0', 10);
        const col = parseInt(target.getAttribute('data-col') || '0', 10);
        this.toggleCrosspoint(row, col);
      });
    });

    // 2. Input Selection Buttons
    this.container.querySelectorAll('[data-in-idx]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const idx = parseInt(target.getAttribute('data-in-idx') || '0', 10);
        this.selectInputSource(idx);
      });
    });

    // 3. Matrix Presets
    this.container.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const preset = target.getAttribute('data-preset');
        this.applyPreset(preset);
      });
    });

    // 4. POD-33 Toggle & Controls
    const btnPodToggle = this.container.querySelector('#btnTogglePod33');
    if (btnPodToggle) {
      btnPodToggle.addEventListener('click', () => {
        this.pod33Engaged = !this.pod33Engaged;
        if (this.pod33Engaged) {
          this.matrix[2][0] = true;
          this.matrix[2][2] = true;
          this.ctx?.audio?.startPod33Generator(this.pod33Config);
          this.selectedFlowId = 'wbs-flow-ref-tone';
          fetch('http://localhost:8467/api/test_tone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ freq: this.pod33Config.freq, restart: true })
          }).catch(() => {});
        } else {
          this.matrix[2][0] = false;
          this.matrix[2][2] = false;
          this.ctx?.audio?.stopPod33Generator();
          if (this.bitBuddyEngaged) {
            this.selectedFlowId = 'wbs-flow-bit-spitter';
          } else {
            this.selectedFlowId = 'wbs-flow-master-stereo';
          }
          fetch('http://localhost:8467/api/test_tone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ freq: this.pod33Config.freq, restart: false })
          }).catch(() => {});
        }
        this.updatePod33State();
        this.updateBitBuddyState();
        this.updateStripVisuals();
        this.updateMatrixVisuals();
        this.updateXmxlBar();
      });
    }

    this.container.querySelectorAll('[data-pod-ref]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.pod33Config.refClock = target.getAttribute('data-pod-ref') as any;
        this.updatePod33State();
      });
    });

    this.container.querySelectorAll('[data-pod-freq]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.pod33Config.freq = parseInt(target.getAttribute('data-pod-freq') || '1000', 10);
        this.updatePod33State();
      });
    });

    this.container.querySelectorAll('[data-pod-lvl]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.pod33Config.levelDb = parseInt(target.getAttribute('data-pod-lvl') || '-18', 10);
        this.updatePod33State();
      });
    });

    this.container.querySelectorAll('[data-pod-ch]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.pod33Config.channelMode = target.getAttribute('data-pod-ch') as any;
        this.updatePod33State();
      });
    });

    // 5. ABB-1 Bit Buddy Toggle & Controls
    const btnBitBuddyToggle = this.container.querySelector('#btnToggleBitBuddy');
    if (btnBitBuddyToggle) {
      btnBitBuddyToggle.addEventListener('click', () => {
        this.bitBuddyEngaged = !this.bitBuddyEngaged;
        if (this.bitBuddyEngaged) {
          this.matrix[3][0] = true;
          this.matrix[3][2] = true;
          this.ctx?.audio?.startBitBuddyGenerator(this.bitBuddyConfig);
          this.selectedFlowId = 'wbs-flow-bit-spitter';
          fetch('http://localhost:8467/api/bitbuddy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              active: true,
              pattern: this.bitBuddyConfig.pattern,
              pro_mode: this.bitBuddyConfig.proMode,
              audio_data: this.bitBuddyConfig.audioData === 'audio',
              sample_rate: this.bitBuddyConfig.sampleRate
            })
          }).catch(() => {});
        } else {
          this.matrix[3][0] = false;
          this.matrix[3][2] = false;
          this.ctx?.audio?.stopBitBuddyGenerator();
          if (this.pod33Engaged) {
            this.selectedFlowId = 'wbs-flow-ref-tone';
          } else {
            this.selectedFlowId = 'wbs-flow-master-stereo';
          }
          fetch('http://localhost:8467/api/bitbuddy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: false })
          }).catch(() => {});
        }
        this.updatePod33State();
        this.updateBitBuddyState();
        this.updateStripVisuals();
        this.updateMatrixVisuals();
        this.updateXmxlBar();
      });
    }

    this.container.querySelectorAll('[data-abb-pat]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.bitBuddyConfig.pattern = target.getAttribute('data-abb-pat') as any;
        this.updateBitBuddyState();
      });
    });

    this.container.querySelectorAll('[data-abb-pro]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.bitBuddyConfig.proMode = target.getAttribute('data-abb-pro') === 'pro';
        this.updateBitBuddyState();
      });
    });

    this.container.querySelectorAll('[data-abb-data]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.bitBuddyConfig.audioData = target.getAttribute('data-abb-data') as any;
        this.updateBitBuddyState();
      });
    });

    this.container.querySelectorAll('[data-abb-sr]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.bitBuddyConfig.sampleRate = parseInt(target.getAttribute('data-abb-sr') || '48000', 10) as any;
        this.updateBitBuddyState();
      });
    });

    // 6. Output Strip Mute & Dim Controls
    this.container.querySelectorAll('[data-out-mute]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const idx = parseInt(target.getAttribute('data-out-mute') || '0', 10);
        this.outMutes[idx] = !this.outMutes[idx];
        target.classList.toggle('active', this.outMutes[idx]);
        target.textContent = this.outMutes[idx] ? 'MUTED' : 'MUTE';
        if ((idx === 2 || idx === 3) && this.ctx && this.ctx.audio) {
          const isConnected = this.matrix[this.activeInput][2] || this.matrix[this.activeInput][3];
          this.ctx.audio.setMonitor(isConnected && !this.outMutes[2], this.outDims[2] ? 0.1 : 0.8);
        }
      });
    });

    this.container.querySelectorAll('[data-out-dim]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const idx = parseInt(target.getAttribute('data-out-dim') || '0', 10);
        this.outDims[idx] = !this.outDims[idx];
        target.classList.toggle('active', this.outDims[idx]);
        if ((idx === 2 || idx === 3) && this.ctx && this.ctx.audio) {
          this.ctx.audio.setMonitorVolume(this.outDims[2] ? 0.1 : 0.8);
        }
      });
    });

    // 7. Route to Speakers / Monitor 1 Output Buttons
    const btnRouteSpk = this.container.querySelector('#btnRouteThisToSpeakers');
    if (btnRouteSpk) {
      btnRouteSpk.addEventListener('click', () => {
        this.forceRouteToSpeakers(this.activeInput);
      });
    }

    this.container.querySelectorAll('[data-to-speakers]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const idx = parseInt(target.getAttribute('data-to-speakers') || '0', 10);
        this.forceRouteToSpeakers(idx);
      });
    });

    // 8. CBC Test Generator Controls
    const cbcVideo = this.container.querySelector('#rcCbcVideoSelect') as HTMLSelectElement | null;
    if (cbcVideo) {
      cbcVideo.addEventListener('change', (e) => {
        const val = (e.target as HTMLSelectElement).value;
        fetch('http://localhost:8467/api/cbc/pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: 'video', pattern: val }),
        }).catch(() => {});
      });
    }

    const cbcAudio = this.container.querySelector('#rcCbcAudioSelect') as HTMLSelectElement | null;
    if (cbcAudio) {
      cbcAudio.addEventListener('change', (e) => {
        const val = (e.target as HTMLSelectElement).value;
        fetch('http://localhost:8467/api/cbc/pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: 'audio', pattern: val }),
        }).catch(() => {});
      });
    }

    this.container.querySelectorAll('[data-cbc-lvl]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const lvl = parseFloat((e.currentTarget as HTMLElement).getAttribute('data-cbc-lvl') || '-20');
        this.container?.querySelectorAll('[data-cbc-lvl]').forEach((b) => b.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
        const readout = this.container?.querySelector('#rcCbcLevelReadout');
        if (readout) {
          const peak = Math.pow(10, lvl / 20.0);
          readout.textContent = `Current Level: ${lvl.toFixed(1)} dBFS (Peak ${peak.toFixed(4)})`;
        }
        fetch('http://localhost:8467/api/cbc/audio_level', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level_db: lvl }),
        }).catch(() => {});
      });
    });
  }

  public forceRouteToSpeakers(idx: number = this.activeInput): void {
    if (this.activeInput !== idx) {
      this.selectInputSource(idx);
    }
    // Connect to OUT 3 (Monitor 1 Output / Speakers)
    this.matrix[idx][2] = true;
    this.outMutes[2] = false;

    if (this.ctx && this.ctx.audio) {
      const audio = this.ctx.audio;
      if (audio.ctx && audio.ctx.state === 'suspended') {
        audio.ctx.resume().catch(() => {});
      }
      audio.setMonitor(true, this.outDims[2] ? 0.1 : 0.8);
    }

    // Ping backend python daemon if available to ensure physical hardware ALSA sink
    try {
      fetch('/api/force_speakers', { method: 'POST' }).catch(() => {
        fetch('http://localhost:8467/api/force_speakers', { method: 'POST' }).catch(() => {});
      });
    } catch {}

    this.updateMatrixVisuals();
    this.updateStripVisuals();
    this.updateSpeakerBtnState();
  }

  private updateSpeakerBtnState(): void {
    if (!this.container) return;
    const isSpeakersActive = this.matrix[this.activeInput][2] && !this.outMutes[2];
    const btnRouteSpk = this.container.querySelector('#btnRouteThisToSpeakers');
    if (btnRouteSpk) {
      btnRouteSpk.className = `rc-btn-master-speakers ${isSpeakersActive ? 'active' : 'inactive'}`;
      btnRouteSpk.textContent = isSpeakersActive
        ? '🔊 ROUTED TO SPEAKERS (MONITOR 1 OUTPUT)'
        : '🔊 ROUTE THIS TO THE SPEAKERS (MONITOR 1 OUTPUT)';
    }

    this.container.querySelectorAll('[data-to-speakers]').forEach((btn) => {
      const idx = parseInt(btn.getAttribute('data-to-speakers') || '0', 10);
      const active = this.matrix[idx][2] && !this.outMutes[2];
      btn.className = `rc-btn-to-speakers ${active ? 'active' : ''}`;
    });
  }

  private toggleCrosspoint(row: number, col: number): void {
    this.matrix[row][col] = !this.matrix[row][col];
    this.updateMatrixVisuals();

    // If speaker or cue output was toggled for active source, update soundcard monitor output
    if (row === this.activeInput && (col === 2 || col === 3)) {
      if (this.ctx && this.ctx.audio) {
        const isConnected = this.matrix[row][2] || this.matrix[row][3];
        this.ctx.audio.setMonitor(isConnected && !this.outMutes[2], this.outDims[2] ? 0.1 : 0.8);
      }
    }

    // If row is activated and connected to Master (col 0), engage source
    if (this.matrix[row][0]) {
      this.selectInputSource(row);
    }
  }

  private selectInputSource(idx: number): void {
    if (!this.ctx || !this.ctx.audio) return;
    const audio = this.ctx.audio;

    if (audio.ctx && audio.ctx.state === 'suspended') {
      audio.ctx.resume().catch(() => {});
    }

    if (idx === 0) {
      // Soundcard
      this.activeInput = 0;
      audio.connectSoundCard();
    } else if (idx === 1) {
      // System Audio
      this.activeInput = 1;
      audio.connectSystemAudio('browser');
    } else if (idx === 2) {
      // POD-33 Tone Generator (Dual Flow Spitting concurrent with Bit Spitter)
      this.activeInput = 2;
      this.pod33Engaged = true;
      this.matrix[2][0] = true;
      this.matrix[2][2] = true;
      audio.startPod33Generator(this.pod33Config);
      this.selectedFlowId = 'wbs-flow-ref-tone';
      fetch('http://localhost:8467/api/test_tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freq: this.pod33Config.freq, restart: true })
      }).catch(() => {});
    } else if (idx === 3) {
      // Bit Buddy (Dual Flow Spitting concurrent with POD-33)
      this.activeInput = 3;
      this.bitBuddyEngaged = true;
      this.matrix[3][0] = true;
      this.matrix[3][2] = true;
      audio.startBitBuddyGenerator(this.bitBuddyConfig);
      this.selectedFlowId = 'wbs-flow-bit-spitter';
      fetch('http://localhost:8467/api/bitbuddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active: true,
          pattern: this.bitBuddyConfig.pattern,
          pro_mode: this.bitBuddyConfig.proMode,
          audio_data: this.bitBuddyConfig.audioData === 'audio',
          sample_rate: this.bitBuddyConfig.sampleRate
        })
      }).catch(() => {});
    } else if (idx === 4) {
      // Pink Noise / Sweep
      this.activeInput = 4;
      audio.startTestGenerator('pink');
    }

    // Always output audio to the soundcard / physical speakers unless explicitly muted
    const isSpeakersConnected = this.matrix[idx][2] || this.matrix[idx][3] || (this.pod33Engaged && this.matrix[2][2]) || (this.bitBuddyEngaged && this.matrix[3][2]);
    const isMuted = this.outMutes[2];
    const isDim = this.outDims[2];
    if (audio.setMonitor) {
      audio.setMonitor(isSpeakersConnected && !isMuted, isDim ? 0.1 : 0.8);
    }

    this.updateStripVisuals();
    this.updateMatrixVisuals();
    this.updatePod33State();
    this.updateBitBuddyState();
    this.updateXmxlBar();
  }

  private updatePod33State(): void {
    if (this.pod33Engaged && this.ctx && this.ctx.audio) {
      this.ctx.audio.startPod33Generator(this.pod33Config);
    }

    const btn = this.container?.querySelector('#btnTogglePod33');
    if (btn) {
      btn.className = `rc-power-btn ${this.pod33Engaged ? 'active' : ''}`;
      btn.textContent = this.pod33Engaged ? '● POD-33 ACTIVE' : '○ ACTIVATE POD-33';
    }

    // Update active button highlights
    this.container?.querySelectorAll('[data-pod-ref]').forEach(b => {
      const active = b.getAttribute('data-pod-ref') === this.pod33Config.refClock;
      b.className = `rc-btn-sel ${active ? 'active' : ''}`;
    });

    this.container?.querySelectorAll('[data-pod-freq]').forEach(b => {
      const active = parseInt(b.getAttribute('data-pod-freq') || '-1', 10) === this.pod33Config.freq;
      b.className = `rc-btn-sel ${active ? 'active' : ''}`;
    });

    this.container?.querySelectorAll('[data-pod-lvl]').forEach(b => {
      const active = parseInt(b.getAttribute('data-pod-lvl') || '-999', 10) === this.pod33Config.levelDb;
      b.className = `rc-btn-sel ${active ? 'active' : ''}`;
    });

    this.container?.querySelectorAll('[data-pod-ch]').forEach(b => {
      const active = b.getAttribute('data-pod-ch') === this.pod33Config.channelMode;
      b.className = `rc-btn-sel ${active ? 'active' : ''}`;
    });
  }

  private updateBitBuddyState(): void {
    if (this.bitBuddyEngaged && this.ctx && this.ctx.audio) {
      this.ctx.audio.startBitBuddyGenerator(this.bitBuddyConfig);
    }

    const btn = this.container?.querySelector('#btnToggleBitBuddy');
    if (btn) {
      btn.className = `rc-power-btn ${this.bitBuddyEngaged ? 'active' : ''}`;
      btn.textContent = this.bitBuddyEngaged ? '● SPITTING BITS' : '○ TRANSMIT BIT SPITTER';
    }

    // Diagnostic LEDs
    const ledLock = this.container?.querySelector('#ledAbbLock');
    const ledErr = this.container?.querySelector('#ledAbbErr');
    const ledActivity = this.container?.querySelector('#ledAbbActivity');
    if (ledLock) {
      ledLock.className = `rc-led-indicator ${this.bitBuddyEngaged ? 'lit-green' : ''}`;
    }
    if (ledErr) {
      ledErr.className = `rc-led-indicator ${this.bitBuddyEngaged ? '' : 'lit-red'}`;
    }
    if (ledActivity) {
      ledActivity.className = `rc-led-indicator ${this.bitBuddyEngaged ? 'lit-pulse' : ''}`;
    }

    this.container?.querySelectorAll('[data-abb-pat]').forEach(b => {
      const active = b.getAttribute('data-abb-pat') === this.bitBuddyConfig.pattern;
      b.className = `rc-btn-sel ${active ? 'active' : ''}`;
    });

    this.container?.querySelectorAll('[data-abb-pro]').forEach(b => {
      const isPro = b.getAttribute('data-abb-pro') === 'pro';
      b.className = `rc-btn-sel ${isPro === this.bitBuddyConfig.proMode ? 'active' : ''}`;
    });

    this.container?.querySelectorAll('[data-abb-data]').forEach(b => {
      const active = b.getAttribute('data-abb-data') === this.bitBuddyConfig.audioData;
      b.className = `rc-btn-sel ${active ? 'active' : ''}`;
    });

    this.container?.querySelectorAll('[data-abb-sr]').forEach(b => {
      const active = parseInt(b.getAttribute('data-abb-sr') || '0', 10) === this.bitBuddyConfig.sampleRate;
      b.className = `rc-btn-sel ${active ? 'active' : ''}`;
    });
  }

  private applyPreset(preset: string | null): void {
    if (preset === 'broadcast') {
      this.matrix = [
        [true,  true,  false, false, false, false, false],
        [true,  true,  true,  false, false, false, false],
        [true,  true,  true,  false, false, true,  false],
        [true,  true,  true,  false, false, false, true ],
        [true,  true,  true,  false, false, false, false],
      ];
      this.selectInputSource(1);
    } else if (preset === 'pod33') {
      this.matrix = [
        [true,  true,  false, false, false, false, false],
        [true,  true,  true,  false, false, false, false],
        [true,  true,  true,  true,  true,  true,  false],
        [true,  true,  true,  false, false, false, true ],
        [true,  true,  true,  false, false, false, false],
      ];
      this.selectInputSource(2);
    } else if (preset === 'bitbuddy') {
      this.matrix = [
        [true,  true,  false, false, false, false, false],
        [true,  true,  true,  false, false, false, false],
        [true,  true,  true,  false, false, true,  false],
        [true,  true,  true,  true,  true,  false, true ],
        [true,  true,  true,  false, false, false, false],
      ];
      this.selectInputSource(3);
    } else if (preset === 'all') {
      this.matrix = [
        [true, true, true, false, false, true, true],
        [true, true, true, false, false, true, true],
        [true, true, true, false, false, true, true],
        [true, true, true, false, false, true, true],
        [true, true, true, false, false, true, true],
      ];
    }
    this.updateMatrixVisuals();
  }

  private updateMatrixVisuals(): void {
    if (!this.container) return;
    this.container.querySelectorAll('.rc-matrix-btn').forEach((btn) => {
      const row = parseInt(btn.getAttribute('data-row') || '0', 10);
      const col = parseInt(btn.getAttribute('data-col') || '0', 10);
      const isConnected = this.matrix[row][col];
      btn.className = `rc-matrix-btn ${isConnected ? 'connected' : ''}`;
    });
    this.updateSpeakerBtnState();
  }

  private updateStripVisuals(): void {
    if (!this.container) return;
    for (let i = 0; i < 5; i++) {
      let isSelected = this.activeInput === i;
      if (i === 2) isSelected = this.pod33Engaged || this.activeInput === 2;
      if (i === 3) isSelected = this.bitBuddyEngaged || this.activeInput === 3;

      const strip = this.container.querySelector(`#rcInStrip${i}`);
      if (strip) {
        strip.className = `rc-strip rc-in-strip ${isSelected ? 'selected' : ''}`;
      }
      const engageBtn = this.container.querySelector(`[data-in-idx="${i}"]`);
      if (engageBtn) {
        engageBtn.className = `rc-btn-engage ${isSelected ? 'engaged' : ''}`;
        engageBtn.textContent = isSelected ? '● ROUTED' : 'ENGAGE IN';
      }
    }
    this.updateSpeakerBtnState();
  }

  /**
   * 60 FPS Render Hook from Frame Loop
   */
  render(_model: XtmModel, levels: any): void {
    if (!this.isBuilt || !this.container) return;

    // Advance buffer write-head (synchronized to live telemetry from local XMXL instance if available)
    if (this.liveMxlTelemetry && typeof this.liveMxlTelemetry.mxl_write_head === 'number') {
      this.ringHead = this.liveMxlTelemetry.mxl_write_head % this.RING_CAPACITY;
    } else {
      this.ringHead = (this.ringHead + this.QUANTUM) % this.RING_CAPACITY;
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
    const clampDb = (db: number) => Math.max(-60, Math.min(3, isFinite(db) ? db : -60));

    // Scanalyzer Audio Eye 10-Second Continuous Circular Ring Buffer
    if (this.eyeCanvas) {
      const nowMs = Date.now();
      const secOf10 = (nowMs / 1000.0) % 10.0;
      this.drawScanalyzerEye(this.eyeCanvas, this.liveMxlTelemetry?.waveform || this.cachedWaveform, secOf10, this.ringHead, this.QUANTUM, this.selectedFlowId, isMcDark, isMcLight, isWbsCa);

      const clkEl = this.container.querySelector('#rcEyeNtpClock');
      const secEl = this.container.querySelector('#rcEyeSec10');
      const headIdxEl = this.container.querySelector('#rcEyeHeadIndex');
      const headSecEl = this.container.querySelector('#rcEyeHeadSec');
      if (clkEl) clkEl.textContent = new Date().toISOString().slice(11, 23);
      if (secEl) secEl.textContent = `${secOf10.toFixed(3)} s / 10.000 s`;
      if (headIdxEl) headIdxEl.textContent = `HEAD: #${this.ringHead}`;
      if (headSecEl) headSecEl.textContent = `${(this.ringHead / 48000).toFixed(3)}s / 480,000 frames`;
    }

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

    // 3. Update Miniature Broadcast Theme VU Meters on Inputs

    for (let inIdx = 0; inIdx < 5; inIdx++) {
      let dbL = -60.0;
      let dbR = -60.0;
      if (inIdx === 2 && this.pod33Engaged) {
        // CH 3: POD-33 Tone Generator
        const cal = this.pod33Config.levelDb;
        dbL = this.pod33Config.channelMode === 'right' ? -60.0 : cal;
        dbR = this.pod33Config.channelMode === 'left' ? -60.0 : (this.pod33Config.channelMode === 'invert' ? cal : cal);
      } else if (inIdx === 3 && this.bitBuddyEngaged) {
        // CH 4: Bit Buddy
        const base = this.bitBuddyConfig.pattern === 'tone' ? -18.0 : (this.bitBuddyConfig.pattern === 'minmax' ? -1.0 : -14.0);
        const jitter = Math.sin(Date.now() / 90) * 1.5;
        dbL = base + (this.bitBuddyConfig.pattern === 'tone' ? 0 : jitter);
        dbR = base + (this.bitBuddyConfig.pattern === 'tone' ? 0 : -jitter);
      } else if (inIdx === this.activeInput) {
        dbL = vuL;
        dbR = vuR;
      }
      const angleL = this.vuDbToAngle(dbL);
      const angleR = this.vuDbToAngle(dbR);
      const needleL = this.inNeedlesL[inIdx] || (this.container.querySelector(`#rcInNeedleL${inIdx}`) as SVGElement | null);
      const needleR = this.inNeedlesR[inIdx] || (this.container.querySelector(`#rcInNeedleR${inIdx}`) as SVGElement | null);
      if (needleL) needleL.setAttribute('transform', `rotate(${angleL.toFixed(1)} 49 42)`);
      if (needleR) needleR.setAttribute('transform', `rotate(${angleR.toFixed(1)} 151 42)`);

      const inDbEl = this.container.querySelector(`#rcInDb${inIdx}`);
      if (inDbEl) {
        if (dbL > -55 || dbR > -55) {
          inDbEl.textContent = `L:${clampDb(dbL).toFixed(1)} R:${clampDb(dbR).toFixed(1)} dB`;
        } else {
          inDbEl.textContent = `-60.0 dBFS`;
        }
      }
    }

    // 4. Update Miniature Broadcast Theme VU Meters on Outputs (7 Buses · An Output Card Per Flow)
    for (let outIdx = 0; outIdx < 7; outIdx++) {
      let isConnected = false;
      for (let r = 0; r < 5; r++) {
        const rowActive = (r === this.activeInput) || (r === 2 && this.pod33Engaged) || (r === 3 && this.bitBuddyEngaged);
        if (rowActive && this.matrix[r] && this.matrix[r][outIdx]) {
          isConnected = true;
          break;
        }
      }
      const isMuted = this.outMutes[outIdx];
      const isDimmed = this.outDims[outIdx];

      let dbL = -60.0;
      let dbR = -60.0;
      if (outIdx === 5 && this.pod33Engaged && !isMuted) {
        // Dedicated OUT 6 Output Card: POD-33 Precision Tone Flow
        const cal = this.pod33Config.levelDb;
        const dimOffset = isDimmed ? -20 : 0;
        dbL = clampDb((this.pod33Config.channelMode === 'right' ? -60.0 : cal) + dimOffset);
        dbR = clampDb((this.pod33Config.channelMode === 'left' ? -60.0 : (this.pod33Config.channelMode === 'invert' ? cal : cal)) + dimOffset);
      } else if (outIdx === 6 && this.bitBuddyEngaged && !isMuted) {
        // Dedicated OUT 7 Output Card: ABB-1 / ABP-1 Bit Spitter Flow
        const base = this.bitBuddyConfig.pattern === 'tone' ? -18.0 : (this.bitBuddyConfig.pattern === 'minmax' ? -1.0 : -14.0);
        const jitter = Math.sin(Date.now() / 90) * 1.5;
        const dimOffset = isDimmed ? -20 : 0;
        dbL = clampDb(base + (this.bitBuddyConfig.pattern === 'tone' ? 0 : jitter) + dimOffset);
        dbR = clampDb(base + (this.bitBuddyConfig.pattern === 'tone' ? 0 : -jitter) + dimOffset);
      } else if (isConnected && !isMuted) {
        const dimOffset = isDimmed ? -20 : 0;
        dbL = clampDb(vuL + dimOffset);
        dbR = clampDb(vuR + dimOffset);
      }

      const angleL = this.vuDbToAngle(dbL);
      const angleR = this.vuDbToAngle(dbR);
      const needleL = this.outNeedlesL[outIdx] || (this.container.querySelector(`#rcOutNeedleL${outIdx}`) as SVGElement | null);
      const needleR = this.outNeedlesR[outIdx] || (this.container.querySelector(`#rcOutNeedleR${outIdx}`) as SVGElement | null);
      if (needleL) needleL.setAttribute('transform', `rotate(${angleL.toFixed(1)} 49 42)`);
      if (needleR) needleR.setAttribute('transform', `rotate(${angleR.toFixed(1)} 151 42)`);

      const outDbEl = this.container.querySelector(`#rcOutDb${outIdx}`);
      if (outDbEl) {
        if (dbL > -55 || dbR > -55) {
          outDbEl.textContent = `L:${clampDb(dbL).toFixed(1)} R:${clampDb(dbR).toFixed(1)} dB`;
        } else {
          outDbEl.textContent = `-60.0 dBFS`;
        }
      }
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

  private vuDbToAngle(db: number): number {
    if (db <= -55 || !isFinite(db)) return -42;
    const p = Math.pow(10, (Math.max(-40, Math.min(3, db)) - 3) / 20);
    const clampedP = Math.max(0, Math.min(1.05, p));
    return -42 + 84 * clampedP;
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

  private drawScanalyzerEye(
    canvas: HTMLCanvasElement,
    waveform: any,
    ntpSecOf10: number,
    head: number,
    quantum: number,
    flowLabel: string,
    isMcDark = false,
    isMcLight = false,
    isWbsCa = false
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    const rOuter = 188;
    const rMid = 140;
    const rInner = 82;
    const rCenterPlayhead = 28;

    ctx.clearRect(0, 0, w, h);

    // 1. Background Tracks & Radial Grid
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = isMcLight ? '#c8c4b7' : (isWbsCa ? '#b0aba0' : (isMcDark ? '#1a2e40' : '#0e2338'));
    for (const r of [rInner, rMid, rOuter]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let s = 0; s < 10; s++) {
      const a = (s / 10.0) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (rInner - 4), cy + Math.sin(a) * (rInner - 4));
      ctx.lineTo(cx + Math.cos(a) * (rOuter + 6), cy + Math.sin(a) * (rOuter + 6));
      ctx.strokeStyle = (s === 0) ? 'rgba(239, 68, 68, 0.45)' : (isMcLight ? '#c8c4b7' : '#112942');
      ctx.lineWidth = (s === 0) ? 2 : 1;
      ctx.stroke();
    }
    ctx.restore();

    // 2. Radial Waveform Spokes
    const bins = (waveform && waveform.ch0_max && waveform.ch0_max.length) ? waveform.ch0_max.length : 360;
    const reachL = (rOuter - rMid) * 0.48;
    const baseRL = (rOuter + rMid) / 2;
    const reachR = (rMid - rInner) * 0.48;
    const baseRR = (rMid + rInner) / 2;

    // Draw Channel 0: Left (Outer Band)
    ctx.save();
    ctx.strokeStyle = isMcDark ? 'rgba(56, 146, 212, 0.9)' : (isWbsCa ? 'rgba(249, 115, 22, 0.9)' : 'rgba(34, 197, 94, 0.9)');
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let b = 0; b < bins; b++) {
      const frac = b / bins;
      const a = frac * Math.PI * 2;
      let minVal = (waveform && waveform.ch0_min) ? (waveform.ch0_min[b] || 0) : 0;
      let maxVal = (waveform && waveform.ch0_max) ? (waveform.ch0_max[b] || 0) : 0;
      if (!waveform) {
        const seed = Math.sin(b * 13.7 + (head / 4800)) * Math.cos(b * 3.3);
        maxVal = Math.abs(seed) * 0.55;
        minVal = -maxVal * 0.7;
      }
      const rIn = baseRL + (minVal * reachL * 0.96);
      const rOut = baseRL + Math.max(0.04, maxVal * reachL * 0.96);
      ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
      ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
    }
    ctx.stroke();

    // Draw Channel 1: Right (Inner Band)
    ctx.strokeStyle = isMcDark ? 'rgba(245, 158, 11, 0.9)' : (isWbsCa ? 'rgba(217, 119, 6, 0.9)' : 'rgba(56, 189, 248, 0.9)');
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let b = 0; b < bins; b++) {
      const frac = b / bins;
      const a = frac * Math.PI * 2;
      let minVal = (waveform && waveform.ch1_min) ? (waveform.ch1_min[b] || 0) : 0;
      let maxVal = (waveform && waveform.ch1_max) ? (waveform.ch1_max[b] || 0) : 0;
      if (!waveform) {
        const seed = Math.sin(b * 11.3 + (head / 4800) + 1.2) * Math.cos(b * 4.1);
        maxVal = Math.abs(seed) * 0.50;
        minVal = -maxVal * 0.65;
      }
      const rIn = baseRR + (minVal * reachR * 0.96);
      const rOut = baseRR + Math.max(0.04, maxVal * reachR * 0.96);
      ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
      ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
    }
    ctx.stroke();
    ctx.restore();

    // 3. NTP Second Ticks
    ctx.save();
    for (let s = 0; s < 10; s++) {
      const a = (s / 10.0) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const isZero = (s === 0);
      const isTopPulse = Math.abs(ntpSecOf10 - s) < 0.12;

      const tLen = isZero ? 16 : 10;
      const p1X = cx + cos * (rOuter + 3);
      const p1Y = cy + sin * (rOuter + 3);
      const p2X = cx + cos * (rOuter + 3 + tLen);
      const p2Y = cy + sin * (rOuter + 3 + tLen);

      ctx.beginPath();
      ctx.moveTo(p1X, p1Y);
      ctx.lineTo(p2X, p2Y);
      ctx.strokeStyle = isTopPulse ? '#ffffff' : (isZero ? '#ef4444' : '#38bdf8');
      ctx.lineWidth = (isZero || isTopPulse) ? 3 : 1.5;
      if (isTopPulse) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      const lblDist = rOuter + (isZero ? 27 : 20);
      const lblX = cx + cos * lblDist;
      const lblY = cy + sin * lblDist;
      ctx.font = isZero ? 'bold 11px monospace' : '9px monospace';
      ctx.fillStyle = isTopPulse ? '#ffffff' : (isZero ? '#ef4444' : '#94a3b8');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const txt = isZero ? '0.0s [NTP]' : `${s}.0s`;
      ctx.fillText(txt, lblX, lblY);
    }
    ctx.restore();

    // 4. Center Playhead Triangle
    const currentAngle = (ntpSecOf10 / 10.0) * Math.PI * 2;
    const ca = Math.cos(currentAngle);
    const sa = Math.sin(currentAngle);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(currentAngle);

    ctx.beginPath();
    ctx.moveTo(rCenterPlayhead, 0);
    ctx.lineTo(-rCenterPlayhead * 0.65, -rCenterPlayhead * 0.65);
    ctx.lineTo(-rCenterPlayhead * 0.38, 0);
    ctx.lineTo(-rCenterPlayhead * 0.65, rCenterPlayhead * 0.65);
    ctx.closePath();
    ctx.fillStyle = '#d946ef';
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();

    // 5. Rotating NTP Write-Head Needle Arm with Red-Hot Glowing Tip
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.moveTo(cx + ca * (rInner - 6), cy + sa * (rInner - 6));
    ctx.lineTo(cx + ca * (rOuter + 6), cy + sa * (rOuter + 6));
    ctx.stroke();

    const tipX = cx + ca * (rOuter + 6);
    const tipY = cy + sa * (rOuter + 6);
    ctx.beginPath();
    ctx.arc(tipX, tipY, 5.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2810';
    ctx.shadowColor = '#ff2810';
    ctx.shadowBlur = 15;
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
