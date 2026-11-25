/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Audio engine status badge, input-device list scanning and the device selector. */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';
import type { AudioSync } from './audio-sync';
import {
  scanXmxlInstances,
  getActiveXmxlInstances,
  connectXmxlStream,
  type XmxlInstance,
} from '../audio/engine/sources/xmxl-discovery';

let linuxHostAvailable = false;
let linuxHostSse: EventSource | null = null;
let xmxlDisconnect: (() => void) | null = null;

/** Probes local Linux host daemon (WARD BECK TAP) on port 8467 */
export async function probeLinuxHost(): Promise<boolean> {
  try {
    const instances = await scanXmxlInstances();
    const hasHost = instances.some((i) => i.port === 8467);
    linuxHostAvailable = hasHost;
    return hasHost;
  } catch (_) {
    linuxHostAvailable = false;
    return false;
  }
}

/** Checks whether an audio device represents an OS loopback or monitor sink */
export function isLoopbackDevice(label: string): boolean {
  if (!label) return false;
  return /monitor|loopback|stereo mix|what u hear|blackhole|soundflower|cable output|virtual audio|stream monitor|pipewire.*sink/i.test(label);
}

/** Appends detected XMXL and NMOS instances into the device selector select element */
function appendXmxlOptions(selectDevice: HTMLSelectElement, currentVal: string | null): void {
  const instances = getActiveXmxlInstances();
  if (!instances.length) return;

  for (const inst of instances) {
    const isNmos = inst.type === 'nmos-node' || inst.domainId === 'nmos-is04';
    if (inst.flows && inst.flows.length > 0) {
      for (const flow of inst.flows) {
        const opt = document.createElement('option');
        opt.value = isNmos ? `__NMOS_${inst.id}_${flow.flowId}__` : `__XMXL_${inst.port}_${flow.flowId}__`;
        if (isNmos) {
          opt.textContent = `📡 [NMOS IS-04] ${flow.label} (${inst.name})`;
          opt.style.color = '#38bdf8';
          opt.style.fontWeight = 'bold';
        } else {
          opt.textContent = `🎛️ [XMXL ${inst.port}] ${flow.label} (${inst.domainId || 'shm'})`;
          opt.style.color = '#22c55e';
          opt.style.fontWeight = 'bold';
        }
        if (currentVal === opt.value) opt.selected = true;
        selectDevice.appendChild(opt);
      }
    } else {
      const opt = document.createElement('option');
      opt.value = isNmos ? `__NMOS_${inst.id}__` : `__XMXL_${inst.port}__`;
      opt.textContent = isNmos ? `📡 [NMOS IS-04] ${inst.name}` : `📡 [XMXL ${inst.port}] ${inst.name}`;
      opt.style.color = '#38bdf8';
      opt.style.fontWeight = 'bold';
      if (currentVal === opt.value) opt.selected = true;
      selectDevice.appendChild(opt);
    }
  }
}

