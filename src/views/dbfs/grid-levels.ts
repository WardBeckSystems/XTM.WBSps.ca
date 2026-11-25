/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';

/* Horizontal reference grid levels (dBFS / LUFS targets) and which are active. */

export interface GridLevel { db: number; lineCol: string; labelCol: string; bold: boolean; label: string }

// ── Horizontal Reference Grid Lines: Solid, Refined & Less Intense ──
export const GRID_DBS: GridLevel[] = [
  { db: 6,   lineCol: 'rgba(239, 68, 68, 0.30)',   labelCol: '#ef4444', bold: true,  label: '+6 dBFS (SUM MAX)' },
  { db: 3,   lineCol: 'rgba(34, 197, 94, 0.26)',   labelCol: '#22c55e', bold: false, label: '+3 dBFS (SUM OVERLOAD)' },
  { db: 0,   lineCol: 'rgba(220, 38, 38, 0.34)',   labelCol: '#dc2626', bold: true,  label: '0 dBFS (PEAK)' },
  { db: -3,  lineCol: 'rgba(217, 119, 6, 0.26)',   labelCol: '#d97706', bold: false, label: '-3 dBFS' },
  { db: -4,  lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-4 dBFS' },
  { db: -8,  lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-8 dBFS' },
  { db: -12, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-12 dBFS' },
  { db: -14, lineCol: 'rgba(249, 115, 22, 0.30)',  labelCol: '#f97316', bold: true,  label: '-14 LUFS (STREAM)' },
  { db: -16, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-16 dBFS' },
  { db: -18, lineCol: 'rgba(74, 222, 128, 0.35)',  labelCol: '#4ade80', bold: true,  label: '-18 dBFS (0 VU)' },
  { db: -20, lineCol: 'rgba(100, 116, 139, 0.20)', labelCol: '#64748b', bold: false, label: '-20 dBFS (SMPTE)' },
  { db: -24, lineCol: 'rgba(16, 185, 129, 0.28)',  labelCol: '#10b981', bold: true,  label: '-24 LUFS (BROADCAST)' },
  { db: -28, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-28 dBFS' },
  { db: -32, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-32 dBFS' },
  { db: -36, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-36 dBFS' },
  { db: -40, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-40 dBFS' },
  { db: -44, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-44 dBFS' },
  { db: -48, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-48 dBFS' },
  { db: -52, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-52 dBFS' },
  { db: -56, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-56 dBFS' },
  { db: -60, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-60 dBFS' }
];

/** Requirement 8: 0 dBFS line only when show0DbfsLine; +3/+6 headroom only when Sum is enabled. */
export function activeGridDbs(v: DbfsView): GridLevel[] {
  return GRID_DBS.filter(g => {
    if (g.db === 0 && !v.show0DbfsLine) return false;
    if (g.db > 0 && !v.showSum) return false;
    return true;
  });
}
