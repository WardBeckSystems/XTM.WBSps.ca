/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** 2-digit 7-segment SVG renderer (McCurdy RANGE readout). */

export interface SegWindow { x: number; y: number; w: number; h: number }

const SEG: Record<string, string> = {
  '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd',
  '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g', ' ': '',
  '-1': 'bcg', '┫': 'bcg', '=': 'bcg'
};

/** Parse a string into 2 display characters, supporting stemmed -1 for negative teens (-10 to -19). */
export function parseTwoDigits(text: string): [string, string] {
  const trimmed = text.trim();
  // Negative teen (-10 to -19): first digit is stemmed 1 ('bcg'), second digit is units
  const teenMatch = trimmed.match(/^-1(\d)$/);
  if (teenMatch) {
    return ['-1', teenMatch[1]!];
  }
  // Single-digit negative (-1 to -9): first digit is '-', second digit is units
  const singleNegMatch = trimmed.match(/^-(\d)$/);
  if (singleNegMatch) {
    return ['-', singleNegMatch[1]!];
  }
  // Standard two characters
  const s = text.padStart(2);
  const len = s.length;
  return [s[len - 2]!, s[len - 1]!];
}

export function renderSevenSeg(text: string, W: SegWindow): string {
  const dw = 34, dh = 48, t = 6, gap = 14;
  const x0 = W.x + (W.w - (2 * dw + gap)) / 2, y0 = W.y + (W.h - dh) / 2;
  const on = '#ff2d1f', off = 'rgba(255,45,31,0.09)';
  let out = '';
  parseTwoDigits(text).forEach((ch, i) => {
    const x = x0 + i * (dw + gap) + 3, y = y0, h2 = dh / 2;
    const segs: Record<string, [number, number, number, number]> = {
      a: [x + t / 2, y, dw - t, t], d: [x + t / 2, y + dh - t, dw - t, t], g: [x + t / 2, y + h2 - t / 2, dw - t, t],
      f: [x - t / 2 + 1, y + t / 2, t, h2 - t], b: [x + dw - t / 2 - 1, y + t / 2, t, h2 - t],
      e: [x - t / 2 + 1, y + h2 + t / 2, t, h2 - t], c: [x + dw - t / 2 - 1, y + h2 + t / 2, t, h2 - t]
    };
    const lit = SEG[ch] ?? '';
    for (const k of 'abcdefg') {
      const r = segs[k]!;
      out += `<rect x="${r[0].toFixed(1)}" y="${r[1].toFixed(1)}" width="${r[2]}" height="${r[3]}" rx="2" fill="${lit.includes(k) ? on : off}" transform="skewX(-6)" transform-origin="${(x + dw / 2).toFixed(1)} ${(y + h2).toFixed(1)}"/>`;
    }
  });
  return out;
}
