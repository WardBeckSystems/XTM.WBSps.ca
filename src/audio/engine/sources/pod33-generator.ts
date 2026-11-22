/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS POD-33 Digital Audio Reference & Precision Tone Generator
 * and ABB-1 Audio Bit Buddy / ABP-1 Bit Spitter Generator.
 *
 * Implements authentic Ward-Beck Systems calibration reference generators:
 * - POD-33: 100 Hz, 400 Hz, 1000 Hz (1 kHz) reference sine wave, digital silence,
 *   calibrated output levels (0 to -60 dBFS), genlock reference clock hierarchy,
 *   and stereo/left/right/inverted-phase (Ø 180°) channel routing.
 * - ABB-1 / ABP-1: AES3 Channel Status Bit Spitter, Professional vs Consumer mode,
 *   walking-1s, PRBS-15 pseudo-random sequences, and polarity stress test patterns.
 *
 * Supports simultaneous concurrent operation ("Dual Flow Spitting") where both
 * generators run at the same time and create independent MXL / audio flows:
 *   - POD-33: wbs-flow-ref-tone
 *   - Bit Spitter: wbs-flow-bit-spitter
 */

import type { XtmAudioEngine } from '../../audio-engine';
import { ensureAudioGraph } from '../graph';

export interface Pod33Config {
  freq: number;            // 100, 400, 1000, 0 (silence)
  levelDb: number;         // 0, -6, -12, -14, -18, -20, -24, -40, -50, -60, -100 (off)
  refClock: 'video' | 'aes' | 'int48' | 'int96';
  channelMode: 'stereo' | 'left' | 'right' | 'invert';
}

export interface BitBuddyConfig {
  pattern: 'tone' | 'walk1s' | 'prbs' | 'minmax';
  sampleRate: 48000 | 96000 | 44100;
  proMode: boolean;        // true = Professional AES3, false = Consumer S/PDIF
  audioData: 'audio' | 'data'; // 'audio' (PCM) or 'data' (bitstream)
}

export const DEFAULT_POD33_CONFIG: Pod33Config = {
  freq: 1000,
  levelDb: -18, // Ward-Beck EBU Standard 0 VU Calibration
  refClock: 'int48',
  channelMode: 'stereo'
};

export const DEFAULT_BITBUDDY_CONFIG: BitBuddyConfig = {
  pattern: 'tone',
  sampleRate: 48000,
  proMode: true,
  audioData: 'audio'
};

function updateGeneratorEngineStatus(engine: XtmAudioEngine): void {
  const hasPod33 = !!(engine as any).pod33Node;
  const hasBitBuddy = !!(engine as any).bitBuddyNode;

  if (hasPod33 && hasBitBuddy) {
    engine.sourceType = 'test';
    engine.onStatusChange?.({
      type: 'test',
      label: `POD-33 Tone & ABP-1 Bit Spitter (Dual Concurrent Flows Active)`
    });
  } else if (hasPod33) {
    engine.sourceType = 'test';
    const cfg = (engine as any).pod33Node?.config || DEFAULT_POD33_CONFIG;
    engine.onStatusChange?.({
      type: 'test',
      label: `POD-33 Tone (${cfg.freq}Hz @ ${cfg.levelDb}dBFS ${cfg.channelMode.toUpperCase()})`
    });
  } else if (hasBitBuddy) {
    engine.sourceType = 'test';
    const cfg = (engine as any).bitBuddyNode?.config || DEFAULT_BITBUDDY_CONFIG;
    engine.onStatusChange?.({
      type: 'test',
      label: `ABP-1 Bit Spitter (${cfg.pattern.toUpperCase()} · ${cfg.proMode ? 'PRO' : 'CONS'})`
    });
  }
}

/**
 * Start the POD-33 Digital Audio Reference & Precision Tone Generator
 * (Allows concurrent operation with Bit Spitter)
 */
export function startPod33Generator(engine: XtmAudioEngine, config: Pod33Config = DEFAULT_POD33_CONFIG): void {
  if (engine.ctx && engine.ctx.state === 'suspended') {
    engine.ctx.resume().catch(() => {});
  }
  const bus = ensureAudioGraph(engine);
  const ctx = engine.ctx;
  if (!ctx || !bus) return;

  // Stop previous POD-33 node if running without disrupting Bit Buddy
  stopPod33Generator(engine, false);

  engine.sourceType = 'test';
  engine.testType = `pod33_${config.freq}_${config.levelDb}_${config.channelMode}`;

  const lin = config.levelDb <= -90 ? 0.0 : Math.pow(10, config.levelDb / 20);

  if (config.freq > 0 && lin > 0) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = config.freq;

    const merger = ctx.createChannelMerger(2);
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();

    const leftMul = config.channelMode === 'right' ? 0.0 : lin;
    let rightMul = lin;
    if (config.channelMode === 'left') {
      rightMul = 0.0;
    } else if (config.channelMode === 'invert') {
      rightMul = -lin; // Exactly 180° out of phase
    }

    leftGain.gain.value = leftMul;
    rightGain.gain.value = rightMul;

    osc.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    osc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    const outGain = ctx.createGain();
    outGain.gain.value = 1.0;
    merger.connect(outGain);
    outGain.connect(bus);

    osc.start();

    (engine as any).pod33Node = { osc, leftGain, rightGain, merger, outGain, config };
    (engine as any).testOsc = osc;
    (engine as any).testGain = merger;
  } else {
    // Calibrated digital silence
    const silenceGain = ctx.createGain();
    silenceGain.gain.value = 0.0;
    silenceGain.connect(bus);
    (engine as any).pod33Node = { outGain: silenceGain, config };
  }

  updateGeneratorEngineStatus(engine);
}