/** Status badge and device-list callbacks from the audio engine. */
export function bindAudioCallbacks(ctx: AppContext, refs: DrawerControls): void {
  const { audio } = ctx;
  const { drawerSourceBadge, selectDevice } = refs;

  audio.onStatusChange = (status) => {
    if (!drawerSourceBadge) return;
    if (status.type === 'soundcard') {
      const isLoop = isLoopbackDevice(status.label || '');
      drawerSourceBadge.textContent = 'Source: ' + (status.label || 'Soundcard Input') + (isLoop ? ' (OS Loopback · Banner-Free)' : '');
      drawerSourceBadge.style.color = isLoop ? '#38bdf8' : '#7df9ff';
    } else if (status.type === 'system') {
      drawerSourceBadge.textContent = 'Source: ' + (status.label || 'Computer System Audio');
      drawerSourceBadge.style.color = '#7df9ff';
    } else if (status.type === 'mxl') {
      drawerSourceBadge.textContent = 'Source: 🎛️ MXL · ' + (status.label || status.flowId);
      drawerSourceBadge.style.color = '#22c55e';
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

    if (linuxHostAvailable) {
      const hostOpt = document.createElement('option');
      hostOpt.value = '__WBS_LINUX_HOST__';
      hostOpt.textContent = '🐧 [Linux Host Active] PipeWire & MXL Shm Bridge (Banner-Free)';
      hostOpt.style.color = '#38bdf8';
      hostOpt.style.fontWeight = 'bold';
      if (currentVal === '__WBS_LINUX_HOST__') hostOpt.selected = true;
      selectDevice.appendChild(hostOpt);
    }

    appendXmxlOptions(selectDevice, currentVal);

    devices.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      const isWbs = /wbs_meter_tap|wbs_input_bus|wbs_test_point|wbs/i.test(d.label || '');
      const isLoop = isLoopbackDevice(d.label);
      if (isWbs) {
        opt.textContent = `🎛️ [WBS Router Active] ${d.label || `WBS Bus ${i + 1}`}`;
        opt.style.color = '#86efac';
        opt.style.fontWeight = 'bold';
      } else if (isLoop) {
        opt.textContent = `🎧 [OS Loopback · Banner-Free] ${d.label || `Device ${i + 1}`}`;
        opt.style.color = '#38bdf8';
      } else {
        opt.textContent = d.label || `Audio Interface ${i + 1}`;
      }
      if (d.deviceId === currentVal) opt.selected = true;
      selectDevice.appendChild(opt);
    });
  };
}

