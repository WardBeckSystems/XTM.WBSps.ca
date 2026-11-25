/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
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
  let isDraggingKnob = false;
  let dragStartY = 0;

  const stopRepeat = () => {
    if (repeatTimer) { clearTimeout(repeatTimer); repeatTimer = null; }
    if (repeatInterval) { clearInterval(repeatInterval); repeatInterval = null; }
  };

  container.addEventListener('pointerdown', (e: PointerEvent) => {
    const target = e.target as Element | null;

    // Track rotary knob drag adjustments (DR knob & McCurdy attenuator)
    const knob = target?.closest('#instrument-knob, #mccurdy-vintage-knob-assembly, .wbs-vintage-knob, .mccurdy-knob');
    // Ctrl-click (⌘ on macOS) on a knob: straight to 0 (see docs/CTRL-CLICK.md)
    if (knob && (e.ctrlKey || e.metaKey) && !e.altKey) {
      e.preventDefault();
      host.onButtonPressed?.('SENS_ZERO');
      return;
    }
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

        // Dial face logos: quick click cycles meter style, CTRL+ALT+Click toggles Dual Meter only mode (no center)
        if (name === 'CYCLE_STYLE') {
          stopRepeat();
          const isDualMeterShortcut = (e.ctrlKey || e.metaKey) && e.altKey;
          if (isDualMeterShortcut) {
            if (host.onButtonPressed) host.onButtonPressed('TOGGLE_LOCKED_EXPANDED');
            return;
          }
          if (host.onButtonPressed) host.onButtonPressed('CYCLE_STYLE');
          return;
        }

        // Ctrl-click (⌘) an INPUT button: a new pick for it (the tab: share another tab)
        if (name.startsWith('INPUT_') && (e.ctrlKey || e.metaKey) && !e.altKey) {
          host.onButtonPressed?.('NEW_' + name);
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
      if (host.onButtonReleased) host.onButtonReleased(name);
    }
  };

  window.addEventListener('pointerup', handleRelease);
  window.addEventListener('pointercancel', handleRelease);
}
