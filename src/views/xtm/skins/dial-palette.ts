/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Dial face fill + ink colour per meter kind and power state. */
import { lampFill } from './lamps/index';

/** European black PPM dial gradient */
export const BLACK_PPM_GRADIENT = `<radialGradient id="xblackppm" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="#262c36"/>
          <stop offset="35%" stop-color="#181c22"/>
          <stop offset="75%" stop-color="#0e1014"/>
          <stop offset="100%" stop-color="#050608"/>
        </radialGradient>`;

export interface DialPalette { fill: string; ink: string }

export function dialPalette(isPpm: boolean, isPowered: boolean, dialLamp: string, dialBg = 'auto'): DialPalette {
  let fill = '#171512';
  let ink = '#141008';
  if (isPpm) {
    fill = isPowered ? 'url(#xblackppm)' : '#0a0b0d';
    ink = isPowered ? '#f8fafc' : '#475569';
  } else if (isPowered) {
    if (dialBg && dialBg !== 'auto') {
      if (dialBg === 'dark_night') {
        fill = 'url(#xdark_night)';
        ink = '#f8fafc';
      } else if (dialBg === 'classic_buff') {
        fill = 'url(#xdial_buff)';
      } else if (dialBg === 'parchment') {
        fill = 'url(#xparchment)';
      } else if (dialBg === 'champagne') {
        fill = 'url(#xdial_champagne)';
      } else if (dialBg === 'slate_neutral') {
        fill = 'url(#xdial_slate)';
        ink = '#f8fafc';
      } else if (dialBg === 'pure_white') {
        fill = 'url(#xwhite)';
      } else {
        fill = lampFill(dialLamp);
        if (dialLamp === 'dark_night') ink = '#f8fafc';
      }
    } else {
      fill = lampFill(dialLamp);
      if (dialLamp === 'dark_night') ink = '#f8fafc';
    }
  } else {
    ink = '#0c0a06';
  }
  return { fill, ink };
}
