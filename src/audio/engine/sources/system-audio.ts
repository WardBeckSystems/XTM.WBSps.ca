/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * System audio output capture ("Listen to whatever is playing") via getDisplayMedia.
 */

import type { XtmAudioEngine } from '../../audio-engine';
import type { BrowserTabInfo } from '../../../../WebRouter/src';

/** A track label that is only an internal capture id, not a human name. */
const isOpaqueLabel = (l: string) => !l || /^(web-contents-media-stream|screen:|window:)/i.test(l) || /^[0-9a-f-]{20,}$/i.test(l);

/**
 * Everything the browser tells us about the shared surface: the tab / window title
 * (from the video track label), the tab's origin (Capture Handle, when the page exposes it),
 * the surface type and the audio format.
 */
function describeSharedSurface(stream: MediaStream): BrowserTabInfo {
  const v = stream.getVideoTracks()[0];
  const a = stream.getAudioTracks()[0];
  const vs: any = v?.getSettings?.() || {};
  const as: any = a?.getSettings?.() || {};
  let origin: string | undefined;
  try {
    const h = (v as any)?.getCaptureHandle?.();
    if (h?.origin) origin = h.origin.replace(/^https?:\/\//, '');
  } catch (_) {}
  const surface: string = vs.displaySurface || 'browser';
  const label = v?.label || '';
  const title = !isOpaqueLabel(label) ? label
    : origin ? origin
    : surface === 'browser' ? 'Shared browser tab'
    : surface === 'window' ? 'Shared window'
    : 'Entire screen';
  return {
    title,
    surface,
    origin,
    audioLabel: a?.label || undefined,
    sampleRate: as.sampleRate,
    channelCount: as.channelCount,
    width: vs.width,
    height: vs.height,
    startedAt: Date.now(),
    live: !!a && a.readyState === 'live',
  };
}

/**
 * Connect to System Audio Output
 * Uses getDisplayMedia to capture computer audio
 */
export async function connectSystemAudio(
  engine: XtmAudioEngine,
  preferredSurface: 'monitor' | 'browser' | 'window' = 'browser',
  forcePrompt = false
): Promise<boolean> {
  if (!forcePrompt && engine.sourceType === 'system' && engine.stream && engine.stream.active) {
    return true;
  }

  try {
    const savedSurface = (typeof localStorage !== 'undefined' && localStorage.getItem('xtm.sysaudio.surface')) || preferredSurface || 'browser';
    // Must prompt for display media IMMEDIATELY while user activation gesture is valid!
    // Any preceding 'await' (like await ensureContext()) would discard transient user activation.
    const displayPromise = (navigator.mediaDevices as any).getDisplayMedia({
      video: {
        displaySurface: savedSurface === 'monitor' ? 'monitor' : 'browser'
      },
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      },
      systemAudio: 'include',
      surfaceSwitching: 'include',
      selfBrowserSurface: 'exclude',
      preferCurrentTab: false,
      monitorTypeSurfaces: 'include'
    });

    const stream: MediaStream = await displayPromise;

    const audioTracks = stream.getAudioTracks();
    // Read what was shared before the video track goes away
    const info = describeSharedSurface(stream);

    // Stop unused video track immediately to save battery and GPU cycles
    stream.getVideoTracks().forEach(track => track.stop());

    if (audioTracks.length === 0) {
      throw new Error('No audio track selected. When prompted, ensure "Share audio" is checked.');
    }

    await engine.ensureContext();
    engine.stopCurrentSource();

    engine.stream = stream;
    engine.isSystemAudio = true;
    engine.activeDeviceId = null;
    engine.sourceType = 'system';
    engine.setupAudioGraph(stream);
    engine.tabInfo = info;

    // Track ends when user stops sharing in browser toolbar
    audioTracks[0].onended = () => {
      info.live = false;
      engine.stopCurrentSource();
      if (engine.onStatusChange) engine.onStatusChange({ type: 'disconnected', label: 'Audio Stopped' });
    };

    if (engine.onStatusChange) engine.onStatusChange({ type: 'system', label: `${info.surface === 'browser' ? 'Browser Tab' : info.surface === 'window' ? 'Window' : 'Screen'}: ${info.title}`, info });
    return true;
  } catch (err: any) {
    if (err?.name === 'NotAllowedError') {
      console.info('[AudioEngine] System audio capture cancelled by user.');
    } else {
      console.warn('[AudioEngine] Error capturing system audio:', err?.message || err);
    }
    if (engine.onStatusChange) engine.onStatusChange({ type: 'error', error: err?.message });
    return false;
  }
}
