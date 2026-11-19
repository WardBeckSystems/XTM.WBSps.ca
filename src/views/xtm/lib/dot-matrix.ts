/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** 5x7 dot-matrix SVG renderer (VFD display). */
import { FONT_5X7 } from './font-5x7';

export function renderDotMatrix(text: string, x: number, y: number, pitch: number, onColor: string, offColor: string): string {
  let s = '';
  const r = pitch * 0.38;
  for (let ci = 0; ci < text.length; ci++) {
    const char = text[ci] ?? ' ';
    const g = FONT_5X7[char] ?? FONT_5X7[' ']!;
    const cx = x + ci * pitch * 6.2;
    for (let row = 0; row < 7; row++) {
      const rowBits = g[row] ?? 0;
      for (let col = 0; col < 5; col++) {
        const on = (rowBits >> (4 - col)) & 1;
        s += `<circle cx="${(cx + col * pitch).toFixed(1)}" cy="${(y + row * pitch).toFixed(1)}" r="${r.toFixed(2)}" fill="${on ? onColor : offColor}"/>`;
      }
    }
  }
  return s;
}
