/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Core audio mode synchroniser: routes the front-panel MODE/SOURCE selection to the
 * audio engine, re-asserts the reference level and nudges SENS after an input change.
 */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';
import { syncAudioCore, type AudioRoutingState } from './audio-sync-core';

export interface AudioSync extends AudioRoutingState {
  syncAudioWithHardwareMode(m: any): Promise<void>;
}

export { syncAudioCore } from './audio-sync-core';

export function createAudioSync(ctx: AppContext, refs: DrawerControls): AudioSync {
  const { audio } = ctx;

  const state: AudioSync = {
    isAudioStarted: false,
    lastModeKey: null,
    syncAudioWithHardwareMode
  };

  async function syncAudioWithHardwareMode(m: any) {
    const before = state.lastModeKey;
    await syncAudioCore(audio, m, refs, state);
    if (state.lastModeKey !== before) {
      // Source just (re)connected: re-assert the reference level
      audio.setReferenceLevel(m.getActiveReferenceLevel(), m.mode === 'D');
    }
  }

  return state;
}
