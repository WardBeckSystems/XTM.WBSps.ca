/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM Precision Audio & Ballistics Engine
 * Handles sound card inputs, system output capture, test generator,
 * high-pass filtering, electromechanical VU ballistics, PPM peak dynamics,
 * and stereo phase cross-correlation.
 */

import type { MeterFrameTelemetry } from '../types/telemetry';
import { WasmDspEngine, type WasmDspResult } from '../dsp/wasm-dsp';
import { VU_BALLISTICS_LIBRARY, type VuBallisticPreset } from './ballistics-library';

export interface VuCoeffConfig {
  f0: number;
  zeta: number;
}

export interface VuStateChannel {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  p: number;
}

export interface PpmStateChannel {
  env: number;
  q: number;
  qv: number;
}

export interface PhaseCorrelationState {
  sL2: number;
  sR2: number;
  sLR: number;
  correlation: number;
  led: number;
}

export interface BiquadState {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface LufsState {
  stage1: [BiquadState, BiquadState];
  stage2: [BiquadState, BiquadState];
  meanSquareM_L: number;
  meanSquareM_R: number;
  meanSquareS_L: number;
  meanSquareS_R: number;
  sumEnergy: number;
  blockCount: number;
  shortTermHist: number[];
}

export interface CurrentLevelsState {
  vu: [number, number];
  ppm: [number, number];
  vuDb: [number, number];
  ppmDb: [number, number];
  dbfs: [number, number, number, number];
  lufs: {
    m: number;
    s: number;
    i: number;
    lra: number;
    mL: number;
    mR: number;
  };
  rmsDb: [number, number];
  phaseCorrelation: number;
  phaseLed: number;
  peak: [boolean, boolean];
  hasAudio: boolean;
}

export class XtmAudioEngine {
  ctx: AudioContext | null = null;
  sourceNode: MediaStreamAudioSourceNode | AudioNode | null = null;
  stream: MediaStream | null = null;
  isSystemAudio: boolean = false;
  activeDeviceId: string | null = null;
  sourceType: 'none' | 'mic' | 'system' | 'test' = 'none';

  inputGainNode: GainNode | null = null;
  inputTrimDb: number = 0;
  hpfNode: BiquadFilterNode | null = null;
  hpfEnabled: boolean = false;

  monitorGainNode: GainNode | null = null;
  monitorEnabled: boolean = false;
  monitorVolume: number = 0.7;

  splitterNode: ChannelSplitterNode | null = null;
  processorNode: AudioWorkletNode | ScriptProcessorNode | null = null;

  testOsc: OscillatorNode | AudioBufferSourceNode | null = null;
  testGain: GainNode | null = null;
  testType: string = 'none';
  toneCalDb: number = 0;
  sweepTimer: any = null;

  vuStyle: 'simpson' | 'sifam' = 'simpson';
  vuBallisticPreset: string = 'standard_vu';
  vuCoeffs: Record<string, VuCoeffConfig>;
  vuState: [VuStateChannel, VuStateChannel];

  ppmAttack: number = 0.010;
  ppmType: 1 | 2 = 2; // 1 = DIN 45406 Type I, 2 = BBC BS 4297 Type II
  ppmBallisticPreset: string = 'type2';
  ppmDecayDbPerSec: number = 24 / 2.8;
  peakSensTrim: number = 0.0;
  ppmState: [PpmStateChannel, PpmStateChannel];

  phaseAlpha: number = 0.001;
  phaseState: PhaseCorrelationState;

  refLevelDb: number = 4;
  isRefDigital: boolean = false;
  domain: 'analog' | 'digital' = 'analog';

  lufsState: LufsState;
  currentLevels: CurrentLevelsState;

  onStatusChange: ((status: any) => void) | null = null;
  onDevicesChange: ((devices: MediaDeviceInfo[], activeId?: string | null) => void) | null = null;

  workletLoaded: boolean = false;
  vuB0: number = 0;
  vuB1: number = 0;
  vuB2: number = 0;
  vuA1: number = 0;
  vuA2: number = 0;
  ppmAttCoeff: number = 0;
  ppmDecCoeff: number = 0;

  kShelf_b0: number = 0;
  kShelf_b1: number = 0;
  kShelf_b2: number = 0;
  kShelf_a1: number = 0;
  kShelf_a2: number = 0;

  kHp_b0: number = 0;
  kHp_b1: number = 0;
  kHp_b2: number = 0;
  kHp_a1: number = 0;
  kHp_a2: number = 0;

  lufsAlphaM: number = 0;
  lufsAlphaS: number = 0;

  wasmDsp: WasmDspEngine = new WasmDspEngine();
  wasmResult: WasmDspResult = {
    vuL: 0,
    vuR: 0,
    ppmDbL: -120,
    ppmDbR: -120,
    ppmFracL: 0,
    ppmFracR: 0,
    dbfsA: -120,
    dbfsB: -120,
    dbfsSum: -120,
    dbfsDiff: -120,
    lufsM: -70,
    lufsS: -70,
    lufsML: -70,
    lufsMR: -70,
    blockEnergy: 0,
    phaseCorr: 1.0,
    hasAudio: false,
    peakA: false,
    peakB: false
  };