/** Initial device scan plus re-scan on hardware change and Linux Host probing. */
export async function initDeviceScan(ctx: AppContext, refs: DrawerControls): Promise<void> {
  const { audio } = ctx;
  const { selectDevice } = refs;

  async function refreshDevices() {
    if (!selectDevice) return;
    const currentVal = selectDevice.value || audio.activeDeviceId;
    await probeLinuxHost();
    const devices = await audio.getAudioInputDevices();

    selectDevice.innerHTML = '<option value="">Default Soundcard Input</option>';

    if (linuxHostAvailable) {
      const hostOpt = document.createElement('option');
      hostOpt.value = '__WBS_LINUX_HOST__';
      hostOpt.textContent = '🐧 [Linux Host Active] PipeWire & MXL Shm Bridge (Banner-Free)';
      hostOpt.style.color = '#38bdf8';
      hostOpt.style.fontWeight = 'bold';
      if (currentVal === '__WBS_LINUX_HOST__') hostOpt.selected = true;
      selectDevice.appendChild(hostOpt);
    }

    appendXmxlOptions(selectDevice, currentVal);

    devices.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      const isWbs = /wbs_meter_tap|wbs_input_bus|wbs_test_point|wbs/i.test(d.label || '');
      const isLoop = isLoopbackDevice(d.label);
      if (isWbs) {
        opt.textContent = `🎛️ [WBS Router Active] ${d.label || `WBS Bus ${i + 1}`}`;
        opt.style.color = '#86efac';
        opt.style.fontWeight = 'bold';
      } else if (isLoop) {
        opt.textContent = `🎧 [OS Loopback · Banner-Free] ${d.label || `Device ${i + 1}`}`;
        opt.style.color = '#38bdf8';
      } else {
        opt.textContent = d.label || `Audio Interface ${i + 1}`;
      }
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

/** Picking a device forces Analog mode and connects that soundcard or Linux Host bridge. */
export function initDeviceSelector(ctx: AppContext, refs: DrawerControls, sync: AudioSync): void {
  const { model, audio } = ctx;
  const { selectDevice, drawerSourceBadge, btnBridgeOsAudio, selectSysAudioMode } = refs;

  if (selectSysAudioMode) {
    const saved = localStorage.getItem('xtm.sysaudio.surface') || 'browser';
    selectSysAudioMode.value = saved;
    selectSysAudioMode.addEventListener('change', (e: any) => {
      localStorage.setItem('xtm.sysaudio.surface', e.target.value);
    });
  }

  if (btnBridgeOsAudio) {
    btnBridgeOsAudio.addEventListener('click', async () => {
      const hasHost = await probeLinuxHost();
      if (hasHost && selectDevice) {
        selectDevice.value = '__WBS_LINUX_HOST__';
        selectDevice.dispatchEvent(new Event('change'));
        return;
      }

      const devices = await audio.getAudioInputDevices();
      const loopback = devices.find(d => isLoopbackDevice(d.label));
      if (loopback && selectDevice) {
        selectDevice.value = loopback.deviceId;
        selectDevice.dispatchEvent(new Event('change'));
      } else {
        // Open the in-app OS audio bridge styleguide
        const modal = document.getElementById('guideModal');
        const iframe = document.getElementById('guideModalIframe') as HTMLIFrameElement;
        const title = document.getElementById('guideModalTitleText');
        if (modal && iframe) {
          iframe.src = 'os-audio-bridge.html';
          if (title) title.textContent = 'OS Audio Loopback & System Bridge Guide';
          modal.style.display = 'flex';
        }
      }
    });
  }

  if (!selectDevice) return;

  // Clicking an MXL flow (Data Stream view) puts that flow on the meters.
  window.addEventListener('xtm:meter-flow', (e: Event) => {
    const { port, flowId } = (e as CustomEvent).detail || {};
    if (!port || !flowId) return;
    const value = `__XMXL_${port}_${flowId}__`;
    if (!Array.from(selectDevice.options).some((o) => o.value === value)) {
      const flow = getActiveXmxlInstances().filter((i) => i.port === port).flatMap((i) => i.flows || []).find((f) => f.flowId === flowId);
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = `🎛️ [XMXL ${port}] ${flow?.label || flowId}`;
      opt.style.color = '#22c55e';
      opt.style.fontWeight = 'bold';
      selectDevice.appendChild(opt);
    }
    selectDevice.value = value;
    selectDevice.dispatchEvent(new Event('change'));
  });

  selectDevice.addEventListener('change', async (ev: Event) => {
    const selectedId = selectDevice.value || null;
    sync.isAudioStarted = true;
    // Picked by hand from the device list (not by INPUT 1-4, which sets it in code): no input button is selected.
    if (ev.isTrusted) model.clearInput();

    // Disconnect any active Linux Host SSE stream
    if (linuxHostSse) {
      linuxHostSse.close();
      linuxHostSse = null;
    }
    if (xmxlDisconnect) {
      xmxlDisconnect();
      xmxlDisconnect = null;
    }

    if (selectedId && selectedId.startsWith('__NMOS_')) {
      audio.stopCurrentSource();
      const allInsts = getActiveXmxlInstances();
      const inst = allInsts.find((i) => selectedId.includes(i.id)) || allInsts.find((i) => i.type === 'nmos-node');
      const flow = inst?.flows?.find((f) => selectedId.includes(f.flowId)) || inst?.flows?.[0];
      const flowName = flow ? flow.label : 'AES67 / ST 2110-30';
      const nodeName = inst ? inst.name : 'WBS-32me';

      if (drawerSourceBadge) {
        drawerSourceBadge.textContent = `Source: 📡 NMOS IS-04 · ${flowName} (${nodeName})`;
        drawerSourceBadge.style.color = '#38bdf8';
      }
      if (model.mode !== 'A') {
        model.mode = 'A';
        model.a.src = 0;
        model.saveEEPROM();
      }
      sync.lastModeKey = 'A:' + selectedId;
      model.flash('NMOS IS-04');

      // Connect to telemetry stream from host daemon if online
      const routerInst = allInsts.find((i) => i.port === 8467);
      if (routerInst) {
        xmxlDisconnect = connectXmxlStream(routerInst, (d: any) => {
          if (audio.currentLevels) {
            const vuL = typeof d.left_vu === 'number' ? d.left_vu : -2;
            const vuR = typeof d.right_vu === 'number' ? d.right_vu : -2;
            const dbL = typeof d.left_db === 'number' ? d.left_db : -20;
            const dbR = typeof d.right_db === 'number' ? d.right_db : -20;

            audio.currentLevels.vu[0] = Math.pow(10, vuL / 20);
            audio.currentLevels.vu[1] = Math.pow(10, vuR / 20);
            audio.currentLevels.vuDb[0] = vuL;
            audio.currentLevels.vuDb[1] = vuR;
            audio.currentLevels.ppm[0] = Math.pow(10, dbL / 20);
            audio.currentLevels.ppm[1] = Math.pow(10, dbR / 20);
            audio.currentLevels.ppmDb[0] = dbL;
            audio.currentLevels.ppmDb[1] = dbR;
            audio.currentLevels.rmsDb[0] = dbL;
            audio.currentLevels.rmsDb[1] = dbR;
            audio.currentLevels.dbfs[0] = dbL;
            audio.currentLevels.dbfs[1] = dbR;
            audio.currentLevels.hasAudio = true;
          }
        });
      }
      return;
    }

    if (selectedId === '__WBS_LINUX_HOST__' || (selectedId && selectedId.startsWith('__XMXL_'))) {
      audio.stopCurrentSource();
      const isCustomXmxl = selectedId.startsWith('__XMXL_');
      let port = 8467;
      let flowTag = '';
      if (isCustomXmxl) {
        const body = selectedId.replace(/^__XMXL_/, '').replace(/__$/, '');
        const cut = body.indexOf('_');
        port = parseInt(cut >= 0 ? body.slice(0, cut) : body, 10) || 8467;
        flowTag = cut >= 0 ? body.slice(cut + 1) : '';
      }

      const flowInfo = flowTag
        ? getActiveXmxlInstances().filter((i) => i.port === port).flatMap((i) => i.flows || []).find((f) => f.flowId === flowTag)
        : undefined;
      if (drawerSourceBadge) {
        drawerSourceBadge.textContent = `Source: 🎛️ XMXL Node :${port} ${flowTag ? `(${flowInfo?.label || flowTag})` : ''} · Shared Memory Ring Buffer`;
        drawerSourceBadge.style.color = '#22c55e';
      }
      if (model.mode !== 'A') {
        model.mode = 'A';
        model.a.src = 0;
        model.saveEEPROM();
      }
      sync.lastModeKey = 'A:' + selectedId;
      model.flash('XMXL ' + port);

      const instance = getActiveXmxlInstances().find((i) => i.port === port) || {
        id: `xmxl-${port}`,
        name: `XMXL Port ${port}`,
        type: 'wbs-router',
        port,
        baseUrl: `http://127.0.0.1:${port}`,
        flows: [],
        status: 'online',
        latencyMs: 1,
        lastSeen: Date.now(),
      };

      const applyLevels = (d: any) => {
        if (audio.currentLevels) {
          const vuL = typeof d.left_vu === 'number' ? d.left_vu : -42;
          const vuR = typeof d.right_vu === 'number' ? d.right_vu : -42;
          const dbL = typeof d.left_db === 'number' ? d.left_db : -60;
          const dbR = typeof d.right_db === 'number' ? d.right_db : -60;

          audio.currentLevels.vu[0] = Math.pow(10, vuL / 20);
          audio.currentLevels.vu[1] = Math.pow(10, vuR / 20);
          audio.currentLevels.vuDb[0] = vuL;
          audio.currentLevels.vuDb[1] = vuR;
          const pkL = typeof d.left_peak_db === 'number' ? d.left_peak_db : dbL;
          const pkR = typeof d.right_peak_db === 'number' ? d.right_peak_db : dbR;
          audio.currentLevels.ppm[0] = Math.pow(10, pkL / 20);
          audio.currentLevels.ppm[1] = Math.pow(10, pkR / 20);
          audio.currentLevels.ppmDb[0] = pkL;
          audio.currentLevels.ppmDb[1] = pkR;
          audio.currentLevels.rmsDb[0] = dbL;
          audio.currentLevels.rmsDb[1] = dbR;
          audio.currentLevels.dbfs[0] = pkL;
          audio.currentLevels.dbfs[1] = pkR;
          audio.currentLevels.hasAudio = true;
        }
      };
      // The host carries real audio: stream the flow's samples into the engine so the
      // XTM-4, POD-22, loudness, phase and scope all take it as their source.
      if (port === 8467) {
        audio.connectMxlFlow(instance.baseUrl, flowTag || 'wbs-flow-master-stereo', flowInfo?.label || flowTag || 'Master Bus');
        return;
      }
      xmxlDisconnect = connectXmxlStream(instance as any, applyLevels);
      return;
    }

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
