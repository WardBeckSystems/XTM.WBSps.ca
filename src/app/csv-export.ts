/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Export drawer section: telemetry CSV, transient-log CSV and hourly auto-export. */

import { createTelemetryRecorder, type TelemetryRecorder } from './telemetry-log';
import { downloadCsv } from './download-csv';

/** Creates the recorders and wires the export buttons; returns the recorder for the frame loop. */
export function initCsvExport(): TelemetryRecorder {
  const btnExportCsvTest = document.getElementById('btnExportCsvTest');
  const chkAutoExportHourly = document.getElementById('chkAutoExportHourly') as HTMLInputElement | null;
  const recorder = createTelemetryRecorder();
  const { telemetryLog, transientLog } = recorder;

  function exportTelemetryCsv() {
    if (telemetryLog.length === 0) {
      alert('Recording telemetry... Please ensure audio is playing and try again.');
      return;
    }
    let csv = 'Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,LUFS_Momentary,LUFS_ShortTerm,LUFS_Integrated,LRA_LU,Phase_Correlation\n';
    for (const r of telemetryLog) {
      csv += `${r.time},${r.chA},${r.chB},${r.sum},${r.diff},${r.lufsM},${r.lufsS},${r.lufsI},${r.lra},${r.phase}\n`;
    }
    downloadCsv(csv, 'WBS-Mastering-Telemetry');
  }

  if (btnExportCsvTest) {
    btnExportCsvTest.addEventListener('click', exportTelemetryCsv);
  }

  function exportTransientCsv() {
    if (transientLog.length === 0) {
      alert('Recording transients... Please play dynamic audio with sharp transients and try again.');
      return;
    }
    let csv = 'Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,Delta_ChA_dB,Delta_ChB_dB,LUFS_Momentary\n';
    for (const r of transientLog) {
      csv += `${r.time},${r.chA},${r.chB},${r.sum},${r.diff},${r.deltaA},${r.deltaB},${r.lufsM}\n`;
    }
    downloadCsv(csv, 'WBS-Super-Transient-Log');
  }

  const btnExportTransientLog = document.getElementById('btnExportTransientLog');
  if (btnExportTransientLog) {
    btnExportTransientLog.addEventListener('click', exportTransientCsv);
  }

  if (chkAutoExportHourly) {
    setInterval(() => {
      if (chkAutoExportHourly.checked && telemetryLog.length > 0) {
        exportTelemetryCsv();
      }
    }, 3600000); // Hourly timer
  }

  return recorder;
}
