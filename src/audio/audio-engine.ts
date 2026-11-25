/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM Precision Audio & Ballistics Engine
 * Handles sound card inputs, system output capture, test generator,
 * high-pass filtering, electromechanical VU ballistics, PPM peak dynamics,
 * and stereo phase cross-correlation.
 *
 * The engine owns all state; the work is delegated to the modules under ./engine/.
 */

import { WasmDspEngine, type WasmDspResult } from '../dsp/wasm-dsp';
import {
  createCurrentLevels,
  createLufsState,
  createPhaseState,
  createPpmState,
  createVuCoeffs,
  createVuState,
  createWasmResult,
  type CurrentLevelsState,
  type LufsState,
  type PhaseCorrelationState,
  type PpmStateChannel,
  type SourceType,
  type VuCoeffConfig,
  type VuStateChannel
} from './engine/types';
import * as context from './engine/context';
import { calculateCoefficients } from './engine/coefficients';
import * as vu from './engine/ballistics/vu';
import * as ppm from './engine/ballistics/ppm';
import type { PpmTypeInput } from './engine/ballistics/ppm-standards';
import * as soundcard from './engine/sources/soundcard';
import { connectSystemAudio } from './engine/sources/system-audio';
import { connectMxlFlow, type MxlFlowFeed } from './engine/sources/mxl-flow';
import { testGen, pod33Gen, configureGenerators, type Pod33Config, type BitBuddyConfig } from '../../Generators.WBSps.ca/web';
import { resumeAudio } from './engine/autoplay';
import * as graph from './engine/graph';

// The generators (Generators submodule) feed XTM's summing bus and follow its autoplay rules.
configureGenerators({ ensureAudioGraph: graph.ensureAudioGraph, resumeAudio });
import * as chain from './engine/signal-chain';
import * as reference from './engine/reference';
import { resetLoudness } from './engine/loudness';
import { processWasmBlock } from './engine/wasm-levels';
import { processJsBlock } from './engine/js-levels';

export type {
  VuCoeffConfig,
  VuStateChannel,
  PpmStateChannel,
  PhaseCorrelationState,
  BiquadState,
  LufsState,
  CurrentLevelsState
} from './engine/types';

export class XtmAudioEngine {
  ctx: AudioContext | null = null;
  sourceNode: MediaStreamAudioSourceNode | AudioNode | null = null;
  stream: MediaStream | null = null;
  /**
   * Captured streams kept alive while another source plays, keyed 'system' or 'mic:<deviceId>'.
   * Switching back reuses them, so the browser does not ask for the tab or microphone again.
   */
  parkedStreams: Map<string, MediaStream> = new Map();
  isSystemAudio: boolean = false;
  activeDeviceId: string | null = null;
  sourceType: SourceType = 'none'; // 'mic', 'system', 'test'

  // Gain & Filtering
  inputGainNode: GainNode | null = null;
  inputTrimDb: number = 0; // -24 to +24 dB
  hpfNode: BiquadFilterNode | null = null;
  hpfEnabled: boolean = false;

  // Monitor / Listen Through
  monitorGainNode: GainNode | null = null;
  monitorEnabled: boolean = false; // speakers muted until the router unmutes them
  monitorVolume: number = 0.8;
  /** Cue / HP: a second output, played into the TAP's HW 2 bus (setCue) */
  cueGainNode: GainNode | null = null;
  cueEl: HTMLAudioElement | null = null;

  // Splitter & Analyser / Processor
  splitterNode: ChannelSplitterNode | null = null;
  processorNode: AudioWorkletNode | ScriptProcessorNode | null = null;

  // Test Generator
  testOsc: OscillatorNode | AudioBufferSourceNode | null = null;
  testGain: GainNode | null = null;
  testType: string = 'none'; // 'sine1k', 'sine400', 'pink', 'sweep'
  toneCalDb: number = -18;   // Default: -18 dBFS (0 VU Reference Alignment)
  sweepTimer: any = null;

  // Physics parameters for VU (ANSI C16.5-1942 electromechanical 2nd-order ODE)
  // 300ms attack / 300ms release, 1.0-1.5% overshoot
  vuStyle: 'pimson' | 'pimsom' | 'simpson' | 'fisam' | 'sifam' = 'pimson';
  vuBallisticPreset: string = 'standard_vu';
  vuCoeffs: Record<string, VuCoeffConfig> = createVuCoeffs();
  vuState: [VuStateChannel, VuStateChannel] = createVuState();