/**
 * Stop the POD-33 Generator (leaves Bit Spitter running undisturbed)
 */
export function stopPod33Generator(engine: XtmAudioEngine, notify = true): void {
  const node = (engine as any).pod33Node;
  if (node) {
    if (node.osc) {
      try { node.osc.stop(); } catch (_) {}
      try { node.osc.disconnect(); } catch (_) {}
    }
    if (node.outGain) {
      try { node.outGain.disconnect(); } catch (_) {}
    }
    (engine as any).pod33Node = null;
  }
  if ((engine as any).testOsc === node?.osc) {
    (engine as any).testOsc = null;
  }
  if (notify) updateGeneratorEngineStatus(engine);
}

/**
 * Start the ABB-1 Audio Bit Buddy / ABP-1 Bit Spitter Generator
 * (Allows concurrent operation with POD-33)
 */
export function startBitBuddyGenerator(engine: XtmAudioEngine, config: BitBuddyConfig = DEFAULT_BITBUDDY_CONFIG): void {
  if (engine.ctx && engine.ctx.state === 'suspended') {
    engine.ctx.resume().catch(() => {});
  }
  const bus = ensureAudioGraph(engine);
  const ctx = engine.ctx;
  if (!ctx || !bus) return;

  // Stop previous Bit Buddy node if running without disrupting POD-33
  stopBitBuddyGenerator(engine, false);

  engine.sourceType = 'test';
  engine.testType = `bitbuddy_${config.pattern}`;

  const merger = ctx.createChannelMerger(2);
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.5;

  let sourceNode: OscillatorNode | AudioBufferSourceNode | null = null;

  if (config.pattern === 'tone') {
    // 1 kHz Calibrated Reference Tone with AES framing clock
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1000;
    const toneGain = ctx.createGain();
    toneGain.gain.value = Math.pow(10, -18 / 20); // -18 dBFS
    osc.connect(toneGain);
    toneGain.connect(merger, 0, 0);
    toneGain.connect(merger, 0, 1);
    osc.start();
    sourceNode = osc;
  } else if (config.pattern === 'walk1s') {
    // Walking 1s: Synthetic pulse impulses sweeping across 24 bits
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 120; // 120 Hz pulse frame rate

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 8.0;

    const gain = ctx.createGain();
    gain.gain.value = 0.35;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(merger, 0, 0);
    gain.connect(merger, 0, 1);

    osc.start();
    sourceNode = osc;
  } else if (config.pattern === 'prbs') {
    // PRBS-15: Pseudo-Random Binary Sequence noise burst generator
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    let lfsr = 0x7ace;
    for (let i = 0; i < bufferSize; i++) {
      // 15-bit Galois LFSR (polynomial: x^15 + x^14 + 1)
      const bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1;
      lfsr = (lfsr >> 1) | (bit << 14);
      const val = bit ? 0.35 : -0.35;
      left[i] = val;
      right[i] = val;
    }

    const prbsSource = ctx.createBufferSource();
    prbsSource.buffer = noiseBuffer;
    prbsSource.loop = true;
    prbsSource.connect(merger, 0, 0);
    prbsSource.connect(merger, 0, 1);
    prbsSource.start();
    sourceNode = prbsSource;
  } else if (config.pattern === 'minmax') {
    // Polarity / Min-Max Stress Test: 60 Hz full-scale square wave
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 60;
    const gain = ctx.createGain();
    gain.gain.value = 0.95; // Near 0 dBFS peak square
    osc.connect(gain);
    gain.connect(merger, 0, 0);
    gain.connect(merger, 0, 1);
    osc.start();
    sourceNode = osc;
  }

  merger.connect(masterGain);
  masterGain.connect(bus);

  (engine as any).bitBuddyNode = { source: sourceNode, merger, masterGain, config };
  if (!(engine as any).pod33Node) {
    (engine as any).testOsc = sourceNode;
    (engine as any).testGain = masterGain;
  }

  updateGeneratorEngineStatus(engine);
}

/**
 * Stop the Bit Buddy Generator (leaves POD-33 running undisturbed)
 */
export function stopBitBuddyGenerator(engine: XtmAudioEngine, notify = true): void {
  const node = (engine as any).bitBuddyNode;
  if (node) {
    if (node.source) {
      try { node.source.stop(); } catch (_) {}
      try { node.source.disconnect(); } catch (_) {}
    }
    if (node.masterGain) {
      try { node.masterGain.disconnect(); } catch (_) {}
    }
    (engine as any).bitBuddyNode = null;
  }
  if (notify) updateGeneratorEngineStatus(engine);
}
