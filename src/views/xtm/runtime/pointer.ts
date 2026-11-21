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
  let logoHoldTimer: any = null;
  let logoHoldTriggered = false;
  let isDraggingKnob = false;
  let dragStartY = 0;

  const stopRepeat = () => {
    if (repeatTimer) { clearTimeout(repeatTimer); repeatTimer = null; }
    if (repeatInterval) { clearInterval(repeatInterval); repeatInterval = null; }
    if (logoHoldTimer) { clearTimeout(logoHoldTimer); logoHoldTimer = null; }
  };

  container.addEventListener('pointerdown', (e: PointerEvent) => {
    const target = e.target as Element | null;

    // Track rotary knob drag adjustments (DR knob & McCurdy attenuator)
    const knob = target?.closest('#instrument-knob, #mccurdy-vintage-knob-assembly, .wbs-vintage-knob, .mccurdy-knob');
    if (knob) {
      isDraggingKnob = true;
      dragStartY = e.clientY;
      try { (knob as any).setPointerCapture?.(e.pointerId); } catch (_) {}
    }

    const btn = target?.closest('.xtm-btn');
    if (btn) {
      e.preventDefault();
      const name = btn.getAttribute('data-btn');
      if (name) {
        host.heldButton = name;

        // Long-press detection for dial face logos (CYCLE_STYLE)
        // Holding for ~1.5s locks middle section and expands meters; quick tap cycles meter sets
        if (name === 'CYCLE_STYLE') {
          stopRepeat();
          logoHoldTriggered = false;
          logoHoldTimer = setTimeout(() => {
            logoHoldTriggered = true;
            if (host.onButtonPressed) host.onButtonPressed('TOGGLE_LOCKED_EXPANDED');
          }, 1500);
          return;
        }

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

  container.addEventListener('pointermove', (e: PointerEvent) => {
    if (isDraggingKnob && host.onButtonPressed) {
      const dy = dragStartY - e.clientY;
      if (Math.abs(dy) >= 14) {
        if (dy > 0) {
          host.onButtonPressed('UP');
        } else {
          host.onButtonPressed('DOWN');
        }
        dragStartY = e.clientY;
      }
    }
  });

  // Mouse-wheel rotation over attenuator knobs
  container.addEventListener('wheel', (e: WheelEvent) => {
    const target = e.target as Element | null;
    const knob = target?.closest('#instrument-knob, #mccurdy-vintage-knob-assembly, .wbs-vintage-knob, .mccurdy-knob');
    if (knob && host.onButtonPressed) {
      e.preventDefault();
      if (e.deltaY < 0) {
        host.onButtonPressed('UP');
      } else if (e.deltaY > 0) {
        host.onButtonPressed('DOWN');
      }
    }
  }, { passive: false });

  const handleRelease = (): void => {
    isDraggingKnob = false;
    const wasHeld = host.heldButton;
    stopRepeat();
    if (host.heldButton) {
      const name = host.heldButton;
      host.heldButton = null;

      // If user released logo without reaching long-press hold threshold, cycle meter set
      if (name === 'CYCLE_STYLE') {
        if (!logoHoldTriggered && host.onButtonPressed) {
          host.onButtonPressed('CYCLE_STYLE');
        }
        logoHoldTriggered = false;
      }

      if (host.onButtonReleased) host.onButtonReleased(name);
    }
  };

  window.addEventListener('pointerup', handleRelease);
  window.addEventListener('pointercancel', handleRelease);
}