  // Physics parameters for PPM (IEC 60268-10 Type IIb Nordic / BBC)
  ppmAttack: number = 0.005; // 5ms attack (recomputed by calculateCoefficients)
  ppmType: 1 | 2 = 2; // 1 = DIN 45406 Type I, 2 = BBC BS 4297 Type II
  ppmBallisticPreset: string = 'type2';
  ppmDecayDbPerSec: number = 24 / 2.8; // 24 dB in 2.8s
  peakSensTrim: number = 0.0; // Calibrated 0 dB nominal reference alignment
  ppmState: [PpmStateChannel, PpmStateChannel] = createPpmState();

  // Phase Correlation state (Pearson normalized, 300ms integration)
  phaseAlpha: number = 0.001;
  phaseState: PhaseCorrelationState = createPhaseState();

  // Reference Calibration Level
  refLevelDb: number = 4; // +4 dBu default
  isRefDigital: boolean = false;
  domain: 'analog' | 'digital' = 'analog'; // 'analog' (+4 dBu = 0 VU) or 'digital' (-20 dBFS = 0 VU)

  // ITU-R BS.1770 / EBU R128 Loudness State
  lufsState: LufsState = createLufsState();
  // Current Metering Output (queried by visualizer on animation frame)
  currentLevels: CurrentLevelsState = createCurrentLevels();

  // Listeners for device changes & status
  onStatusChange: ((status: any) => void) | null = null;
  /** Live MXL flow feeding the meters (set by connectMxlFlow). */
  mxlFeed: MxlFlowFeed | null = null;
  /** What the shared browser tab / window / screen is (set by connectSystemAudio). */
  tabInfo: import('../../WebRouter/src').BrowserTabInfo | null = null;
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
  wasmResult: WasmDspResult = createWasmResult();

  // --- Context / coefficients -------------------------------------------

  /** Initializes or resumes the AudioContext (re-applies ref level + digital flag to WASM). */
  ensureContext(): Promise<AudioContext> { return context.ensureContext(this); }

  /** Loads the AudioWorklet module for modern, low-latency audio-thread metering */
  initWorklet(): Promise<void> { return context.initWorklet(this); }

  /** Calculates ballistic biquad coefficients for the VU movement (and PPM / phase / K / LUFS) */
  calculateCoefficients(): void { calculateCoefficients(this); }

  // --- VU ballistics ----------------------------------------------------

  /** Set VU Movement Style: 'pimson' (classic amber 300ms) or 'fisam' (crisp 200ms) */
  setVuStyle(style: string): void { vu.setVuStyle(this, style as any); }

  /** Set VU Ballistics Preset (sourced from LikeDotAudio / APK.softapp.TEST.AUDIO.VuAnalog) */
  setVuBallisticPreset(presetKey: string): void { vu.setVuBallisticPreset(this, presetKey); }

  vuDbOf(p: number): number { return vu.vuDbOf(p); }

  // --- Sources ------------------------------------------------------------

  /** Query available audio input hardware devices */
  getAudioInputDevices(): Promise<MediaDeviceInfo[]> { return soundcard.getAudioInputDevices(); }

  /** Connect to a Sound Card Input / Microphone / Loopback Interface */
  connectSoundCard(deviceId: string | null = null): Promise<boolean> {
    return soundcard.connectSoundCard(this, deviceId);
  }

  /** Connect to System Audio Output ("Listen to whatever is playing") via getDisplayMedia */
  connectSystemAudio(preferredSurface: 'monitor' | 'browser' | 'window' = 'browser', forcePrompt = false): Promise<boolean> { return connectSystemAudio(this, preferredSurface, forcePrompt); }

  /** An MXL flow on the host (:8467) as the meter source: XTM-4, POD-22, loudness and scope all follow it */
  connectMxlFlow(baseUrl: string, flowId: string, label?: string): Promise<boolean> { return connectMxlFlow(this, baseUrl, flowId, label); }

  /** Built-in Signal Generator for testing and calibration */
  startTestGenerator(type = 'sine1k'): void { testGen.startTestGenerator(this, type); }

