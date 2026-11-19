/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Storage abstraction: localStorage with persistent consent, sessionStorage otherwise. */

export function storageGetWith(persistent: () => boolean, key: string): string | null {
  try {
    if (persistent()) {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    }
    return sessionStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

export function storageSetWith(persistent: () => boolean, key: string, value: string): void {
  try {
    if (persistent()) {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  } catch (_) {}
}

export function storageRemoveBoth(key: string): void {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (_) {}
}
