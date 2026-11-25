/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** CSV serialization for telemetry and transient event logs. */

export function formatTelemetryCsv(records: any[]): string {
  let csv = 'Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,LUFS_Momentary,LUFS_ShortTerm,LUFS_Integrated,LRA_LU,Phase_Correlation\n';
  for (const r of records) {
    csv += `${r.time},${r.chA},${r.chB},${r.sum},${r.diff},${r.lufsM},${r.lufsS},${r.lufsI},${r.lra},${r.phase}\n`;
  }
  return csv;
}

export function formatTransientCsv(records: any[]): string {
  let csv = 'Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,Delta_ChA_dB,Delta_ChB_dB,LUFS_Momentary\n';
  for (const r of records) {
    csv += `${r.time},${r.chA},${r.chB},${r.sum},${r.diff},${r.deltaA},${r.deltaB},${r.lufsM}\n`;
  }
  return csv;
}
