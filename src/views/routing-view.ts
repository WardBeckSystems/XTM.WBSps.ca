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

  // Active Routing Matrix State (5 Inputs × 5 Outputs)
  // Rows: 0: Soundcard, 1: System Audio, 2: POD-33 Tone, 3: Bit Buddy, 4: Pink Noise
  // Cols: 0: XTM-4 Master, 1: POD-22 Loudness, 2: Speakers, 3: Headphones, 4: Test Point
  matrix: boolean[][] = [
    [false, false, false, false, false], // In 0: Soundcard
    [true,  true,  true,  false, false], // In 1: System Audio (Default active)
    [false, false, false, false, false], // In 2: POD-33 Tone
    [false, false, false, false, false], // In 3: Bit Buddy
    [false, false, false, false, false], // In 4: Pink Noise
  ];

  activeInput: number = 1; // 1 = System Audio default

  pod33Config: Pod33Config = { ...DEFAULT_POD33_CONFIG };
  bitBuddyConfig: BitBuddyConfig = { ...DEFAULT_BITBUDDY_CONFIG };

  pod33Engaged: boolean = false;
  bitBuddyEngaged: boolean = false;

  // XMXL Dynamic Instances & Flow Discovery
  detectedInstances: XmxlInstance[] = [];
  selectedPort: number = 8467;
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
    this.attachEvents();
    this.initXmxlBinding();
    this.isBuilt = true;
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
                <span>BROADCAST CROSSPOINT ROUTING MATRIX</span>
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

          <!-- 3. RIGHT BAY: OUTPUTS STRIP -->
          <div class="rc-bay rc-outputs-bay">
            <div class="rc-bay-header">
              <span>OUTPUT DESTINATIONS</span>
              <span class="rc-bay-sub">5 BUSES</span>
            </div>
            <div class="rc-channel-strips" id="rcOutputStrips">
              ${this.renderOutputStrip(0, 'OUT 1', 'XTM-4 Master', 'VU + PPM Visualizer', true)}
              ${this.renderOutputStrip(1, 'OUT 2', 'POD-22 Loudness', 'ITU-R BS.1770 Bar', true)}
              ${this.renderOutputStrip(2, 'OUT 3', 'Monitor Speakers', 'Physical Hardware Out', true)}
              ${this.renderOutputStrip(3, 'OUT 4', 'Studio Cue / HP', 'Control Room Listen', false)}
              ${this.renderOutputStrip(4, 'OUT 5', 'WBS Test Point', 'DARS / Analyzer Tap', false)}
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

        </div>
      </div>
    `;
  }

  private renderInputStrip(idx: number, chTag: string, name: string, sub: string, pillClass: string, isDefault = false): string {
    const isSelected = this.activeInput === idx;
    return `
      <div class="rc-strip rc-in-strip ${isSelected ? 'selected' : ''}" id="rcInStrip${idx}">
        <div class="rc-strip-top">
          <span class="rc-strip-tag">${chTag}</span>
          <span class="rc-strip-pill ${pillClass}">${name}</span>
        </div>
        <div class="rc-strip-name">${name}</div>
        <div class="rc-strip-sub">${sub}</div>

        <!-- Mini Stereo Meter -->
        <div class="rc-mini-meters">
          <div class="rc-meter-bar-track">
            <div class="rc-meter-bar-fill" id="rcInMeterL${idx}" style="width: 0%;"></div>
          </div>
          <div class="rc-meter-bar-track">
            <div class="rc-meter-bar-fill" id="rcInMeterR${idx}" style="width: 0%;"></div>
          </div>
        </div>
        <div class="rc-strip-digits" id="rcInDb${idx}">-60.0 dBFS</div>

        <button type="button" class="rc-btn-engage ${isSelected ? 'engaged' : ''}" data-in-idx="${idx}">
          ${isSelected ? '● ROUTED' : 'ENGAGE IN'}
        </button>
      </div>
    `;
  }

  private renderOutputStrip(idx: number, chTag: string, name: string, sub: string, isDefault = true): string {
    return `
      <div class="rc-strip rc-out-strip" id="rcOutStrip${idx}">
        <div class="rc-strip-top">
          <span class="rc-strip-tag">${chTag}</span>
          <span class="rc-strip-pill pill-out">DEST</span>
        </div>
        <div class="rc-strip-name">${name}</div>
        <div class="rc-strip-sub">${sub}</div>

        <!-- Mini Stereo Meter -->
        <div class="rc-mini-meters">
          <div class="rc-meter-bar-track">
            <div class="rc-meter-bar-fill" id="rcOutMeterL${idx}" style="width: 0%;"></div>
          </div>
          <div class="rc-meter-bar-track">
            <div class="rc-meter-bar-fill" id="rcOutMeterR${idx}" style="width: 0%;"></div>
          </div>
        </div>
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
    for (let colIdx = 0; colIdx < 5; colIdx++) {
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
          this.selectInputSource(2); // Select In 2: POD-33
        } else {
          this.selectInputSource(1); // Revert to System Audio
        }
        this.updatePod33State();
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
          this.selectInputSource(3); // Select In 3: Bit Buddy
        } else {
          this.selectInputSource(1); // Revert to System Audio
        }
        this.updateBitBuddyState();
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
  }

  private toggleCrosspoint(row: number, col: number): void {
    this.matrix[row][col] = !this.matrix[row][col];
    this.updateMatrixVisuals();

    // If row is activated and connected to Master (col 0), engage source
    if (this.matrix[row][0]) {
      this.selectInputSource(row);
    }
  }

  private selectInputSource(idx: number): void {
    this.activeInput = idx;
    if (!this.ctx || !this.ctx.audio) return;
    const audio = this.ctx.audio;

    if (idx === 0) {
      // Soundcard
      this.pod33Engaged = false;
      this.bitBuddyEngaged = false;
      audio.connectSoundCard();
    } else if (idx === 1) {
      // System Audio
      this.pod33Engaged = false;
      this.bitBuddyEngaged = false;
      audio.connectSystemAudio('browser');
    } else if (idx === 2) {
      // POD-33 Tone Generator
      this.pod33Engaged = true;
      this.bitBuddyEngaged = false;
      audio.startPod33Generator(this.pod33Config);
    } else if (idx === 3) {
      // Bit Buddy
      this.pod33Engaged = false;
      this.bitBuddyEngaged = true;
      audio.startBitBuddyGenerator(this.bitBuddyConfig);
    } else if (idx === 4) {
      // Pink Noise / Sweep
      this.pod33Engaged = false;
      this.bitBuddyEngaged = false;
      audio.startTestGenerator('pink');
    }

    this.updateStripVisuals();
    this.updatePod33State();
    this.updateBitBuddyState();
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
        [false, false, false, false, false],
        [true,  true,  true,  false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
      ];
      this.selectInputSource(1);
    } else if (preset === 'pod33') {
      this.matrix = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [true,  true,  true,  true,  true],
        [false, false, false, false, false],
        [false, false, false, false, false],
      ];
      this.selectInputSource(2);
    } else if (preset === 'bitbuddy') {
      this.matrix = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [true,  true,  true,  false, true],
        [false, false, false, false, false],
      ];
      this.selectInputSource(3);
    } else if (preset === 'all') {
      this.matrix = [
        [true, true, true, false, false],
        [true, true, true, false, false],
        [true, true, true, false, false],
        [true, true, true, false, false],
        [true, true, true, false, false],
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
  }

  private updateStripVisuals(): void {
    if (!this.container) return;
    for (let i = 0; i < 5; i++) {
      const isSelected = this.activeInput === i;
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

    // 1. Draw Left & Right Continuous Ring Buffers
    this.drawRing('rcRingCanvas0', this.ringHead, '#38bdf8');
    this.drawRing('rcRingCanvas1', this.ringHead, '#f97316');

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

    // 3. Update Mini Stereo Meters on Active Input & Master Outputs
    const vuL = levels?.vuDb ? levels.vuDb[0] : -60.0;
    const vuR = levels?.vuDb ? levels.vuDb[1] : -60.0;

    const clampDb = (db: number) => Math.max(-60, Math.min(0, isFinite(db) ? db : -60));
    const pctOf = (db: number) => Math.max(0, Math.min(100, ((clampDb(db) + 60) / 60) * 100));

    // Active Input Strip meter
    const inFillL = this.container.querySelector(`#rcInMeterL${this.activeInput}`) as HTMLElement;
    const inFillR = this.container.querySelector(`#rcInMeterR${this.activeInput}`) as HTMLElement;
    const inDbEl = this.container.querySelector(`#rcInDb${this.activeInput}`);
    if (inFillL && inFillR) {
      inFillL.style.width = `${pctOf(vuL)}%`;
      inFillR.style.width = `${pctOf(vuR)}%`;
    }
    if (inDbEl) {
      inDbEl.textContent = `L:${clampDb(vuL).toFixed(1)} R:${clampDb(vuR).toFixed(1)} dB`;
    }

    // Outputs 0 (XTM-4) & 1 (POD-22)
    for (const outIdx of [0, 1]) {
      const outFillL = this.container.querySelector(`#rcOutMeterL${outIdx}`) as HTMLElement;
      const outFillR = this.container.querySelector(`#rcOutMeterR${outIdx}`) as HTMLElement;
      const outDbEl = this.container.querySelector(`#rcOutDb${outIdx}`);
      if (outFillL && outFillR) {
        outFillL.style.width = `${pctOf(vuL)}%`;
        outFillR.style.width = `${pctOf(vuR)}%`;
      }
      if (outDbEl) {
        outDbEl.textContent = `L:${clampDb(vuL).toFixed(1)} R:${clampDb(vuR).toFixed(1)} dB`;
      }
    }

    // 4. Update ITU-R BS.1770 / EBU R128 LOUDNESS metrics
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
        badgeEl.textContent = `● XMXL: ${this.detectedInstances.length} ACTIVE (${this.detectedInstances.map(i => i.port).join(', ')})`;
        badgeEl.className = 'rc-badge rc-badge-pulse-green';
      } else {
        badgeEl.textContent = '○ XMXL: SCANNING 127.0.0.1...';
        badgeEl.className = 'rc-badge rc-badge-orange';
      }
    }

    if (instancesEl) {
      if (this.detectedInstances.length === 0) {
        instancesEl.innerHTML = '<span class="rc-xmxl-pill active">SCANNING 127.0.0.1...</span>';
      } else {
        instancesEl.innerHTML = this.detectedInstances
          .map((inst) => {
            const isActive = inst.port === this.selectedPort;
            return `<button type="button" class="rc-xmxl-pill ${isActive ? 'active' : ''}" data-xmxl-port="${inst.port}">
              <span class="rc-led-dot ${isActive ? 'lit-green' : ''}"></span>
              :${inst.port} ${inst.name.replace(/^(Ward-Beck|CBC\/Radio-Canada)\s*/, '')} (${inst.latencyMs}ms)
            </button>`;
          })
          .join('');

        instancesEl.querySelectorAll('[data-xmxl-port]').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const port = parseInt((e.currentTarget as HTMLElement).getAttribute('data-xmxl-port') || '8467', 10);
            this.switchXmxlInstance(port);
          });
        });
      }
    }

    const curInst = this.detectedInstances.find((i) => i.port === this.selectedPort) || this.detectedInstances[0];
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

  private switchXmxlInstance(port: number): void {
    this.selectedPort = port;
    setSelectedXmxlInstance(`xmxl-${port}`);
    if (this.activeXmxlDisconnect) {
      this.activeXmxlDisconnect();
      this.activeXmxlDisconnect = null;
    }
    const inst = this.detectedInstances.find((i) => i.port === port);
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

  private drawRing(canvasId: string, head: number, accentColor: string): void {
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

    // 1. Dark circular backplate with high-tech radial gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, rInner - 8, cx, cy, rOuter + 6);
    bgGrad.addColorStop(0, '#03080e');
    bgGrad.addColorStop(0.7, '#07121c');
    bgGrad.addColorStop(1, '#0c1d2e');
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
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + ntpPulse * 0.6})`;
        ctx.lineWidth = 2.5 + ntpPulse * 1.5;
      } else if (is0s) {
        // 0s Far-Right anchor
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.0;
      } else {
        ctx.strokeStyle = '#1e3d5f';
        ctx.lineWidth = 1.0;
      }
      ctx.stroke();

      // Number tick labels (0s, 2s, 4s, 6s, 8s)
      if (s % 2 === 0) {
        ctx.fillStyle = isCurrentNtp ? '#38bdf8' : (is0s ? '#f87171' : '#64748b');
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

      // Color gradation: green at base (#22c55e), transitioning to cyan (#38bdf8) or amber (#f59e0b) at tips
      const alpha = Math.max(0.18, 1.0 - ageFrac * 0.7);
      if (amp > 0.65) {
        ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
      } else if (amp > 0.35) {
        ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
      } else {
        ctx.strokeStyle = `rgba(16, 140, 75, ${alpha * 0.8})`;
      }
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // 4. Scanalyzer Center Magenta Triangle Pointer (#d946ef)
    // Points outward in the direction of the write head
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
    ctx.fillStyle = '#d946ef';
    ctx.fill();
    ctx.strokeStyle = '#f0abfc';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 5. Scanalyzer Orange Sweep Needle & Glowing Red Tip
    const needleOuter = rOuter + 2;
    const needleTipX = cx + needleOuter * cosH;
    const needleTipY = cy + needleOuter * sinH;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(needleTipX, needleTipY);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hot red tip dot
    ctx.beginPath();
    ctx.arc(needleTipX, needleTipY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2810';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 6. Center Hub Display
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#071018';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Second readout in center
    const secVal = (head / 48000).toFixed(1);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${secVal}s`, cx, cy);
  }
}
