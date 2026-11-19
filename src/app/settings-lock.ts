/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Settings lock overlay: hold CTRL for 5 seconds to unlock the drawer for this session. */

export function initSettingsLock(): void {
  const lockOverlay = document.getElementById('settingsLockOverlay');
  const lockProgressFill = document.getElementById('lockProgressFill');
  const lockCountdown = document.getElementById('lockCountdown');

  let isSettingsUnlocked = false;
  try {
    isSettingsUnlocked = sessionStorage.getItem('wbs_settings_unlocked') === 'true';
  } catch (_) {}

  let ctrlHeldStart: number | null = null;
  let ctrlHoldInterval: any = null;

  function updateLockUi() {
    if (isSettingsUnlocked) {
      if (lockOverlay) {
        lockOverlay.classList.add('unlocked');
        lockOverlay.classList.remove('holding-unlock');
      }
    } else {
      if (lockOverlay) {
        lockOverlay.classList.remove('unlocked');
        lockOverlay.classList.remove('holding-unlock');
      }
      if (lockProgressFill) lockProgressFill.style.width = '0%';
      if (lockCountdown) lockCountdown.textContent = '5.0s';
    }
  }

  updateLockUi();

  window.addEventListener('keydown', (e: any) => {
    if (e.key === 'Control' && !ctrlHeldStart && !isSettingsUnlocked) {
      ctrlHeldStart = performance.now();
      if (lockOverlay) lockOverlay.classList.add('holding-unlock');
      ctrlHoldInterval = setInterval(() => {
        if (!ctrlHeldStart) return;
        const elapsed = performance.now() - ctrlHeldStart;
        const pct = Math.min(100, (elapsed / 5000) * 100);
        const rem = Math.max(0, (5000 - elapsed) / 1000);
        if (lockProgressFill) lockProgressFill.style.width = pct + '%';
        if (lockCountdown) lockCountdown.textContent = rem.toFixed(1) + 's';

        if (elapsed >= 5000) {
          clearInterval(ctrlHoldInterval);
          ctrlHoldInterval = null;
          ctrlHeldStart = null;
          isSettingsUnlocked = true;
          try { sessionStorage.setItem('wbs_settings_unlocked', 'true'); } catch (_) {}
          if (lockCountdown) lockCountdown.textContent = 'UNLOCKED';
          if (lockProgressFill) lockProgressFill.style.width = '100%';
          setTimeout(() => {
            updateLockUi();
          }, 350);
        }
      }, 40);
    }
  });

  window.addEventListener('keyup', (e: any) => {
    if (e.key === 'Control' && ctrlHeldStart) {
      clearInterval(ctrlHoldInterval);
      ctrlHoldInterval = null;
      ctrlHeldStart = null;
      if (lockOverlay) lockOverlay.classList.remove('holding-unlock');
      if (lockProgressFill) lockProgressFill.style.width = '0%';
      if (lockCountdown) lockCountdown.textContent = '5.0s';
    }
  });
}
