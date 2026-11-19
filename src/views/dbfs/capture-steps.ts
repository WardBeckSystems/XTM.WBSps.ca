/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/* Discrete capture length / capture speed steps and their slider <-> value mapping. */

// Discrete Capture Length Intervals:
// 10s, 20s, 30s, 40s, 50s, 1 min, 1 min 30, 2 min, 2 min 30, 3 min .. 10 min, then 20 min .. 1h
export const CAPTURE_STEPS = [
  { sec: 10, label: '10s' },
  { sec: 20, label: '20s' },
  { sec: 30, label: '30s' },
  { sec: 40, label: '40s' },
  { sec: 50, label: '50s' },
  { sec: 60, label: '1 min' },
  { sec: 90, label: '1 min 30' },
  { sec: 120, label: '2 min' },
  { sec: 150, label: '2 min 30' },
  { sec: 180, label: '3 min' },
  { sec: 240, label: '4 min' },
  { sec: 300, label: '5 min' },
  { sec: 360, label: '6 min' },
  { sec: 420, label: '7 min' },
  { sec: 480, label: '8 min' },
  { sec: 540, label: '9 min' },
  { sec: 600, label: '10 min' }
];

// Discrete Capture Speed Intervals in Steps (15, 30, 60, 120, 240 FPS)
export const SPEED_STEPS = [
  { fps: 60, label: '60 FPS (Eco)', warning: null },
  { fps: 120, label: '120 FPS (Standard)', warning: null },
  { fps: 240, label: '240 FPS (Default)', warning: null },
  { fps: 480, label: '480 FPS (High)', warning: null },
  { fps: 960, label: '960 FPS (Ultra)', warning: null }
];

export function sliderToSeconds(val: number | string): number {
  const idx = Math.max(0, Math.min(CAPTURE_STEPS.length - 1, Math.round(Number(val))));
  return CAPTURE_STEPS[idx].sec;
}

export function secondsToSlider(sec: number): number {
  let bestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < CAPTURE_STEPS.length; i++) {
    const diff = Math.abs(CAPTURE_STEPS[i].sec - sec);
    if (diff < minDiff) {
      minDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function formatDuration(sec: number): string {
  const step = CAPTURE_STEPS.find(s => s.sec === sec);
  if (step) return step.label;
  if (sec < 60) return sec + 's';
  const m = Math.floor(sec / 60);
  const remS = sec % 60;
  if (m >= 10) return '10 min';
  if (remS > 0) return `${m} min ${remS}`;
  return `${m} min`;
}