  constructor() {
    this.ctx = null;
    this.sourceNode = null;
    this.stream = null;
    this.isSystemAudio = false;
    this.activeDeviceId = null;
    this.sourceType = 'none'; // 'mic', 'system', 'test'

    // Gain & Filtering
    this.inputGainNode = null;
    this.inputTrimDb = 0; // -24 to +24 dB
    this.hpfNode = null;
    this.hpfEnabled = false;

    // Monitor / Listen Through
    this.monitorGainNode = null;
    this.monitorEnabled = false;
    this.monitorVolume = 0.7;

    // Splitter & Analyser / Processor
    this.splitterNode = null;
    this.processorNode = null;

    // Test Generator
    this.testOsc = null;
    this.testGain = null;
    this.testType = 'none'; // 'sine1k', 'sine400', 'pink', 'sweep'
    this.toneCalDb = -18;   // Default: -18 dBFS (0 VU Reference Alignment)
    this.sweepTimer = null;

    // Physics parameters for VU (ANSI C16.5-1942 electromechanical 2nd-order ODE)
    // 300ms attack / 300ms release, 1.0-1.5% overshoot
    this.vuStyle = 'simpson'; // 'simpson' or 'sifam'
    this.vuCoeffs = {
      simpson: { f0: 2.16, zeta: 0.815 },
      sifam: { f0: 2.40, zeta: 0.850 }
    };
    this.vuState = [
      { x1: 0, x2: 0, y1: 0, y2: 0, p: 0 }, // Ch A (Left)
      { x1: 0, x2: 0, y1: 0, y2: 0, p: 0 }  // Ch B (Right)
    ];

    // Physics parameters for PPM (IEC 60268-10 Type IIb Nordic / BBC)
    this.ppmAttack = 0.005; // 5ms attack
    this.ppmDecayDbPerSec = 24 / 2.8; // 24 dB in 2.8s
    this.peakSensTrim = 0.0; // Calibrated 0 dB nominal reference alignment
    this.ppmState = [
      { env: 0, q: -0.12, qv: 0 },
      { env: 0, q: -0.12, qv: 0 }
    ];

    // Phase Correlation state (Pearson normalized, 300ms integration)
    this.phaseAlpha = 0.001;
    this.phaseState = { sL2: 0, sR2: 0, sLR: 0, correlation: 1.0, led: 7 };

    // Reference Calibration Level
    this.refLevelDb = 4; // +4 dBu default
    this.isRefDigital = false;
    this.domain = 'analog'; // 'analog' (+4 dBu = 0 VU) or 'digital' (-20 dBFS = 0 VU)

    // ITU-R BS.1770 / EBU R128 Loudness State
    this.lufsState = {
      stage1: [{ x1: 0, x2: 0, y1: 0, y2: 0 }, { x1: 0, x2: 0, y1: 0, y2: 0 }],
      stage2: [{ x1: 0, x2: 0, y1: 0, y2: 0 }, { x1: 0, x2: 0, y1: 0, y2: 0 }],
      meanSquareM_L: 0,
      meanSquareM_R: 0,
      meanSquareS_L: 0,
      meanSquareS_R: 0,
      sumEnergy: 0,
      blockCount: 0,
      shortTermHist: []
    };

    // Current Metering Output (queried by visualizer on animation frame)
    this.currentLevels = {
      vu: [0, 0],       // Deflection fraction: 0.708 = 0 VU, 1.0 = +3 VU
      ppm: [-0.12, -0.12], // Normalized scale: 0 = -12 dB, 1.0 = +12 dB
      vuDb: [-Infinity, -Infinity],
      ppmDb: [-Infinity, -Infinity],
      dbfs: [-60, -60, -60, -60],
      lufs: {
        m: -60,
        s: -60,
        i: -60,
        lra: 0,
        mL: -60,
        mR: -60
      },
      rmsDb: [-60, -60],
      phaseCorrelation: 1.0,
      phaseLed: -1,     // 0..7
      peak: [false, false],
      hasAudio: false
    };

    // Listeners for device changes & status
    this.onStatusChange = null;
    this.onDevicesChange = null;
  }

  /**
   * Initializes or resumes the AudioContext
   */
  async ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
    }
    // Return early if suspended so the caller can handle user gesture
    if (this.ctx.state === 'suspended') {
      return this.ctx;
    }
    
