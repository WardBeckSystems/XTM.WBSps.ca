/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * System audio output capture ("Listen to whatever is playing") via getDisplayMedia.
 */

import type { XtmAudioEngine } from '../../audio-engine';

/**
 * Connect to System Audio Output
 * Uses getDisplayMedia to capture computer audio
 */
export async function connectSystemAudio(engine: XtmAudioEngine, preferredSurface: 'monitor' | 'browser' | 'window' = 'monitor'): Promise<boolean> {
  if (engine.sourceType === 'system' && engine.stream && engine.stream.active) {
    return true;
  }

  try {
    const savedSurface = (typeof localStorage !== 'undefined' && localStorage.getItem('xtm.sysaudio.surface')) || preferredSurface || 'monitor';
    // Must prompt for display media IMMEDIATELY while user activation gesture is valid!
    // Any preceding 'await' (like await ensureContext()) would discard transient user activation.
    const displayPromise = (navigator.mediaDevices as any).getDisplayMedia({
      video: {
        displaySurface: savedSurface
      },
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

    await engine.ensureContext();
    engine.stopCurrentSource();

    engine.stream = stream;
    engine.isSystemAudio = true;
    engine.activeDeviceId = null;
    engine.sourceType = 'system';
    engine.setupAudioGraph(stream);

    // Track ends when user stops sharing in browser toolbar
    audioTracks[0].onended = () => {
      engine.stopCurrentSource();
      if (engine.onStatusChange) engine.onStatusChange({ type: 'disconnected', label: 'Audio Stopped' });
    };

    if (engine.onStatusChange) engine.onStatusChange({ type: 'system', label: audioTracks[0].label || 'Computer System Audio' });
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
