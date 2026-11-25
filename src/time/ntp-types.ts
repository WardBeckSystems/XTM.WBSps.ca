/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * NTP Types: Data structures representing broadcast Network Time Protocol (NTP)
 * events, precision atomic clock receipts, and server status.
 */

export interface NtpTimestampLedger {
  t1ClientTx: number;  // T1: Client request transmit timestamp (ms)
  t2ServerRx: number;  // T2: Server request receive timestamp (ms)
  t3ServerTx: number;  // T3: Server response transmit timestamp (ms)
  t4ClientRx: number;  // T4: Client response receive timestamp (ms)
}

export interface NtpReceipt {
  id: string;                     // e.g. "RC-NRC-20261122-8F3A"
  timestamp: number;              // Completion wall-clock timestamp (ms since epoch)
  server: string;                 // e.g. "time.nrc.ca" | "time.chu.nrc.ca"
  serverName: string;             // e.g. "NRC-CNRC Primary Cesium Standard (Ottawa)"
  stratum: number;                // Stratum 1 (Primary Atomic Reference)
  referenceId: string;            // "CESM" / "NRC"
  offsetMs: number;               // Measured local clock offset in ms (+ or -)
  roundTripDelayMs: number;       // Network RTT in ms
  jitterMs: number;               // Dispersion / jitter in ms
  precision: string;              // e.g. "2^-20 (~0.95 µs)"
  leapIndicator: number;          // 0 = no warning
  protocol: string;               // "NTPv4 (RFC 5905) / UDP :123"
  rootDelayMs: number;            // 0.00 ms
  rootDispersionMs: number;       // 0.04 ms
  status: 'LOCKED' | 'VERIFIED' | 'ACQUIRED';
  isoUtc: string;                 // ISO 8601 UTC string
  isoLocal: string;               // ISO 8601 Local string
  ledger: NtpTimestampLedger;     // T1 to T4 timestamps
  receiptHash: string;            // Audit integrity hash
  syncSource: 'real' | 'calibrated';
}

export interface VisibleNtpDot {
  receipt: NtpReceipt;
  x: number;
  y: number;
  radius: number;
  ageSec: number;
}