    this.calculateCoefficients();
    await this.initWorklet();
    await this.wasmDsp.load();
    if (this.ctx && this.wasmDsp.ready) {
      this.wasmDsp.init(this.ctx.sampleRate, this.refLevelDb, this.peakSensTrim);
      // Re-apply the reference WITH its digital/analog flag. Without it a digital
      // -18 dBFS reference was re-read as analog dBu after every source change,
      // adding ~22 dB of gain and pinning the needles until SENS was touched.
      this.wasmDsp.setRefLevel(this.refLevelDb, this.isRefDigital);
      this.wasmDsp.setPeakTrim(this.peakSensTrim);
    }
    return this.ctx;
  }

  /**
   * Loads the AudioWorklet module for modern, low-latency audio-thread metering
   */
  async initWorklet() {
    if (this.workletLoaded || !this.ctx || !this.ctx.audioWorklet) return;
    try {
      try {
        await this.ctx.audioWorklet.addModule('./meter-processor.js');
      } catch {
        try {
          await this.ctx.audioWorklet.addModule('meter-processor.js');
        } catch {
          await this.ctx.audioWorklet.addModule('js/meter-processor.js');
        }
      }
      this.workletLoaded = true;
    } catch (_) {
      try {
        const workletCode = `class WbsMeterProcessor extends AudioWorkletProcessor{constructor(){super();this.bufSize=1024;this.bufL=new Float32Array(this.bufSize);this.bufR=new Float32Array(this.bufSize);this.idx=0;}process(inputs){const input=inputs[0];if(input&&input.length>0){const ch0=input[0];const ch1=input.length>1?input[1]:ch0;const len=ch0.length;for(let i=0;i<len;i++){this.bufL[this.idx]=ch0[i];this.bufR[this.idx]=ch1[i];this.idx++;if(this.idx>=this.bufSize){this.port.postMessage({ch0:this.bufL.slice(),ch1:this.bufR.slice()});this.idx=0;}}}return true;}}registerProcessor("wbs-meter-processor",WbsMeterProcessor);`;
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        await this.ctx.audioWorklet.addModule(blobUrl);
        URL.revokeObjectURL(blobUrl);
        this.workletLoaded = true;
      } catch (err) {
        this.workletLoaded = false;
      }
    }
  }

  /**
   * Calculates ballistic biquad coefficients for the VU movement
   */
  calculateCoefficients() {
    if (!this.ctx) return;
    const fs = this.ctx.sampleRate;
    const dt = 1.0 / fs;
    const K = 2.0 / dt;
    const cfg = this.vuCoeffs[this.vuStyle] || { f0: 2.16, zeta: 0.815 };
    const w0 = 2.0 * Math.PI * cfg.f0;
    const a0 = K * K + 2.0 * cfg.zeta * w0 * K + w0 * w0;

    this.vuB0 = (w0 * w0) / a0;
    this.vuB1 = (2.0 * w0 * w0) / a0;
    this.vuB2 = this.vuB0;
    this.vuA1 = (2.0 * (w0 * w0 - K * K)) / a0;
    this.vuA2 = (K * K - 2.0 * cfg.zeta * w0 * K + w0 * w0) / a0;

    // PPM coefficients (10ms attack, Type I or Type II release)
    this.ppmAttack = 0.010;
    this.ppmAttCoeff = 1.0 - Math.exp(-1.0 / (this.ppmAttack * fs));
    const tauDecay = (this.ppmType === 1)
      ? (1.5 / Math.LN10)
      : ((20.0 * 2.8) / (24.0 * Math.LN10));
    this.ppmDecCoeff = Math.exp(-1.0 / (tauDecay * fs));
    if (this.wasmDsp.ready) {
      this.wasmDsp.setPpmType(this.ppmType);
    }

    // Phase integration alpha (300 ms time constant)
    this.phaseAlpha = 1.0 - Math.exp(-1.0 / (0.300 * fs));

    // ITU-R BS.1770 K-Weighting Filter Coefficients
    const dbK = 3.9998438;
    const f0_shelf = 1681.9744509555319;
    const G = Math.pow(10, dbK / 20);
    const K_shelf = Math.tan(Math.PI * f0_shelf / fs);
    const K2_shelf = K_shelf * K_shelf;
    const sqrt2 = Math.SQRT2;
    const a0_s = 1 + sqrt2 * K_shelf + K2_shelf;
    this.kShelf_b0 = (G + sqrt2 * Math.sqrt(G) * K_shelf + K2_shelf) / a0_s;
    this.kShelf_b1 = 2 * (K2_shelf - G) / a0_s;
    this.kShelf_b2 = (G - sqrt2 * Math.sqrt(G) * K_shelf + K2_shelf) / a0_s;
    this.kShelf_a1 = 2 * (K2_shelf - 1) / a0_s;
    this.kShelf_a2 = (1 - sqrt2 * K_shelf + K2_shelf) / a0_s;

    const f0_hp = 38.13547087602444;
    const Q_hp = 0.5003270373238773;
    const K_hp = Math.tan(Math.PI * f0_hp / fs);
    const K2_hp = K_hp * K_hp;
    const a0_hp = 1 + (K_hp / Q_hp) + K2_hp;
    this.kHp_b0 = 1.0 / a0_hp;
    this.kHp_b1 = -2.0 / a0_hp;
    this.kHp_b2 = 1.0 / a0_hp;
    this.kHp_a1 = 2 * (K2_hp - 1) / a0_hp;
    this.kHp_a2 = (1 - (K_hp / Q_hp) + K2_hp) / a0_hp;

    // Loudness Time Constants: M (400ms), S (3000ms) for bufferSize=1024
    const blockTimeSec = 1024 / fs;
    this.lufsAlphaM = 1.0 - Math.exp(-blockTimeSec / 0.400);
    this.lufsAlphaS = 1.0 - Math.exp(-blockTimeSec / 3.000);
  }

  /**
   * Set VU Movement Style: 'simpson' (classic amber 300ms) or 'sifam' (crisp 200ms)
   */
  setVuStyle(style: "simpson" | "sifam") {
    if (style !== 'simpson' && style !== 'sifam') return;
    this.vuStyle = style;
    this.calculateCoefficients();
    const cfg = this.vuCoeffs[this.vuStyle] || { f0: 2.16, zeta: 0.815 };
    if (this.wasmDsp && this.wasmDsp.ready) {
      this.wasmDsp.setVuBallistics(cfg.f0, cfg.zeta);
    }
  }

  /**
   * Set VU Ballistics Preset (sourced from LikeDotAudio / APK.softapp.TEST.AUDIO.VuAnalog)
   */
  setVuBallisticPreset(presetKey: string): void {
    const preset = VU_BALLISTICS_LIBRARY[presetKey] || VU_BALLISTICS_LIBRARY.standard_vu;
    this.vuBallisticPreset = preset.id;
    this.vuCoeffs[this.vuStyle] = { f0: preset.f0, zeta: preset.zeta };
    this.calculateCoefficients();
    if (this.wasmDsp && this.wasmDsp.ready) {
      this.wasmDsp.setVuBallistics(preset.f0, preset.zeta);
    }
  }

  /**
   * Query available audio input hardware devices
   */
  async getAudioInputDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === 'audioinput');
    } catch (e) {
      console.warn('Could not enumerate audio devices:', e);
      return [];
    }
  }

  /**
   * Connect to a Sound Card Input / Microphone / Loopback Interface
   */
  async connectSoundCard(deviceId: string | null = null): Promise<boolean> {
    await this.ensureContext();
    this.stopCurrentSource();

    // Linux loopbacks (PulseAudio Loopback / Monitor of Sink, PipeWire, ALSA snd-aloop)
    // often fail if exact constraints or channelCount: 2 are required.
    // Progressively fall back from strict high-fidelity stereo to relaxed constraints.
    const constraintList = [];

    if (deviceId) {
      // 1. Exact device with ideal stereo and raw un-processed audio
      constraintList.push({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: { ideal: 2 }
        }
      });
      // 2. Ideal deviceId with raw audio
      constraintList.push({
        audio: {
          deviceId: { ideal: deviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      // 3. Exact deviceId basic
      constraintList.push({
        audio: {
          deviceId: { exact: deviceId }
        }
      });
      // 4. Plain deviceId
      constraintList.push({
        audio: {
          deviceId: deviceId
        }
      });
    }

    // Generic device fallbacks
    constraintList.push({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: { ideal: 2 }
      }
    });
    constraintList.push({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    constraintList.push({ audio: true });

    let stream = null;
    let lastErr = null;

    for (const c of constraintList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c);
        if (stream && stream.getAudioTracks().length > 0) {
          break;
        }
      } catch (err) {
        lastErr = err;
        console.warn('getUserMedia candidate constraint failed:', c, err);
      }
    }

    if (!stream) {
      console.warn("Attempting fallback to default audio device...");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (fallbackErr) {
        console.error("Fallback failed:", fallbackErr);
        if (this.onStatusChange) this.onStatusChange({ type: "error", error: (lastErr as any)?.message || "Audio device unavailable" });
        throw lastErr || new Error("Could not access audio device");
      }
    }

    try {
      this.stream = stream;
      const track = stream.getAudioTracks()[0];
      if (track) track.enabled = true;
      const settings = (track && track.getSettings) ? track.getSettings() : {};
      this.activeDeviceId = settings.deviceId || deviceId;
      this.isSystemAudio = false;
      this.sourceType = 'mic';
      this.setupAudioGraph(stream);

      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Notify device changes with updated permission labels
      const devices = await this.getAudioInputDevices();
      if (this.onDevicesChange) this.onDevicesChange(devices, this.activeDeviceId);
      const label = track?.label || 'Soundcard Input';
      if (this.onStatusChange) this.onStatusChange({ type: 'soundcard', label });
      return true;
    } catch (err) {
      console.error('Error in audio graph setup for sound card:', err);
      if (this.onStatusChange) this.onStatusChange({ type: 'error', error: (err as any)?.message });
      throw err;
    }
  }

  /**
   * Connect to System Audio Output ("Listen to whatever is playing")
   * Uses getDisplayMedia to capture computer audio
   */
  async connectSystemAudio(): Promise<boolean> {
    if (this.sourceType === 'system' && this.stream && this.stream.active) {
      return true;
    }

    try {
      // Must prompt for display media IMMEDIATELY while user activation gesture is valid!
      // Any preceding 'await' (like await this.ensureContext()) would discard transient user activation.
      const displayPromise = (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        systemAudio: 'include',
        surfaceSwitching: 'include',
        selfBrowserSurface: 'exclude',
        monitorTypeSurfaces: 'include'
      });

      const stream: MediaStream = await displayPromise;

      // Stop unused video track immediately to save battery and GPU cycles
      stream.getVideoTracks().forEach(track => track.stop());

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track selected. When prompted, ensure "Share audio" is checked.');
      }

      await this.ensureContext();
      this.stopCurrentSource();

      this.stream = stream;
      this.isSystemAudio = true;
      this.activeDeviceId = null;
      this.sourceType = 'system';
      this.setupAudioGraph(stream);

      // Track ends when user stops sharing in browser toolbar
      audioTracks[0].onended = () => {
        this.stopCurrentSource();
        if (this.onStatusChange) this.onStatusChange({ type: 'disconnected', label: 'Audio Stopped' });
      };

      if (this.onStatusChange) this.onStatusChange({ type: 'system', label: audioTracks[0].label || 'Computer System Audio' });
      return true;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        console.info('[AudioEngine] System audio capture cancelled by user.');
      } else {
        console.warn('[AudioEngine] Error capturing system audio:', err?.message || err);
      }
      if (this.onStatusChange) this.onStatusChange({ type: 'error', error: err?.message });
      return false;
    }
  }

  /**
   * Built-in Signal Generator for testing and calibration
   */
  startTestGenerator(type = 'sine1k') {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.stopCurrentSource();
    this.sourceType = 'test';
    this.testType = type;

    const ctx = this.ctx;
    if (!ctx) return;
    this.testGain = ctx.createGain();
    const gainVal = (type === 'sine1k' || type === 'sine400') ? Math.pow(10, this.toneCalDb / 20) : (type === 'pink' ? 0.35 : 0.5);
    this.testGain.gain.value = gainVal;

    if (type === 'sine1k' || type === 'sine400') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'sine1k' ? 1000 : 400, ctx.currentTime);
      osc.connect(this.testGain);
      osc.start();
      this.testOsc = osc;
    } else if (type === 'pink') {
      // 5-second buffer of Paul Kellet pink noise
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;
      noiseNode.connect(this.testGain);
      noiseNode.start();
      this.testOsc = noiseNode;
    } else if (type === 'sweep') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(20, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20000, ctx.currentTime + 8);
      osc.connect(this.testGain);
      osc.start();
      this.testOsc = osc;

      // Repeat sweep every 9s
      this.sweepTimer = setInterval(() => {
        if (this.sourceType === 'test' && this.testType === 'sweep' && this.testOsc) {
          try {
            (this.testOsc as OscillatorNode).frequency.cancelScheduledValues(ctx.currentTime);
            (this.testOsc as OscillatorNode).frequency.setValueAtTime(20, ctx.currentTime);
            (this.testOsc as OscillatorNode).frequency.exponentialRampToValueAtTime(20000, ctx.currentTime + 8);
          } catch (_) {}
        }
      }, 9000);
    }

    this.setupAudioGraph(this.testGain, true);
    if (this.onStatusChange) this.onStatusChange({ type: 'test', label: `Test Generator (${type})` });
  }

  /**
   * Set 1 kHz Test Tone Calibration Level (-24, -20, -18, -14, -12, -6, 0 dBFS)
   */
  setToneCalibration(calDb: number) {
    this.toneCalDb = calDb;
    if (this.testGain && this.ctx && (this.testType === 'sine1k' || this.testType === 'sine400')) {
      const lin = Math.pow(10, calDb / 20);
      try {
        this.testGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.testGain.gain.linearRampToValueAtTime(lin, this.ctx.currentTime + 0.05);
      } catch (_) {
        this.testGain.gain.value = lin;
      }
    }
  }

  /**
   * Wires the Web Audio processing graph
   */
  setupAudioGraph(sourceObj: any, isDirectNode: boolean = false) {
    const ctx = this.ctx;
    if (!ctx) return;

    if (isDirectNode) {
      this.sourceNode = sourceObj;
    } else {
      this.sourceNode = ctx.createMediaStreamSource(sourceObj);
    }

    // Input Trim Gain
    this.inputGainNode = ctx.createGain();
    this.inputGainNode.channelCount = 2;
    this.inputGainNode.channelCountMode = 'explicit';
    this.inputGainNode.channelInterpretation = 'speakers';
    this.updateInputGain();

    // High Pass Filter (Sub-Audible Rumble Rejection at 18 Hz or 80 Hz)
    this.hpfNode = ctx.createBiquadFilter();
    this.hpfNode.type = 'highpass';
    this.hpfNode.frequency.setValueAtTime(80, ctx.currentTime);
    this.hpfNode.Q.setValueAtTime(0.707, ctx.currentTime);
    this.updateHpfState();

    // Listen-Through / Monitor Output
    this.monitorGainNode = ctx.createGain();
    this.updateMonitorState();
    this.monitorGainNode.connect(ctx.destination);

    // Channel Splitter (Left = Ch A, Right = Ch B)
    this.splitterNode = ctx.createChannelSplitter(2);

    // AudioWorkletNode fallback management (modernizing deprecated ScriptProcessor)
    // Note: If AudioWorklet fails, we must rely on the existing legacy path.
    // Ensure all nodes are constructed after ensureContext() and audio is resumed.
    if (this.workletLoaded && typeof AudioWorkletNode !== 'undefined') {
      try {
        this.processorNode = new AudioWorkletNode(ctx, 'wbs-meter-processor');
        this.processorNode.port.onmessage = (e) => {
          if (e.data && e.data.ch0 && e.data.ch1) {
            this.processAudioBlockBuffers(e.data.ch0, e.data.ch1);
          }
        };
      } catch (_) {
        this.processorNode = null;
      }
    }

    if (!this.processorNode) {
      // Legacy fallback
      const bufferSize = 1024;
      this.processorNode = ctx.createScriptProcessor(bufferSize, 2, 2);
      this.processorNode.onaudioprocess = (e) => this.processAudioBlock(e);
    }

    // Connect chain:
    // sourceNode -> inputGainNode -> (hpfNode if on) -> splitter / monitor / processor
    if (this.sourceNode && this.inputGainNode && this.hpfNode && this.monitorGainNode && this.processorNode) {
      this.sourceNode.connect(this.inputGainNode);
      this.inputGainNode.connect(this.hpfNode);

      this.hpfNode.connect(this.monitorGainNode);
      this.hpfNode.connect(this.processorNode);
      // Connect processor to destination (silent dummy connection required for processor to run)
      const silentGain = ctx.createGain();
      silentGain.gain.value = 0.0;
      this.processorNode.connect(silentGain);
      silentGain.connect(ctx.destination);
    }
  }

  /**
   * Stop current audio stream or test generator
   */
  stopCurrentSource() {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
    if (this.testOsc) {
      try { this.testOsc.stop(); } catch (_) {}
      this.testOsc.disconnect();
      this.testOsc = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (_) {}
      this.sourceNode = null;
    }
    if (this.processorNode) {
      try {
        if ((this.processorNode as any).port) {
          (this.processorNode as any).port.onmessage = null;
        }
        this.processorNode.disconnect();
      } catch (_) {}
      this.processorNode = null;
    }
    this.sourceType = 'none';
    this.isSystemAudio = false;

    // Reset levels
    this.lufsState.meanSquareM_L = 0;
    this.lufsState.meanSquareM_R = 0;
    this.lufsState.meanSquareS_L = 0;
    this.lufsState.meanSquareS_R = 0;
    this.lufsState.sumEnergy = 0;
    this.lufsState.blockCount = 0;
    this.lufsState.shortTermHist = [];

    this.currentLevels = {
      vu: [0, 0],
      ppm: [-0.12, -0.12],
      vuDb: [-Infinity, -Infinity],
      ppmDb: [-Infinity, -Infinity],
      dbfs: [-60, -60, -60, -60],
      lufs: {
        m: -60,
        s: -60,
        i: -60,
        lra: 0,
        mL: -60,
        mR: -60
      },
      rmsDb: [-60, -60],
      phaseCorrelation: 1.0,
      phaseLed: -1,
      peak: [false, false],
      hasAudio: false
    };
  }

  /**
   * Process a live block of audio samples from ScriptProcessor
   */
  processAudioBlock(e: AudioProcessingEvent): void {
    const inputL = e.inputBuffer.getChannelData(0);
    const inputR = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : inputL;
    this.processAudioBlockBuffers(inputL, inputR);
  }

  /**
   * Real-time audio integration & ITU-R BS.1770 / IEC 60268 ballistics engine
   */
  processAudioBlockBuffers(inputL: Float32Array, inputR: Float32Array): void {
    const len = inputL.length;

    // WebAssembly SIMD/C-speed acceleration path
    if (this.wasmDsp.ready) {
      const ok = this.wasmDsp.process(inputL, inputR, this.wasmResult);
      if (ok) {
        const r = this.wasmResult;
        this.currentLevels.vu[0] = r.vuL;
        this.currentLevels.vu[1] = r.vuR;
        this.currentLevels.vuDb[0] = this.vuDbOf(r.vuL);
        this.currentLevels.vuDb[1] = this.vuDbOf(r.vuR);
        this.currentLevels.ppm[0] = r.ppmFracL;
        this.currentLevels.ppm[1] = r.ppmFracR;
        this.currentLevels.ppmDb[0] = r.ppmDbL;
        this.currentLevels.ppmDb[1] = r.ppmDbR;
        this.currentLevels.dbfs[0] = r.dbfsA;
        this.currentLevels.dbfs[1] = r.dbfsB;
        this.currentLevels.dbfs[2] = r.dbfsSum;
        this.currentLevels.dbfs[3] = r.dbfsDiff;
        this.currentLevels.lufs.m = r.lufsM;
        this.currentLevels.lufs.s = r.lufsS;
        this.currentLevels.lufs.mL = r.lufsML;
        this.currentLevels.lufs.mR = r.lufsMR;
        this.currentLevels.phaseCorrelation = r.phaseCorr;
        this.currentLevels.hasAudio = r.hasAudio;
        this.currentLevels.peak[0] = r.peakA;
        this.currentLevels.peak[1] = r.peakB;

        let pIdx = Math.round((r.phaseCorr + 1.0) * 3.5);
        if (pIdx < 0) pIdx = 0;
        if (pIdx > 7) pIdx = 7;
        this.currentLevels.phaseLed = r.hasAudio ? pIdx : -1;

        // BS.1770-4 Gated Integrated Loudness & LRA calculation over time
        const blockTotalZ = r.blockEnergy > 0 ? r.blockEnergy : (r.lufsM > -70 ? Math.pow(10, (r.lufsM + 0.691) / 10) : 0);

        if ((r.hasAudio || blockTotalZ > 1.25e-7) && blockTotalZ > 1.25e-7) { // > -70 LUFS absolute gate threshold
          this.lufsState.sumEnergy += blockTotalZ;
          this.lufsState.blockCount++;
        }

        const zI = this.lufsState.blockCount > 0 ? (this.lufsState.sumEnergy / this.lufsState.blockCount) : 0;
        const toLufs = (z: number): number => z > 1e-12 ? Math.max(-60, -0.691 + 10 * Math.log10(z)) : -60;
        this.currentLevels.lufs.i = zI > 0 ? toLufs(zI) : -Infinity;

        // Track LRA (Loudness Range)
        if (r.lufsS > -60) {
          this.lufsState.shortTermHist.push(r.lufsS);
          if (this.lufsState.shortTermHist.length > 200) {
            this.lufsState.shortTermHist.shift();
          }
        }
        if (this.lufsState.shortTermHist.length >= 10) {
          const sorted = [...this.lufsState.shortTermHist].sort((a, b) => a - b);
          const p10 = sorted[Math.floor(sorted.length * 0.10)];
          const p95 = sorted[Math.floor(sorted.length * 0.95)];
          this.currentLevels.lufs.lra = Math.max(0, p95 - p10);
        } else {
          this.currentLevels.lufs.lra = 0;
        }

        return;
      }
    }


    // Reference Scaling:
    // Standard broadcast alignment: 0 VU = +4 dBu (-18 dBFS).
    // Calibration scales with refLevelDb.
    const calGain = this.isRefDigital
      ? Math.pow(10, (-18 - this.refLevelDb) / 20)
      : Math.pow(10, (4 - this.refLevelDb) / 20);
    const kAvg = 8.8458296; // VU scale factor precisely calibrated to 0.000 VU at -18 dBFS reference level

    let hasSignal = false;
    let peakA = false, peakB = false;
    let maxA = 0, maxB = 0, maxSum = 0, maxDiff = 0;
    let sumSqK_L = 0, sumSqK_R = 0;
    let sumSqRaw_L = 0, sumSqRaw_R = 0;

    // Ballistics integration loops: VU COMPUTED FIRST FOR IMMEDIATE RESPONSE
    for (let i = 0; i < len; i++) {
      const sA = inputL[i] * calGain;
      const sB = inputR[i] * calGain;

      const rA = Math.abs(sA);
      const rB = Math.abs(sB);

      // =====================================================================
      // 1. VU BALLISTICS (CALCULATED FIRST BEFORE ALL OTHER MATH)
      // =====================================================================
      const vuInA = rA * kAvg;
      const ynA = this.vuB0 * vuInA + this.vuB1 * this.vuState[0].x1 + this.vuB2 * this.vuState[0].x2
                  - this.vuA1 * this.vuState[0].y1 - this.vuA2 * this.vuState[0].y2;
      this.vuState[0].x2 = this.vuState[0].x1;
      this.vuState[0].x1 = vuInA;
      this.vuState[0].y2 = this.vuState[0].y1;
      this.vuState[0].y1 = ynA;
      this.vuState[0].p = Math.max(-0.03, Math.min(1.15, ynA));

      const vuInB = rB * kAvg;
      const ynB = this.vuB0 * vuInB + this.vuB1 * this.vuState[1].x1 + this.vuB2 * this.vuState[1].x2
                  - this.vuA1 * this.vuState[1].y1 - this.vuA2 * this.vuState[1].y2;
      this.vuState[1].x2 = this.vuState[1].x1;
      this.vuState[1].x1 = vuInB;
      this.vuState[1].y2 = this.vuState[1].y1;
      this.vuState[1].y1 = ynB;
      this.vuState[1].p = Math.max(-0.03, Math.min(1.15, ynB));

      // Peak detection & signal presence (True L+R mathematical sum, can peak up to +6.02 dBFS)
      const rawA = Math.abs(inputL[i]);
      const rawB = Math.abs(inputR[i]);
      const rawSum = Math.abs(inputL[i] + inputR[i]); // True L + R Sum (reaches +6.02 dBFS for 0 dBFS in-phase mono)
      const rawDiff = Math.abs(inputL[i] - inputR[i]); // True L + (-R) difference / side
      if (rawA > maxA) maxA = rawA;
      if (rawB > maxB) maxB = rawB;
      if (rawSum > maxSum) maxSum = rawSum;
      if (rawDiff > maxDiff) maxDiff = rawDiff;

      sumSqRaw_L += inputL[i] * inputL[i];
      sumSqRaw_R += inputR[i] * inputR[i];

      if (rA > 0.0001 || rB > 0.0001) hasSignal = true;

      // K-weighting Stage 1: High shelf
      const s1L = this.lufsState.stage1[0];
      const y1L = this.kShelf_b0 * inputL[i] + this.kShelf_b1 * s1L.x1 + this.kShelf_b2 * s1L.x2 - this.kShelf_a1 * s1L.y1 - this.kShelf_a2 * s1L.y2;
      s1L.x2 = s1L.x1; s1L.x1 = inputL[i];
      s1L.y2 = s1L.y1; s1L.y1 = y1L;

      const s1R = this.lufsState.stage1[1];
      const y1R = this.kShelf_b0 * inputR[i] + this.kShelf_b1 * s1R.x1 + this.kShelf_b2 * s1R.x2 - this.kShelf_a1 * s1R.y1 - this.kShelf_a2 * s1R.y2;
      s1R.x2 = s1R.x1; s1R.x1 = inputR[i];
      s1R.y2 = s1R.y1; s1R.y1 = y1R;

      // K-weighting Stage 2: High pass (RLB)
      const s2L = this.lufsState.stage2[0];
      const y2L = this.kHp_b0 * y1L + this.kHp_b1 * s2L.x1 + this.kHp_b2 * s2L.x2 - this.kHp_a1 * s2L.y1 - this.kHp_a2 * s2L.y2;
      s2L.x2 = s2L.x1; s2L.x1 = y1L;
      s2L.y2 = s2L.y1; s2L.y1 = y2L;

      const s2R = this.lufsState.stage2[1];
      const y2R = this.kHp_b0 * y1R + this.kHp_b1 * s2R.x1 + this.kHp_b2 * s2R.x2 - this.kHp_a1 * s2R.y1 - this.kHp_a2 * s2R.y2;
      s2R.x2 = s2R.x1; s2R.x1 = y1R;
      s2R.y2 = s2R.y1; s2R.y1 = y2R;

      sumSqK_L += y2L * y2L;
      sumSqK_R += y2R * y2R;

      // 2. PPM Peak Ballistics (IEC 60268-10 Quasi-Peak)
      // Left
      if (rA > this.ppmState[0].env) {
        this.ppmState[0].env += (rA - this.ppmState[0].env) * this.ppmAttCoeff;
      } else {
        this.ppmState[0].env *= this.ppmDecCoeff;
      }
      // Right
      if (rB > this.ppmState[1].env) {
        this.ppmState[1].env += (rB - this.ppmState[1].env) * this.ppmAttCoeff;
      } else {
        this.ppmState[1].env *= this.ppmDecCoeff;
      }

      // Check Peak Overload (+10 dB above reference)
      if (rA >= 1.0) peakA = true;
      if (rB >= 1.0) peakB = true;

      // 3. Stereo Phase Correlation (Pearson product-moment)
      this.phaseState.sL2 += this.phaseAlpha * (sA * sA - this.phaseState.sL2);
      this.phaseState.sR2 += this.phaseAlpha * (sB * sB - this.phaseState.sR2);
      this.phaseState.sLR += this.phaseAlpha * (sA * sB - this.phaseState.sLR);
    }

    // Convert PPM envelopes to dB and fraction (-12 to +12 scale) with calibrated reference alignment (0 dB PPM = -18 dBFS)
    const trim = this.peakSensTrim || 0;
    const ppmRefOffset = 18.465;
    const ppmDbA = this.ppmState[0].env > 1e-6 ? 20 * Math.log10(this.ppmState[0].env) + ppmRefOffset + trim : -Infinity;
    const ppmDbB = this.ppmState[1].env > 1e-6 ? 20 * Math.log10(this.ppmState[1].env) + ppmRefOffset + trim : -Infinity;

    const ppmFracA = ppmDbA >= -12 ? (ppmDbA + 12) / 24 : -0.12 * (1 - Math.pow(10, (ppmDbA + 12) / 20));
    const ppmFracB = ppmDbB >= -12 ? (ppmDbB + 12) / 24 : -0.12 * (1 - Math.pow(10, (ppmDbB + 12) / 20));

    // Calculate phase correlation index (-1.0 to +1.0)
    const denom = Math.sqrt(this.phaseState.sL2 * this.phaseState.sR2) + 1e-9;
    const corr = hasSignal ? Math.max(-1.0, Math.min(1.0, this.phaseState.sLR / denom)) : 1.0;
    this.phaseState.correlation = corr;

    // Map correlation to 8 discrete LEDs (0 = -1.0 anti-phase, 7 = +1.0 mono in-phase)
    let pLed = -1;
    if (hasSignal) {
      if (corr <= -0.75) pLed = 0;
      else if (corr <= -0.50) pLed = 1;
      else if (corr <= -0.20) pLed = 2;
      else if (corr <= 0.10)  pLed = 3;
      else if (corr <= 0.40)  pLed = 4;
      else if (corr <= 0.70)  pLed = 5;
      else if (corr <= 0.90)  pLed = 6;
      else pLed = 7;
    }
    this.phaseState.led = pLed;

    // Digital Peak Full Scale (dBFS)
    const dbfsA = maxA > 1e-6 ? 20 * Math.log10(maxA) : -120;
    const dbfsB = maxB > 1e-6 ? 20 * Math.log10(maxB) : -120;
    const dbfsSum = maxSum > 1e-6 ? 20 * Math.log10(maxSum) : -120;
    const dbfsDiff = maxDiff > 1e-6 ? 20 * Math.log10(maxDiff) : -120;

    // ITU-R BS.1770 / EBU R128 Loudness Integration
    const zBlockL = sumSqK_L / len;
    const zBlockR = sumSqK_R / len;

    if (hasSignal) {
      this.lufsState.meanSquareM_L += this.lufsAlphaM * (zBlockL - this.lufsState.meanSquareM_L);
      this.lufsState.meanSquareM_R += this.lufsAlphaM * (zBlockR - this.lufsState.meanSquareM_R);

      this.lufsState.meanSquareS_L += this.lufsAlphaS * (zBlockL - this.lufsState.meanSquareS_L);
      this.lufsState.meanSquareS_R += this.lufsAlphaS * (zBlockR - this.lufsState.meanSquareS_R);

      const blockTotalZ = zBlockL + zBlockR;
      if (blockTotalZ > 1.25e-7) { // > -70 LUFS threshold gate
        this.lufsState.sumEnergy += blockTotalZ;
        this.lufsState.blockCount++;
      }
    } else {
      this.lufsState.meanSquareM_L *= 0.92;
      this.lufsState.meanSquareM_R *= 0.92;
      this.lufsState.meanSquareS_L *= 0.97;
      this.lufsState.meanSquareS_R *= 0.97;
    }

    const zM = this.lufsState.meanSquareM_L + this.lufsState.meanSquareM_R;
    const zS = this.lufsState.meanSquareS_L + this.lufsState.meanSquareS_R;
    const zI = this.lufsState.blockCount > 0 ? (this.lufsState.sumEnergy / this.lufsState.blockCount) : 0;

    const toLufs = (z: number): number => z > 1e-12 ? Math.max(-60, -0.691 + 10 * Math.log10(z)) : -60;

    const lufsM = toLufs(zM);
    const lufsS = toLufs(zS);
    const lufsI = zI > 0 ? toLufs(zI) : -Infinity;
    const lufsML = toLufs(this.lufsState.meanSquareM_L);
    const lufsMR = toLufs(this.lufsState.meanSquareM_R);

    // Track LRA (Loudness Range)
    if (lufsS > -60) {
      this.lufsState.shortTermHist.push(lufsS);
      if (this.lufsState.shortTermHist.length > 200) this.lufsState.shortTermHist.shift();
    }
    let lra = 0;
    if (this.lufsState.shortTermHist.length >= 10) {
      const sorted = [...this.lufsState.shortTermHist].sort((a, b) => a - b);
      const p10 = sorted[Math.floor(sorted.length * 0.10)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      lra = Math.max(0, p95 - p10);
    }

    const rmsL = sumSqRaw_L > 0 ? Math.max(-60, 10 * Math.log10(sumSqRaw_L / len)) : -60;
    const rmsR = sumSqRaw_R > 0 ? Math.max(-60, 10 * Math.log10(sumSqRaw_R / len)) : -60;

    // Update published levels
    this.currentLevels = {
      vu: [this.vuState[0].p, this.vuState[1].p],
      ppm: [ppmFracA, ppmFracB],
      vuDb: [this.vuDbOf(this.vuState[0].p), this.vuDbOf(this.vuState[1].p)],
      ppmDb: [ppmDbA, ppmDbB],
      dbfs: [dbfsA, dbfsB, dbfsSum, dbfsDiff],
      lufs: {
        m: lufsM,
        s: lufsS,
        i: lufsI,
        lra: lra,
        mL: lufsML,
        mR: lufsMR
      },
      rmsDb: [rmsL, rmsR],
      phaseCorrelation: corr,
      phaseLed: pLed,
      peak: [peakA, peakB],
      hasAudio: hasSignal
    };
  }

  getLevels() {
    return this.currentLevels;
  }

  vuDbOf(p: number): number {
    return p > 0.005 ? 20 * Math.log10(p) + 3 : -Infinity;
  }

  /**
   * Set High-Pass sub-audible filter (HPO = out, HPI = in)
   */
  setHighPass(enabled: boolean): void {
    this.hpfEnabled = enabled;
    this.updateHpfState();
  }

  updateHpfState() {
    if (!this.hpfNode || !this.ctx) return;
    if (this.hpfEnabled) {
      this.hpfNode.frequency.setValueAtTime(80, this.ctx.currentTime);
    } else {
      this.hpfNode.frequency.setValueAtTime(5, this.ctx.currentTime);
    }
  }

  /**
   * Set calibration reference level in dBu (+4 dBu default, -60 to +30)
   */
  setReferenceLevel(levelDb: number, isDigital: boolean = false): void {
    this.refLevelDb = levelDb;
    this.isRefDigital = isDigital;
    if (this.wasmDsp && this.wasmDsp.ready) {
      this.wasmDsp.setRefLevel(levelDb, isDigital);
    }
  }

  setPeakSensTrim(db: number): void {
    this.peakSensTrim = db;
    if (this.wasmDsp && this.wasmDsp.ready) {
      this.wasmDsp.setPeakTrim(db);
    }
  }

  /**
   * Set PPM Ballistics:
   * 1: DIN 45406 (10ms attack, 1500ms release / -20 dB in 1.5s)
   * 2: BBC BS 4297 / IEC 60268-10 (10ms attack, 2800ms release / -24 dB in 2.8s)
   * 3: Nordic N9 (5ms attack, 2000ms release / -20 dB in 2.0s)
   * 4: Fast Digital Quasi-Peak (1ms attack, 1000ms release / -20 dB in 1.0s)
   */
  setPpmType(type: 1 | 2 | 3 | 4 | 'type1' | 'type2' | 'nordic' | 'fast_peak'): void {
    let tNum: number = 2;
    if (type === 1 || type === 'type1') {
      tNum = 1;
      this.ppmBallisticPreset = 'type1';
    } else if (type === 2 || type === 'type2') {
      tNum = 2;
      this.ppmBallisticPreset = 'type2';
    } else if (type === 3 || type === 'nordic') {
      tNum = 3;
      this.ppmBallisticPreset = 'nordic';
    } else if (type === 4 || type === 'fast_peak') {
      tNum = 4;
      this.ppmBallisticPreset = 'fast_peak';
    }

    this.ppmType = (tNum === 1 ? 1 : 2);
    const fs = this.ctx ? this.ctx.sampleRate : 48000;
    let att = 0.010;
    let tauDecay = (20.0 * 2.8) / (24.0 * Math.LN10);

    if (tNum === 1) {
      att = 0.010;
      tauDecay = 1.5 / Math.LN10;
    } else if (tNum === 2) {
      att = 0.010;
      tauDecay = (20.0 * 2.8) / (24.0 * Math.LN10);
    } else if (tNum === 3) {
      att = 0.005;
      tauDecay = 2.0 / Math.LN10;
    } else if (tNum === 4) {
      att = 0.001;
      tauDecay = 1.0 / Math.LN10;
    }

    this.ppmAttack = att;
    this.ppmAttCoeff = 1.0 - Math.exp(-1.0 / (att * fs));
    this.ppmDecCoeff = Math.exp(-1.0 / (tauDecay * fs));
    if (this.wasmDsp && this.wasmDsp.ready) {
      this.wasmDsp.setPpmType(tNum);
    }
  }

  /**
   * Reset BS.1770 integrated loudness and LRA accumulators
   */
  resetLoudness(): void {
    this.lufsState.meanSquareM_L = 0;
    this.lufsState.meanSquareM_R = 0;
    this.lufsState.meanSquareS_L = 0;
    this.lufsState.meanSquareS_R = 0;
    this.lufsState.sumEnergy = 0;
    this.lufsState.blockCount = 0;
    this.lufsState.shortTermHist = [];
    if (this.wasmDsp && this.wasmDsp.ready) {
      this.wasmDsp.resetLoudness();
    }
  }

  /**
   * Input Gain Trim (-24 to +24 dB)
   */
  setInputTrim(db: number): void {
    this.inputTrimDb = db;
    this.updateInputGain();
  }

  updateInputGain() {
    if (!this.inputGainNode || !this.ctx) return;
    const gainVal = Math.pow(10, this.inputTrimDb / 20);
    this.inputGainNode.gain.setValueAtTime(gainVal, this.ctx.currentTime);
  }

  /**
   * Monitor / Listen Through toggle & volume
   */
  setMonitor(enabled: boolean, volume: number | null = null): void {
    this.monitorEnabled = enabled;
    if (volume !== null) this.monitorVolume = volume;
    this.updateMonitorState();
  }

  setMonitorVolume(val: number): void {
    this.monitorVolume = val;
    this.updateMonitorState();
  }

  updateMonitorState() {
    if (!this.monitorGainNode || !this.ctx) return;
    const vol = this.monitorEnabled ? this.monitorVolume : 0.0;
    this.monitorGainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
  }
}

// Global singleton instance
export const audio = new XtmAudioEngine();

