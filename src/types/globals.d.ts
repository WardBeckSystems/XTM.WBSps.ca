/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Ambient globals the app reads/writes on `window` (type information only). */

export {};

declare global {
  /** Application semver version, injected by vite.config.ts from package.json. */
  const __APP_VERSION__: string;
  /** Build / version stamp, injected by vite.config.ts. */
  const __BUILD_STAMP__: string;

  interface Window {
    /** Set once the first user gesture has unlocked audio playback. */
    audioReady?: boolean;
    /** Shared AudioContext, when one has been published globally. */
    audioContext?: AudioContext;
    /** Application entry point exposed for the page bootstrap. */
    initApp?: () => Promise<void>;
  }
}
