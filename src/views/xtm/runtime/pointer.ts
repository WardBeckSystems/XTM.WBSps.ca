/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Pointer handling, attached once: press on any .xtm-btn (WBS buttons and McCurdy
 * jacks), auto-repeat for held UP / DOWN, release on window pointerup / pointercancel.
 */

/** The view state the handlers read and write (read live on every event) */
export interface ButtonHost {
  heldButton: string | null;
  onButtonPressed: ((name: string) => void) | null;
  onButtonReleased: ((name: string) => void) | null;
}

const REPEAT_DELAY_MS = 300;
const REPEAT_INTERVAL_MS = 90;

export function attachPointerEvents(container: HTMLElement, host: ButtonHost): void {
  let repeatTimer: any = null;
  let repeatInterval: any = null;

  const stopRepeat = () => {
    if (repeatTimer) { clearTimeout(repeatTimer); repeatTimer = null; }
    if (repeatInterval) { clearInterval(repeatInterval); repeatInterval = null; }
  };

  container.addEventListener('pointerdown', (e: PointerEvent) => {
    const target = e.target as Element | null;
    const btn = target?.closest('.xtm-btn');
    if (btn) {
      e.preventDefault();
      const name = btn.getAttribute('data-btn');
      if (name) {
        host.heldButton = name;
        if (host.onButtonPressed) host.onButtonPressed(name);

        // Smooth auto-repeat for UP and DOWN range adjustments when held
        if (name === 'UP' || name === 'DOWN') {
          stopRepeat();
          repeatTimer = setTimeout(() => {
            repeatInterval = setInterval(() => {
              if (host.heldButton === name && host.onButtonPressed) {
                host.onButtonPressed(name);
              } else {
                stopRepeat();
              }
            }, REPEAT_INTERVAL_MS);
          }, REPEAT_DELAY_MS);
        }
      }
    }
  });

  const handleRelease = (): void => {
    stopRepeat();
    if (host.heldButton) {
      const name = host.heldButton;
      host.heldButton = null;
      if (host.onButtonReleased) host.onButtonReleased(name);
    }
  };

  window.addEventListener('pointerup', handleRelease);
  window.addEventListener('pointercancel', handleRelease);
}
