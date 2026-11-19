/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Storage / cookie consent state (persistent memory permission). */

import { CONSENT_KEY, type StorageConsentState } from './config-types';

export function readConsent(): StorageConsentState {
  try {
    const val = localStorage.getItem(CONSENT_KEY);
    if (val === 'allowed') return 'allowed';
    if (val === 'session_only') return 'session_only';
    return 'prompt';
  } catch (_) {
    return 'session_only';
  }
}

export function writeConsent(consent: 'allowed' | 'session_only'): void {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch (_) {}
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch (_) {}
}
