/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Gain / filter / monitor chain controls: input trim, sub-audible high-pass
 * filter and listen-through monitor output.
 */

import type { XtmAudioEngine } from '../audio-engine';
import { resumeAudio } from './autoplay';

/** HPF corner when engaged (HPI) and the effectively-open corner when bypassed (HPO). */
export const HPF_ON_HZ = 80;
export const HPF_OFF_HZ = 5;

/**
 * Input Gain Trim (-24 to +24 dB)
 */
export function setInputTrim(engine: XtmAudioEngine, db: number): void {
  engine.inputTrimDb = db;
  updateInputGain(engine);
}

export function updateInputGain(engine: XtmAudioEngine): void {
  if (!engine.inputGainNode || !engine.ctx) return;
  const gainVal = Math.pow(10, engine.inputTrimDb / 20);
  engine.inputGainNode.gain.setValueAtTime(gainVal, engine.ctx.currentTime);
}

/**
 * Set High-Pass sub-audible filter (HPO = out, HPI = in)
 */
export function setHighPass(engine: XtmAudioEngine, enabled: boolean): void {
  engine.hpfEnabled = enabled;
  updateHpfState(engine);
}

export function updateHpfState(engine: XtmAudioEngine): void {
  if (!engine.hpfNode || !engine.ctx) return;
  if (engine.hpfEnabled) {
    engine.hpfNode.frequency.setValueAtTime(HPF_ON_HZ, engine.ctx.currentTime);
  } else {
    engine.hpfNode.frequency.setValueAtTime(HPF_OFF_HZ, engine.ctx.currentTime);
  }
}

/**
 * Monitor / Listen Through toggle & volume
 */
export function setMonitor(engine: XtmAudioEngine, enabled: boolean, volume: number | null = null): void {
  if (enabled) resumeAudio(engine.ctx);
  engine.monitorEnabled = enabled;
  if (volume !== null) engine.monitorVolume = volume;
  updateMonitorState(engine);
}

export function setMonitorVolume(engine: XtmAudioEngine, val: number): void {
  engine.monitorVolume = val;
  updateMonitorState(engine);
}

export function updateMonitorState(engine: XtmAudioEngine): void {
  if (!engine.monitorGainNode || !engine.ctx) return;
  const vol = engine.monitorEnabled ? engine.monitorVolume : 0.0;
  engine.monitorGainNode.gain.setValueAtTime(vol, engine.ctx.currentTime);
}

/** PipeWire / PulseAudio sink the TAP makes for Cue / HP ("Ward-Beck TAP 6: HW 2 (Cue/HP)"). */
const CUE_SINK = /HW 2 \(Cue\/HP\)/;
let cueWarned = false;

/**
 * Cue / HP: the routed input plays into the TAP's HW 2 bus through a second audio output
 * (an <audio> element on that sink); the hardware grid sends HW 2 to any sound cards.
 */
export async function setCue(engine: XtmAudioEngine, enabled: boolean): Promise<boolean> {
  const ctx = engine.ctx;
  const g = engine.cueGainNode;
  if (!ctx || !g) return false;
  if (!enabled) {
    g.gain.setValueAtTime(0, ctx.currentTime);
    engine.cueEl?.pause();
    return true;
  }
  resumeAudio(ctx);
  if (!engine.cueEl) {
    const dest = ctx.createMediaStreamDestination();
    g.connect(dest);
    const el = new Audio();
    el.srcObject = dest.stream;
    engine.cueEl = el;
  }
  const el = engine.cueEl as HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };
  try {
    const outs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audiooutput');
    const hw2 = outs.find((d) => CUE_SINK.test(d.label));
    if (!hw2 || !el.setSinkId) {
      if (!cueWarned) console.warn('[Cue] TAP HW 2 (Cue/HP) output not found: start the Ward-Beck Audio Tap and allow audio devices');
      cueWarned = true;
      return false;
    }
    await el.setSinkId(hw2.deviceId);
    await el.play();
    g.gain.setValueAtTime(1, ctx.currentTime);
    return true;
  } catch (e) {
    console.warn('[Cue] could not play into HW 2:', e);
    return false;
  }
}
