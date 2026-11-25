/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Clock Renderer: Assembles full SVG markup and applies real-time hand
 * rotation angles at 60 FPS.
 */

import type { ClockOptions, ClockTimeComponents, ClockTheme } from './types';
import { renderClockDefs, renderClockDialFace } from './clock-shell';
import { renderClockHands } from './clock-hands';

export function renderCompleteClockSvg(options: ClockOptions): string {
  return `<svg id="clockMasterSvg" viewBox="-240 -240 480 480" width="100%" height="100%" class="clock-svg-root theme-${options.theme}" xmlns="http://www.w3.org/2000/svg">
    ${renderClockDefs()}
    ${renderClockDialFace(options.theme, options.showCueSectors)}
    ${renderClockHands(options.theme)}
  </svg>`;
}

export function computeClockTime(now: Date = new Date(), smoothSweep: boolean = true): ClockTimeComponents {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  const fracSec = smoothSweep ? (seconds + milliseconds / 1000) : seconds;
  const fracMin = minutes + fracSec / 60;
  const fracHour = (hours % 12) + fracMin / 60;

  const hourAngle = fracHour * 30; // 360 / 12
  const minuteAngle = fracMin * 6; // 360 / 60
  const secondAngle = fracSec * 6; // 360 / 60

  const hh24 = String(hours).padStart(2, '0');
  const hh12 = String(hours % 12 || 12).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const timeString24 = `${hh24}:${mm}:${ss}`;
  const timeString12 = `${hh12}:${mm}:${ss} ${ampm}`;

  const utcHH = String(now.getUTCHours()).padStart(2, '0');
  const utcMM = String(now.getUTCMinutes()).padStart(2, '0');
  const utcSS = String(now.getUTCSeconds()).padStart(2, '0');
  const utcTimeString = `${utcHH}:${utcMM}:${utcSS} UTC`;

  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const timeZoneString = Intl.DateTimeFormat().resolvedOptions().timeZone || 'LOCAL';

  return {
    hours,
    minutes,
    seconds,
    milliseconds,
    hourAngle,
    minuteAngle,
    secondAngle,
    timeString12,
    timeString24,
    utcTimeString,
    dateString,
    timeZoneString
  };
}

export function updateClockHandsDom(container: Element, time: ClockTimeComponents): void {
  const hourEl = container.querySelector('#clockHourHand');
  const minEl = container.querySelector('#clockMinuteHand');
  const secEl = container.querySelector('#clockSecondHand');

  if (hourEl) hourEl.setAttribute('transform', `rotate(${time.hourAngle.toFixed(2)} 0 0)`);
  if (minEl) minEl.setAttribute('transform', `rotate(${time.minuteAngle.toFixed(2)} 0 0)`);
  if (secEl) secEl.setAttribute('transform', `rotate(${time.secondAngle.toFixed(2)} 0 0)`);
}
