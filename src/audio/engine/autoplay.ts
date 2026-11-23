/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Browser autoplay policy: an AudioContext may only start after a user gesture.
 * resumeAudio() resumes right away when the page has already been interacted with,
 * and otherwise waits for the first click / key / touch instead of calling resume()
 * early (which Chrome refuses and logs as "The AudioContext was not allowed to start").
 */

const armed = new WeakSet<AudioContext>();

function hasUserActivation(): boolean {
  const ua = (navigator as any).userActivation;
  return ua ? !!ua.hasBeenActive : true; // no API (older Safari/Firefox): just try
}

function resumeOnGesture(ctx: AudioContext): void {
  if (armed.has(ctx)) return;
  armed.add(ctx);
  const events = ['pointerdown', 'keydown', 'touchstart'] as const;
  const go = () => {
    events.forEach((e) => window.removeEventListener(e, go, true));
    armed.delete(ctx);
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  };
  events.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true }));
}

/** Resume a suspended context now if allowed, else on the user's first gesture. */
export function resumeAudio(ctx: AudioContext | null | undefined): void {
  if (!ctx || ctx.state !== 'suspended') return;
  if (!hasUserActivation()) {
    resumeOnGesture(ctx);
    return;
  }
  ctx.resume().catch(() => resumeOnGesture(ctx));
}

/** One-shot callback on the user's next gesture (used to retry a denied permission). */
export function onNextGesture(fn: () => void): void {
  const events = ['pointerdown', 'keydown'] as const;
  const go = () => {
    events.forEach((e) => window.removeEventListener(e, go, true));
    fn();
  };
  events.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true }));
}