  /** WBS POD-33 Digital Audio Reference & Precision Tone Generator */
  startPod33Generator(config?: Pod33Config): void { pod33Gen.startPod33Generator(this, config); }
  stopPod33Generator(): void { pod33Gen.stopPod33Generator(this); }

  /** WBS ABB-1 Audio Bit Buddy / ABS-1 Bit Spitter Generator */
  startBitBuddyGenerator(config?: BitBuddyConfig): void { pod33Gen.startBitBuddyGenerator(this, config); }
  stopBitBuddyGenerator(): void { pod33Gen.stopBitBuddyGenerator(this); }

  /** Set 1 kHz Test Tone Calibration Level (-24, -20, -18, -14, -12, -6, 0 dBFS) */
  setToneCalibration(calDb: number): void { testGen.setToneCalibration(this, calDb); }

  // --- Graph --------------------------------------------------------------

  /** Wires the Web Audio processing graph */
  setupAudioGraph(sourceObj: any, isDirectNode: boolean = false): void {
    graph.setupAudioGraph(this, sourceObj, isDirectNode);
  }

  /** Stop current audio stream or test generator */
  stopCurrentSource(): void { graph.stopCurrentSource(this); }

  // --- Metering -----------------------------------------------------------

  /** Process a live block of audio samples from ScriptProcessor */
  processAudioBlock(e: AudioProcessingEvent): void {
    const inputL = e.inputBuffer.getChannelData(0);
    const inputR = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : inputL;
    this.processAudioBlockBuffers(inputL, inputR);
  }

  /** Real-time audio integration & ITU-R BS.1770 / IEC 60268 ballistics engine */
  processAudioBlockBuffers(inputL: Float32Array, inputR: Float32Array): void {
    // WebAssembly SIMD/C-speed acceleration path, JS fallback otherwise
    if (processWasmBlock(this, inputL, inputR)) return;
    processJsBlock(this, inputL, inputR);
  }

  getLevels() {
    return this.currentLevels;
  }

  // --- Signal chain -------------------------------------------------------

  /** Set High-Pass sub-audible filter (HPO = out, HPI = in) */
  setHighPass(enabled: boolean): void { chain.setHighPass(this, enabled); }

  updateHpfState(): void { chain.updateHpfState(this); }

  /** Input Gain Trim (-24 to +24 dB) */
  setInputTrim(db: number): void { chain.setInputTrim(this, db); }

  updateInputGain(): void { chain.updateInputGain(this); }

  /** Monitor / Listen Through toggle & volume */
  setMonitor(enabled: boolean, volume: number | null = null): void { chain.setMonitor(this, enabled, volume); }

  setMonitorVolume(val: number): void { chain.setMonitorVolume(this, val); }

  /** Cue / HP on or off: the routed input plays into the TAP's HW 2 (Cue/HP) bus. */
  setCue(enabled: boolean): Promise<boolean> { return chain.setCue(this, enabled); }

  /** The shared tab's stream, playing or parked (null when nothing is shared). */
  tabStream(): MediaStream | null {
    const s = this.sourceType === 'system' && this.stream ? this.stream : this.parkedStreams.get('system') ?? null;
    return s && s.getAudioTracks().some((t) => t.readyState === 'live') ? s : null;
  }

  /** Monitor into the TAP's HW 1 bus (true) or the default output (false). */
  setMonitorSink(toTap: boolean): Promise<boolean> { return chain.setMonitorSink(this, toTap); }

  updateMonitorState(): void { chain.updateMonitorState(this); }

  // --- Reference / PPM / loudness -----------------------------------------

  /** Set calibration reference level in dBu (+4 dBu default, -60 to +30), or dBFS when isDigital */
  setReferenceLevel(levelDb: number, isDigital: boolean = false): void {
    reference.setReferenceLevel(this, levelDb, isDigital);
  }

  setPeakSensTrim(db: number): void { reference.setPeakSensTrim(this, db); }

  /**
   * Set PPM Ballistics:
   * 1: DIN 45406, 2: BBC BS 4297 / IEC 60268-10, 3: Nordic N9, 4: Fast Digital Quasi-Peak
   */
  setPpmType(type: PpmTypeInput): void { ppm.setPpmType(this, type); }

  /** Reset BS.1770 integrated loudness and LRA accumulators */
  resetLoudness(): void { resetLoudness(this); }
}

// Global singleton instance
export const audio = new XtmAudioEngine();
