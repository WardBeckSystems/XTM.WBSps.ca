/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Web Audio processing graph: wiring source -> trim -> HPF -> monitor / meter
 * processor, and tearing down the active source. Supports multi-source summing
 * for concurrent POD-33 Tone & ABS-1 Bit Spitter flows.
 */

import type { XtmAudioEngine } from '../audio-engine';
import { WORKLET_PROCESSOR_NAME } from './worklet-source';
import { HPF_ON_HZ, updateHpfState, updateInputGain, updateMonitorState } from './signal-chain';
import { clearLufsAccumulators } from './loudness';
import { createCurrentLevels } from './types';

/**
 * Ensures the Web Audio processing graph (input bus, HPF, monitor, metering)
 * is initialized once and stays connected for multi-source summing.
 */
export function ensureAudioGraph(engine: XtmAudioEngine): GainNode | null {
  const ctx = engine.ctx;
  if (!ctx) return null;

  if (!engine.inputGainNode) {
    // Input Trim Gain / Master Summing Bus
    engine.inputGainNode = ctx.createGain();
    engine.inputGainNode.channelCount = 2;
    engine.inputGainNode.channelCountMode = 'explicit';
    engine.inputGainNode.channelInterpretation = 'speakers';
    updateInputGain(engine);

    // High Pass Filter (Sub-Audible Rumble Rejection at 18 Hz or 80 Hz)
    engine.hpfNode = ctx.createBiquadFilter();
    engine.hpfNode.type = 'highpass';
    engine.hpfNode.frequency.setValueAtTime(HPF_ON_HZ, ctx.currentTime);
    engine.hpfNode.Q.setValueAtTime(0.707, ctx.currentTime);
    updateHpfState(engine);

    // Listen-Through / Monitor Output
    engine.monitorGainNode = ctx.createGain();
    updateMonitorState(engine);
    engine.monitorGainNode.connect(ctx.destination);

    // Channel Splitter (Left = Ch A, Right = Ch B)
    engine.splitterNode = ctx.createChannelSplitter(2);

    // AudioWorkletNode fallback management (modernizing deprecated ScriptProcessor)
    if (engine.workletLoaded && typeof AudioWorkletNode !== 'undefined') {
      try {
        engine.processorNode = new AudioWorkletNode(ctx, WORKLET_PROCESSOR_NAME);
        engine.processorNode.port.onmessage = (e) => {
          // While an MXL flow feeds the meters, the graph's own (silent) input is ignored
          if (e.data && e.data.ch0 && e.data.ch1 && !engine.mxlFeed) {
            engine.processAudioBlockBuffers(e.data.ch0, e.data.ch1);
          }
        };
      } catch (_) {
        engine.processorNode = null;
      }
    }

    if (!engine.processorNode) {
      // Legacy fallback
      const bufferSize = 1024;
      engine.processorNode = ctx.createScriptProcessor(bufferSize, 2, 2);
      engine.processorNode.onaudioprocess = (e) => { if (!engine.mxlFeed) engine.processAudioBlock(e); };
    }

    engine.inputGainNode.connect(engine.hpfNode);
    engine.hpfNode.connect(engine.monitorGainNode);
    // Cue / HP: silent until the router puts the input on Cue (signal-chain setCue)
    engine.cueGainNode = ctx.createGain();
    engine.cueGainNode.gain.value = 0;
    engine.hpfNode.connect(engine.cueGainNode);
    engine.hpfNode.connect(engine.processorNode);

    // Connect processor to destination (silent dummy connection required for processor to run)
    const silentGain = ctx.createGain();
    silentGain.gain.value = 0.0;
    engine.processorNode.connect(silentGain);
    silentGain.connect(ctx.destination);
  }

  return engine.inputGainNode;
}

/**
 * Wires the Web Audio processing graph
 */
export function setupAudioGraph(engine: XtmAudioEngine, sourceObj: any, isDirectNode: boolean = false): void {
  const ctx = engine.ctx;
  if (!ctx) return;

  const bus = ensureAudioGraph(engine);
  if (!bus) return;

  if (engine.sourceNode) {
    try { engine.sourceNode.disconnect(); } catch (_) {}
  }

  if (isDirectNode) {
    engine.sourceNode = sourceObj;
  } else {
    engine.sourceNode = ctx.createMediaStreamSource(sourceObj);
  }

  try {
    engine.sourceNode.connect(bus);
  } catch (err) {
    console.warn('Error connecting source node to audio graph:', err);
  }
}

/**
 * Stop current audio stream or test generator
 */
export function stopCurrentSource(engine: XtmAudioEngine): void {
  // The shared tab stays a live source while its share lasts (parked below); it is marked
  // gone only when its track ends or it is really stopped.
  if (engine.mxlFeed) {
    engine.mxlFeed.stop();
    engine.mxlFeed = null;
  }
  if (engine.sweepTimer) {
    clearInterval(engine.sweepTimer);
    engine.sweepTimer = null;
  }
  if (engine.testOsc) {
    try { engine.testOsc.stop(); } catch (_) {}
    try { engine.testOsc.disconnect(); } catch (_) {}
    engine.testOsc = null;
  }
  if ((engine as any).pod33Node) {
    try { (engine as any).pod33Node.osc?.stop(); } catch (_) {}
    try { (engine as any).pod33Node.outGain?.disconnect(); } catch (_) {}
    (engine as any).pod33Node = null;
  }
  if ((engine as any).bitBuddyNode) {
    try { (engine as any).bitBuddyNode.source?.stop(); } catch (_) {}
    try { (engine as any).bitBuddyNode.masterGain?.disconnect(); } catch (_) {}
    (engine as any).bitBuddyNode = null;
  }
  if (engine.stream) {
    // A tab share or microphone stays open (parked): switching back must not prompt again.
    // It ends only when the user stops sharing, or when a new capture of the same kind replaces it.
    const key = engine.sourceType === 'system' ? 'system'
      : engine.sourceType === 'mic' ? ((engine.stream as any).__wbsMicKey || `mic:${engine.activeDeviceId || 'default'}`) : null;
    const live = engine.stream.getAudioTracks().some(t => t.readyState === 'live');
    if (key && live) {
      const old = engine.parkedStreams.get(key);
      if (old && old !== engine.stream) old.getTracks().forEach(t => t.stop());
      engine.parkedStreams.set(key, engine.stream);
    } else {
      if (engine.sourceType === 'system' && engine.tabInfo) engine.tabInfo.live = false;
      engine.stream.getTracks().forEach(t => t.stop());
    }
    engine.stream = null;
  }
  if (engine.sourceNode) {
    try { engine.sourceNode.disconnect(); } catch (_) {}
    engine.sourceNode = null;
  }
  // The metering processor is part of the permanent graph (ensureAudioGraph builds it once,
  // keyed on the input bus), so it stays connected: tearing it down here left every later
  // source unmetered and froze the XTM-4, POD-22 and loudness on the old source.
  engine.sourceType = 'none';
  engine.isSystemAudio = false;
  // New source, new programme: integrated loudness / LRA start over
  engine.resetLoudness();
}

/** A parked capture stream that is still live, or null (dead ones are dropped). */
export function takeParked(engine: XtmAudioEngine, key: string): MediaStream | null {
  const s = engine.parkedStreams.get(key);
  if (!s) return null;
  engine.parkedStreams.delete(key);
  if (s.getAudioTracks().some(t => t.readyState === 'live')) return s;
  s.getTracks().forEach(t => t.stop());
  return null;
}
