/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Storage / cookie consent banner and status text. */

import { configManager } from '../config/config-manager';
import { type AppContext, saveAppConfig } from './app-context';

export function initConsentBanner(ctx: AppContext): void {
  const consentBanner = document.getElementById('wbsConsentBanner');
  const btnConsentAllow = document.getElementById('btnConsentAllow');
  const btnConsentSession = document.getElementById('btnConsentSession');
  const btnResetConsent = document.getElementById('btnResetConsent');
  const consentStatusText = document.getElementById('consentStatusText');

  function updateConsentUi() {
    const state = configManager.getConsent();
    if (consentStatusText) {
      if (state === 'allowed') {
        consentStatusText.textContent = 'ALLOWED (Persistent Memory)';
        consentStatusText.style.color = '#22c55e';
      } else if (state === 'session_only') {
        consentStatusText.textContent = 'SESSION ONLY';
        consentStatusText.style.color = '#eab308';
      } else {
        consentStatusText.textContent = 'PROMPTING...';
        consentStatusText.style.color = '#38bdf8';
      }
    }
    if (consentBanner) {
      consentBanner.style.display = state === 'prompt' ? 'flex' : 'none';
    }
  }

  if (btnConsentAllow) {
    btnConsentAllow.addEventListener('click', () => {
      configManager.setConsent('allowed');
      updateConsentUi();
      saveAppConfig(ctx);
    });
  }

  if (btnConsentSession) {
    btnConsentSession.addEventListener('click', () => {
      configManager.setConsent('session_only');
      updateConsentUi();
    });
  }

  if (btnResetConsent) {
    btnResetConsent.addEventListener('click', () => {
      configManager.resetConsent();
      updateConsentUi();
    });
  }

  updateConsentUi();
}
