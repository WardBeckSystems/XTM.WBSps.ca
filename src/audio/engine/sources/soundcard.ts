/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Sound card input / microphone / loopback interface source (getUserMedia),
 * with progressive constraint fallbacks for Linux loopback devices.
 */

import type { XtmAudioEngine } from '../../audio-engine';
import { onNextGesture, resumeAudio } from '../autoplay';
import { takeParked } from '../graph';

/**
 * Microphone permission was refused: stop asking (every knob turn re-syncs the source)
 * until the user interacts with the page again or flips the site permission.
 */
let micBlocked = false;

function isPermissionDenied(err: unknown): boolean {
  const n = (err as any)?.name;
  return n === 'NotAllowedError' || n === 'SecurityError' || n === 'PermissionDeniedError';
}

async function micPermissionState(): Promise<PermissionState | 'unknown'> {
  try {
    const st = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return st.state;
  } catch {
    return 'unknown';
  }
}

function blockMic(): void {
  if (micBlocked) return;
  micBlocked = true;
  onNextGesture(() => { micBlocked = false; });
}

function deniedError(): DOMException {
  return new DOMException(
    'Microphone blocked for this site: allow it from the padlock in the address bar (Site settings → Microphone → Allow)',
    'NotAllowedError');
}

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
  autoGainControl: false,
  // as little capture buffering as the browser allows
  latency: { ideal: 0 }
} as MediaTrackConstraints;

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
  // Same input already playing: nothing to do (and no new getUserMedia)
  if (engine.sourceType === 'mic' && engine.stream?.getAudioTracks().some(t => t.readyState === 'live')
      && (!deviceId || deviceId === engine.activeDeviceId)) return true;
  engine.stopCurrentSource();

  // The same input was opened earlier and parked: reuse it, no permission round-trip
  const parked = takeParked(engine, `mic:${deviceId || 'default'}`);
  if (parked) return attachMic(engine, parked, deviceId);

  // If no input devices exist on the system, fail early cleanly without repeated candidate logs
  try {
    const available = await getAudioInputDevices();
    if (available.length === 0) {
      const notFound = new DOMException('No audio input devices detected on this system', 'NotFoundError');
      if (engine.onStatusChange) engine.onStatusChange({ type: 'error', error: notFound.message });
      throw notFound;
    }
  } catch (checkErr) {
    if ((checkErr as any)?.name === 'NotFoundError') throw checkErr;
  }

  // Already refused: don't fire another round of getUserMedia prompts/errors.
  const perm = await micPermissionState();
  if (perm === 'denied' || (micBlocked && perm !== 'granted')) {
    const err = deniedError();
    if (engine.onStatusChange) engine.onStatusChange({ type: 'error', error: err.message });
    throw err;
  }

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
      if (isPermissionDenied(err)) break; // a refusal won't change with other constraints
      console.warn('getUserMedia candidate constraint failed:', c, err);
    }
  }

  if (!stream && isPermissionDenied(lastErr)) {
    blockMic();
    const err = deniedError();
    console.info('[XTM] ' + err.message);
    if (engine.onStatusChange) engine.onStatusChange({ type: 'error', error: err.message });
    throw err;
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

  return attachMic(engine, stream, deviceId);
}

/** Make an opened input (new or parked) the playing source. */
async function attachMic(engine: XtmAudioEngine, stream: MediaStream, deviceId: string | null): Promise<boolean> {
  try {
    (stream as any).__wbsMicKey = `mic:${deviceId || 'default'}`; // parked under the key it was asked for
    engine.stream = stream;
    const track = stream.getAudioTracks()[0];
    if (track) track.enabled = true;
    const settings = (track && track.getSettings) ? track.getSettings() : {};
    engine.activeDeviceId = settings.deviceId || deviceId;
    engine.isSystemAudio = false;
    engine.sourceType = 'mic';
    engine.setupAudioGraph(stream);

    resumeAudio(engine.ctx);

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
