/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** PWA "Install Page as App" banner (beforeinstallprompt, iOS Add-to-Home-Screen steps). */

export function initPwaInstall(): void {
  const pwaBanner = document.getElementById('pwaInstallBanner');
  const btnPwaInstall = document.getElementById('btnPwaInstall');
  const btnPwaDismiss = document.getElementById('btnPwaDismiss');
  const pwaSubText = document.getElementById('pwaSubText');

  let deferredInstallPrompt: any = null;
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || (window.innerWidth <= 840);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  if (!pwaBanner || isStandalone) return;

  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    pwaBanner.style.display = 'block';
  });

  // Android/desktop Chrome: the banner appears only once the browser fires
  // beforeinstallprompt (above), so "Install App" always installs automatically.
  // iOS Safari has no install API, so it gets the Add-to-Home-Screen steps instead.
  if (isMobile && isIos) {
    if (pwaSubText) {
      pwaSubText.innerHTML = 'Tap the Share icon <strong>[⎋]</strong> in Safari and choose <strong>Add to Home Screen</strong>';
    }
    if (btnPwaInstall) {
      btnPwaInstall.textContent = 'How to Install';
      btnPwaInstall.addEventListener('click', () => {
        alert('To install this app on iOS:\n1. Tap the Share button in Safari (box with up arrow).\n2. Scroll down and tap "Add to Home Screen".');
      });
    }
    pwaBanner.style.display = 'block';
  }
  window.addEventListener('appinstalled', () => {
    pwaBanner.style.display = 'none';
    deferredInstallPrompt = null;
  });

  if (btnPwaInstall && !isIos) {
    btnPwaInstall.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          pwaBanner.style.display = 'none';
        }
        deferredInstallPrompt = null;
      } else {
        pwaBanner.style.display = 'none'; // no install offer available (already installed / unsupported)
      }
    });
  }

  if (btnPwaDismiss) {
    btnPwaDismiss.addEventListener('click', () => {
      pwaBanner.style.display = 'none';
    });
  }
}
