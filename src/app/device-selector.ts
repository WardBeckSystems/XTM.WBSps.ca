/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Audio engine status badge, input-device list scanning and the device selector. */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';
import type { AudioSync } from './audio-sync';

/** Status badge and device-list callbacks from the audio engine. */
export function bindAudioCallbacks(ctx: AppContext, refs: DrawerControls): void {
  const { audio } = ctx;
  const { drawerSourceBadge, selectDevice } = refs;

  audio.onStatusChange = (status) => {
    if (!drawerSourceBadge) return;
    if (status.type === 'soundcard') {
      drawerSourceBadge.textContent = 'Source: ' + (status.label || 'Soundcard Input');
      drawerSourceBadge.style.color = '#7df9ff';
    } else if (status.type === 'system') {
      drawerSourceBadge.textContent = 'Source: ' + (status.label || 'Computer System Audio');
      drawerSourceBadge.style.color = '#7df9ff';
    } else if (status.type === 'test') {
      drawerSourceBadge.textContent = 'Source: ' + status.label;
      drawerSourceBadge.style.color = '#ffd152';
    } else if (status.type === 'error') {
      drawerSourceBadge.textContent = 'Source Error: ' + (status.error || 'Connection Failed');
      drawerSourceBadge.style.color = '#ff4d4f';
    } else if (status.type === 'disconnected') {
      drawerSourceBadge.textContent = 'Source: Audio Stopped';
      drawerSourceBadge.style.color = '#888';
    }
  };

  audio.onDevicesChange = (devices, activeId) => {
    if (!selectDevice) return;
    const currentVal = activeId || selectDevice.value;
    selectDevice.innerHTML = '<option value="">Default Soundcard Input</option>';
    devices.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || `Audio Interface ${i + 1}`;
      if (d.deviceId === currentVal) opt.selected = true;
      selectDevice.appendChild(opt);
    });
  };
}

/** Initial device scan plus re-scan on hardware change. */
export async function initDeviceScan(ctx: AppContext, refs: DrawerControls): Promise<void> {
  const { audio } = ctx;
  const { selectDevice } = refs;

  async function refreshDevices() {
    if (!selectDevice) return;
    const currentVal = selectDevice.value || audio.activeDeviceId;
    const devices = await audio.getAudioInputDevices();
    selectDevice.innerHTML = '<option value="">Default Soundcard Input</option>';
    devices.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || `Audio Interface ${i + 1}`;
      if (d.deviceId === currentVal) opt.selected = true;
      selectDevice.appendChild(opt);
    });
  }

  try {
    await refreshDevices();
  } catch (_) {}

  if (navigator.mediaDevices && navigator.mediaDevices.ondevicechange !== undefined) {
    navigator.mediaDevices.ondevicechange = refreshDevices;
  }
}

/** Picking a device forces Analog mode and connects that soundcard. */
export function initDeviceSelector(ctx: AppContext, refs: DrawerControls, sync: AudioSync): void {
  const { model, audio } = ctx;
  const { selectDevice, drawerSourceBadge } = refs;
  if (!selectDevice) return;

  selectDevice.addEventListener('change', async () => {
    const selectedId = selectDevice.value || null;
    sync.isAudioStarted = true;

    const optText = selectDevice.options[selectDevice.selectedIndex]?.text || 'Soundcard Input';
    if (drawerSourceBadge) {
      drawerSourceBadge.textContent = 'Connecting: ' + optText + '...';
      drawerSourceBadge.style.color = '#ffd152';
    }

    if (model.mode !== 'A') {
      model.mode = 'A';
      model.a.src = 0;
      model.saveEEPROM();
    }

    sync.lastModeKey = 'A:' + selectedId;

    try {
      await audio.connectSoundCard(selectedId);
      if (drawerSourceBadge) {
        drawerSourceBadge.textContent = 'Source: ' + optText;
        drawerSourceBadge.style.color = '#7df9ff';
      }
      model.flash('CARD IN');
      audio.setReferenceLevel(model.getActiveReferenceLevel(), (model.mode as string) === 'D');
      sync.nudgeSens(model);
    } catch (err: any) {
      const isNotFound = err?.name === 'NotFoundError' || err?.message?.includes('not found') || err?.message?.includes('detected');
      if (!isNotFound) {
        console.error('Failed to connect selected device:', err);
      }
      if (drawerSourceBadge) {
        drawerSourceBadge.textContent = isNotFound
          ? 'Source: Calibrated Internal Tone (No Audio Input Devices)'
          : 'Device Error: ' + (err?.message || 'Cannot access device');
        drawerSourceBadge.style.color = isNotFound ? '#38bdf8' : '#ff4d4f';
      }
      // Fallback to internal test tone
      audio.setToneCalibration(-18);
      audio.startTestGenerator('sine1k');
    }
  });
}
