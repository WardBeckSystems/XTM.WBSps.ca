/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Web Audio processing graph: wiring source -> trim -> HPF -> monitor / meter
 * processor, and tearing down the active source.
 */

import type { XtmAudioEngine } from '../audio-engine';
import { WORKLET_PROCESSOR_NAME } from './worklet-source';
import { HPF_ON_HZ, updateHpfState, updateInputGain, updateMonitorState } from './signal-chain';
import { clearLufsAccumulators } from './loudness';
import { createCurrentLevels } from './types';

/**
 * Wires the Web Audio processing graph
 */
export function setupAudioGraph(engine: XtmAudioEngine, sourceObj: any, isDirectNode: boolean = false): void {
  const ctx = engine.ctx;
  if (!ctx) return;

  if (isDirectNode) {
    engine.sourceNode = sourceObj;
  } else {
    engine.sourceNode = ctx.createMediaStreamSource(sourceObj);
  }

  // Input Trim Gain
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
  // Note: If AudioWorklet fails, we must rely on the existing legacy path.
  // Ensure all nodes are constructed after ensureContext() and audio is resumed.
  if (engine.workletLoaded && typeof AudioWorkletNode !== 'undefined') {
    try {
      engine.processorNode = new AudioWorkletNode(ctx, WORKLET_PROCESSOR_NAME);
      engine.processorNode.port.onmessage = (e) => {
        if (e.data && e.data.ch0 && e.data.ch1) {
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
    engine.processorNode.onaudioprocess = (e) => engine.processAudioBlock(e);
  }

  // Connect chain:
  // sourceNode -> inputGainNode -> (hpfNode if on) -> splitter / monitor / processor
  if (engine.sourceNode && engine.inputGainNode && engine.hpfNode && engine.monitorGainNode && engine.processorNode) {
    engine.sourceNode.connect(engine.inputGainNode);
    engine.inputGainNode.connect(engine.hpfNode);

    engine.hpfNode.connect(engine.monitorGainNode);
    engine.hpfNode.connect(engine.processorNode);
    // Connect processor to destination (silent dummy connection required for processor to run)
    const silentGain = ctx.createGain();
    silentGain.gain.value = 0.0;
    engine.processorNode.connect(silentGain);
    silentGain.connect(ctx.destination);
  }
}

/**
 * Stop current audio stream or test generator
 */
export function stopCurrentSource(engine: XtmAudioEngine): void {
  if (engine.sweepTimer) {
    clearInterval(engine.sweepTimer);
    engine.sweepTimer = null;
  }
  if (engine.testOsc) {
    try { engine.testOsc.stop(); } catch (_) {}
    engine.testOsc.disconnect();
    engine.testOsc = null;
  }
  if (engine.stream) {
    engine.stream.getTracks().forEach(t => t.stop());
    engine.stream = null;
  }
  if (engine.sourceNode) {
    try { engine.sourceNode.disconnect(); } catch (_) {}
    engine.sourceNode = null;
  }
  if (engine.processorNode) {
    try {
      if ((engine.processorNode as any).port) {
        (engine.processorNode as any).port.onmessage = null;
      }
      engine.processorNode.disconnect();
    } catch (_) {}
    engine.processorNode = null;
  }
  engine.sourceType = 'none';
  engine.isSystemAudio = false;

  // Reset levels
  clearLufsAccumulators(engine.lufsState);
  engine.currentLevels = createCurrentLevels();
}
