/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Export drawer section: telemetry CSV, transient-log CSV and hourly auto-export. */

import { createTelemetryRecorder, type TelemetryRecorder } from './telemetry-log';
import { downloadCsv } from './download-csv';
import { formatTelemetryCsv, formatTransientCsv } from './csv-format';

export function exportTelemetryCsv(telemetryLog: any[]): void {
  if (telemetryLog.length === 0) {
    alert('Recording telemetry... Please ensure audio is playing and try again.');
    return;
  }
  downloadCsv(formatTelemetryCsv(telemetryLog), 'WBS-Mastering-Telemetry');
}

export function exportTransientCsv(transientLog: any[]): void {
  if (transientLog.length === 0) {
    alert('Recording transients... Please play dynamic audio with sharp transients and try again.');
    return;
  }
  downloadCsv(formatTransientCsv(transientLog), 'WBS-Super-Transient-Log');
}

/** Creates the recorders and wires the export buttons; returns the recorder for the frame loop. */
export function initCsvExport(): TelemetryRecorder {
  const btnExportCsvTest = document.getElementById('btnExportCsvTest');
  const chkAutoExportHourly = document.getElementById('chkAutoExportHourly') as HTMLInputElement | null;
  const recorder = createTelemetryRecorder();
  const { telemetryLog, transientLog } = recorder;

  if (btnExportCsvTest) {
    btnExportCsvTest.addEventListener('click', () => exportTelemetryCsv(telemetryLog));
  }

  const btnExportTransientLog = document.getElementById('btnExportTransientLog');
  if (btnExportTransientLog) {
    btnExportTransientLog.addEventListener('click', () => exportTransientCsv(transientLog));
  }

  if (chkAutoExportHourly) {
    setInterval(() => {
      if (chkAutoExportHourly.checked && telemetryLog.length > 0) {
        exportTelemetryCsv(telemetryLog);
      }
    }, 3600000); // Hourly timer
  }

  return recorder;
}
