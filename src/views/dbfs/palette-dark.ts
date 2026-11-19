/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/* Dark (default) scope palette, matching APK.audio & broadcast mastering standard. */

export function createDarkPalette(): Record<string, string> {
  return {
    bg: '#07090c',
    grid: '#1a202c',
    gridTime: '#141824',
    gridRef: '#15803d',         // -18 dBFS digital reference
    gridTargetBrd: '#10b981',    // -24 LUFS EBU R128 / ATSC A/85 broadcast target
    gridTargetStr: '#f97316',    // -14 LUFS Streaming target (Orange dotted line with orange text)
    gridWarn: '#d97706',        // -3 dBFS headroom warning
    gridClip: '#dc2626',        // 0 dBFS ceiling
    textMuted: '#64748b',
    textCyan: '#ffffff',        // Ch A (Left Peak - White)
    textGold: '#ef4444',        // Ch B (Right Peak - Red)
    textSum: '#22c55e',         // Left + Right Sum (Forest Green)
    textDiff: '#06b6d4',        // L + (-R) Difference (Cyan)
    textLufs: '#f4902c',        // Momentary Loudness (LUFS) - R244 G144 B44
    textLufsS: '#c084fc',       // Short-term Loudness (LUFS)
    textInteg: '#34d399',       // Integrated Loudness (LUFS)
    lineL: '#ffffff',           // Left Channel is White
    lineR: '#ef4444',           // Right Channel is Red
    lineSum: '#22c55e',         // Left + Right Sum is Forest Green
    lineDiff: '#06b6d4',        // L + (-R) Difference is Cyan
    lineLufs: '#f4902c',
    fillL: 'rgba(255, 255, 255, 0.08)',
    fillR: 'rgba(239, 68, 68, 0.08)',
    fillSum: 'rgba(34, 197, 94, 0.09)',
    fillDiff: 'rgba(6, 182, 212, 0.08)',
    fillLufs: 'rgba(244, 144, 44, 0.14)'
  };
}
