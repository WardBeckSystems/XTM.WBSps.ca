/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Sound card input / microphone / loopback interface source (getUserMedia),
 * with progressive constraint fallbacks for Linux loopback devices.
 */

import type { XtmAudioEngine } from '../../audio-engine';

/**
 * Query available audio input hardware devices
 */
export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'audioinput');
  } catch (e) {
    console.warn('Could not enumerate audio devices:', e);
    return [];
  }
}

const RAW_AUDIO = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false
};

/**
 * Linux loopbacks (PulseAudio Loopback / Monitor of Sink, PipeWire, ALSA snd-aloop)
 * often fail if exact constraints or channelCount: 2 are required.
 * Progressively fall back from strict high-fidelity stereo to relaxed constraints.
 */
export function buildSoundCardConstraints(deviceId: string | null): MediaStreamConstraints[] {
  const constraintList: MediaStreamConstraints[] = [];

  if (deviceId) {
    // 1. Exact device with ideal stereo and raw un-processed audio
    constraintList.push({ audio: { deviceId: { exact: deviceId }, ...RAW_AUDIO, channelCount: { ideal: 2 } } });
    // 2. Ideal deviceId with raw audio
    constraintList.push({ audio: { deviceId: { ideal: deviceId }, ...RAW_AUDIO } });
    // 3. Exact deviceId basic
    constraintList.push({ audio: { deviceId: { exact: deviceId } } });
    // 4. Plain deviceId
    constraintList.push({ audio: { deviceId: deviceId } });
  }

  // Generic device fallbacks
  constraintList.push({ audio: { ...RAW_AUDIO, channelCount: { ideal: 2 } } });
  constraintList.push({ audio: { ...RAW_AUDIO } });
  constraintList.push({ audio: true });
  return constraintList;
}

/**
 * Connect to a Sound Card Input / Microphone / Loopback Interface
 */
export async function connectSoundCard(engine: XtmAudioEngine, deviceId: string | null = null): Promise<boolean> {
  await engine.ensureContext();
  engine.stopCurrentSource();

  const constraintList = buildSoundCardConstraints(deviceId);

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
      if (engine.onStatusChange) engine.onStatusChange({ type: "error", error: (lastErr as any)?.message || "Audio device unavailable" });
      throw lastErr || new Error("Could not access audio device");
    }
  }

  try {
    engine.stream = stream;
    const track = stream.getAudioTracks()[0];
    if (track) track.enabled = true;
    const settings = (track && track.getSettings) ? track.getSettings() : {};
    engine.activeDeviceId = settings.deviceId || deviceId;
    engine.isSystemAudio = false;
    engine.sourceType = 'mic';
    engine.setupAudioGraph(stream);

    if (engine.ctx && engine.ctx.state === 'suspended') {
      await engine.ctx.resume();
    }

    // Notify device changes with updated permission labels
    const devices = await engine.getAudioInputDevices();
    if (engine.onDevicesChange) engine.onDevicesChange(devices, engine.activeDeviceId);
    const label = track?.label || 'Soundcard Input';
    if (engine.onStatusChange) engine.onStatusChange({ type: 'soundcard', label });
    return true;
  } catch (err) {
    console.error('Error in audio graph setup for sound card:', err);
    if (engine.onStatusChange) engine.onStatusChange({ type: 'error', error: (err as any)?.message });
    throw err;
  }
}
