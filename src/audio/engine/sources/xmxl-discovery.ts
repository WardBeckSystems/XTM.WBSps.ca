/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Local XMXL / EBU DMF Shared-Memory Instance Auto-Discovery Engine
 *
 * Scans local loopback ports (127.0.0.1 / localhost) to detect and monitor
 * active Ward-Beck Systems and CBC/Radio-Canada MXL instances:
 * - Port 8467: Ward-Beck Audio Tab & MXL Engine (/api/mxl, /api/status, /api/stream/meters)
 * - Port 9600: CBC/Radio-Canada MXL Test Generator (/domains)
 * - Port 9601: CBC/Radio-Canada MXL WebRTC Receiver (/openapi.json)
 * - Port 9602: CBC/Radio-Canada MXL Clip / File Player (/openapi.json)
 * - Port 9699: CBC/Radio-Canada MXL Domain Info GUI (/get-domains)
 * - Port 8040: Ward-Beck Systems MXL DSP Micro-Server Host (wbs_mxl_host)
 * - Port 8100: BareMetal Audio / NMOS IS-04 Broadcast Supervisor (/status)
 */

export interface XmxlFlowInfo {
  flowId: string;
  label: string;
  mediaType: string;
  sampleRate: number;
  channelCount: number;
  bufferLength: number;
  quantum: number;
  writeHead?: number;
  writeSeq?: number;
  taiTimestampNs?: number;
  shmPath?: string;
  overrunCount?: number;
  underrunCount?: number;
}

export interface XmxlInstance {
  id: string;
  name: string;
  type: 'wbs-router' | 'mxl-generator' | 'mxl-receiver' | 'mxl-player' | 'mxl-gui' | 'wbs-dsp' | 'apk-node' | 'nmos-node' | 'dante-node' | 'ravenna-node' | 'aes67-node' | 'moip-node';
  port: number;
  baseUrl: string;
  domainId?: string;
  domainLabel?: string;
  flows: XmxlFlowInfo[];
  activeSource?: string;
  status: 'online' | 'degraded' | 'offline';
  latencyMs: number;
  lastSeen: number;
  selectedFlowId?: string;
}

interface ProbeTarget {
  port: number;
  path: string;
  type: XmxlInstance['type'];
  defaultName: string;
  method?: 'GET' | 'POST';
}

const CANDIDATE_TARGETS: ProbeTarget[] = [
  { port: 8467, path: '/api/mxl', type: 'wbs-router', defaultName: 'WARD BECK TAP (MXL Engine)' },
  { port: 9600, path: '/domains', type: 'mxl-generator', defaultName: 'CBC MXL Test Generator' },
  { port: 9601, path: '/openapi.json', type: 'mxl-receiver', defaultName: 'CBC MXL WebRTC Receiver' },
  { port: 9602, path: '/openapi.json', type: 'mxl-player', defaultName: 'CBC MXL Clip / File Player' },
  { port: 9699, path: '/openapi.json', type: 'mxl-gui', defaultName: 'CBC MXL Domain Info GUI' },
  { port: 8040, path: '/api/status', type: 'wbs-dsp', defaultName: 'Ward-Beck MXL DSP Micro-Server' },
  { port: 8100, path: '/status', type: 'apk-node', defaultName: 'BareMetal Audio Supervisor' },
];

let discoveredInstances: XmxlInstance[] = [];
let selectedInstanceId: string | null = null;
let changeCallbacks: Array<(instances: XmxlInstance[]) => void> = [];
let discoveryTimer: any = null;
let activeEventSource: EventSource | null = null;
let isScanning = false;

/** Returns the currently cached active XMXL instances */
export function getActiveXmxlInstances(): XmxlInstance[] {
  return [...discoveredInstances];
}

/** Returns the currently selected XMXL instance */
export function getSelectedXmxlInstance(): XmxlInstance | null {
  if (!discoveredInstances.length) return null;
  if (selectedInstanceId) {
    const found = discoveredInstances.find((i) => i.id === selectedInstanceId);
    if (found) return found;
  }
  // Default to Ward-Beck Audio Tab (8467) or the first available
  return discoveredInstances.find((i) => i.port === 8467) || discoveredInstances[0];
}

/** Set the active instance by ID */
export function setSelectedXmxlInstance(id: string): void {
  selectedInstanceId = id;
  notifyChange();
}

/** Register a callback for when instance list changes */
export function onXmxlInstancesChanged(cb: (instances: XmxlInstance[]) => void): () => void {
  changeCallbacks.push(cb);
  cb(getActiveXmxlInstances());
  return () => {
    changeCallbacks = changeCallbacks.filter((c) => c !== cb);
  };
}

function notifyChange(): void {
  const list = getActiveXmxlInstances();
  for (const cb of changeCallbacks) {
    try {
      cb(list);
    } catch (e) {
      console.warn('XMXL change callback error:', e);
    }
  }
}

/** Helper to fetch with a strict timeout and PNA headers */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 450): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: ctrl.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/** Probes a single candidate port and extracts XMXL metadata */
async function probeTarget(target: ProbeTarget): Promise<XmxlInstance | null> {
  const hosts = ['127.0.0.1', 'localhost'];
  for (const host of hosts) {
    const t0 = performance.now();
    const baseUrl = `http://${host}:${target.port}`;
    const url = `${baseUrl}${target.path}`;

    try {
      const res = await fetchWithTimeout(url, { method: target.method || 'GET' }, 450);
      if (!res.ok && res.status !== 200 && res.status !== 204) continue;

      const latencyMs = Math.round(performance.now() - t0);
      let data: any = {};
      try {
        data = await res.json();
      } catch (_) {
        data = {};
      }

      const instance: XmxlInstance = {
        id: `xmxl-${target.port}`,
        name: target.defaultName,
        type: target.type,
        port: target.port,
        baseUrl,
        flows: [],
        status: 'online',
        latencyMs,
        lastSeen: Date.now(),
      };

      // Custom metadata enrichment based on port
      if (target.port === 8467) {
        // WARD BECK TAP with MXL Engine
        instance.name = 'WARD BECK TAP (MXL Engine)';
        if (data.domain_id) instance.domainId = data.domain_id;
        if (data.active_source) instance.activeSource = data.active_source;
        const mainFlows: XmxlFlowInfo[] = [];
        if (Array.isArray(data.flows)) {
          mainFlows.push(...data.flows.map((f: any) => ({
            flowId: f.flow_id || 'unknown',
            label: f.label || f.flow_id,
            mediaType: f.media_type || 'audio/float32',
            sampleRate: f.sample_rate || 48000,
            channelCount: f.channel_count || 2,
            bufferLength: f.buffer_length || 480000,
            quantum: f.quantum || 256,
            writeHead: f.write_head || 0,
            writeSeq: f.write_seq || 0,
            taiTimestampNs: f.tai_timestamp_ns || 0,
            shmPath: f.shm_path || '',
            overrunCount: f.overrun_count || 0,
            underrunCount: f.underrun_count || 0,
          })));
        }
        // Also include all flows from data.domains["Ward-Beck Test Signals"]
        const testDom = data.domains?.['Ward-Beck Test Signals'];
        if (testDom && Array.isArray(testDom.flows)) {
          for (const tf of testDom.flows) {
            const fid = tf.id || tf.flow_id;
            if (!mainFlows.some((mf) => mf.flowId === fid)) {
              mainFlows.push({
                flowId: fid,
                label: `⚡ ${tf.label || fid} (${tf.description || 'Test Signal'})`,
                mediaType: tf.media_type || 'audio/float32',
                sampleRate: typeof tf.sample_rate === 'object' ? (tf.sample_rate.numerator || 48000) : (tf.sample_rate || 48000),
                channelCount: tf.channel_count || 2,
                bufferLength: tf.buffer_length || 480000,
                quantum: tf.quantum || 256,
                shmPath: tf.path || '',
              });
            }
          }
        }
        instance.flows = mainFlows;
      } else if (target.port === 9600) {
        // CBC MXL Test Generator
        instance.name = 'CBC/Radio-Canada MXL Test Generator';
        if (Array.isArray(data.domains) && data.domains.length > 0) {
          instance.domainId = data.domains[0].id || 'exercise-4';
          instance.domainLabel = data.domains[0].label || data.domains[0].description;
          instance.flows = [
            {
              flowId: 'mxl-test-sine',
              label: 'MXL 48kHz Calibrated Generator',
              mediaType: 'audio/float32',
              sampleRate: 48000,
              channelCount: 2,
              bufferLength: 480000,
              quantum: 256,
            },
          ];
        }
      } else if (target.port === 9601) {
        instance.name = 'CBC/Radio-Canada MXL Receiver Demo';
        instance.domainId = 'exercise-4';
        if (data?.info?.title) instance.name = data.info.title;
      } else if (target.port === 9602) {
        instance.name = 'CBC/Radio-Canada MXL File / Clip Player';
        instance.domainId = 'exercise-4';
        if (data?.info?.title) instance.name = data.info.title;
        instance.flows = [
          {
            flowId: 'mxl-clip-audio',
            label: 'MXL High-Def Media Clip Playback',
            mediaType: 'audio/float32',
            sampleRate: 48000,
            channelCount: 2,
            bufferLength: 480000,
            quantum: 256,
          },
        ];
      } else if (target.port === 9699) {
        instance.name = 'CBC/Radio-Canada MXL Domain Info GUI';
        instance.domainId = 'exercise-4';
        if (data?.info?.title) instance.name = data.info.title;
      } else if (target.port === 8100) {
        instance.name = 'BareMetal Audio / NMOS IS-04 Supervisor';
        if (data?.node) instance.name = `BareMetal Audio (${data.node})`;
      } else if (target.port === 8040) {
        instance.name = 'Ward-Beck Systems MXL DSP Host (wbs_mxl_host)';
        instance.domainId = 'domain-wbs-dmf-01';
      }

      return instance;
    } catch (_) {
      // Continue to next host fallback
    }
  }

  return null;
}

interface NmosProbeTarget {
  host: string;
  port: number;
  type: 'nmos-node';
  defaultName: string;
}

const NMOS_TARGETS: NmosProbeTarget[] = [
  { host: '44.44.44.158', port: 80, type: 'nmos-node', defaultName: 'WBS-32me (uNet2500)' },
  { host: 'WBS-32me.local', port: 80, type: 'nmos-node', defaultName: 'WBS-32me' },
];

/** Probes local daemon (port 8467 /api/nmos) for discovered NMOS announcements */
async function probeNmosFromHost(): Promise<XmxlInstance[]> {
  const hosts = ['127.0.0.1', 'localhost'];
  for (const host of hosts) {
    try {
      const res = await fetchWithTimeout(`http://${host}:8467/api/nmos`, { method: 'GET' }, 600);
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.nodes || !Array.isArray(data.nodes) || data.nodes.length === 0) continue;

      return data.nodes.map((n: any) => {
        const nodeLbl = n.node?.hostname || n.node?.label || n.ip;
        return {
          id: `nmos-${n.ip.replace(/\./g, '-')}`,
          name: `NMOS IS-04: ${nodeLbl} (${n.node?.label || 'AES67 / ST 2110-30'})`,
          type: 'nmos-node' as const,
          port: n.port || 80,
          baseUrl: `http://${n.ip}:${n.port}`,
          domainId: 'nmos-is04',
          domainLabel: 'NMOS IS-04 Broadcast Network',
          status: 'online' as const,
          latencyMs: 6,
          lastSeen: Date.now(),
          flows: (n.flows || []).map((flw: any) => {
            const channels = parseInt(flw.tags?.channels?.[0] || '8', 10);
            const rate = parseInt(flw.tags?.clockRate?.[0] || '48000', 10);
            const fmt = flw.tags?.encodingName?.[0] || 'L24';
            return {
              flowId: flw.id,
              label: `${flw.label || flw.id.substring(0, 8)} (${channels}ch ${fmt} @ ${rate}Hz)`,
              mediaType: `audio/${fmt}`,
              sampleRate: rate,
              channelCount: channels,
              bufferLength: 480000,
              quantum: 256,
            };
          }),
        };
      });
    } catch (_) {}
  }
  return [];
}

/** Directly probes hardware NMOS node on the broadcast subnet (e.g. 44.44.44.158) */
async function probeDirectNmos(target: NmosProbeTarget): Promise<XmxlInstance | null> {
  const url = `http://${target.host}:${target.port}/x-nmos/v1.0/node/self`;
  try {
    const res = await fetchWithTimeout(url, { method: 'GET' }, 700);
    if (!res.ok) return null;
    const self = await res.json();
    let flows: XmxlFlowInfo[] = [];

    try {
      const fRes = await fetchWithTimeout(`http://${target.host}:${target.port}/x-nmos/v1.0/node/flows`, { method: 'GET' }, 700);
      if (fRes.ok) {
        const fData = await fRes.json();
        if (Array.isArray(fData)) {
          flows = fData.map((flw: any) => {
            const channels = parseInt(flw.tags?.channels?.[0] || '8', 10);
            const rate = parseInt(flw.tags?.clockRate?.[0] || '48000', 10);
            const fmt = flw.tags?.encodingName?.[0] || 'L24';
            return {
              flowId: flw.id,
              label: `${flw.label || flw.id.substring(0, 8)} (${channels}ch ${fmt} @ ${rate}Hz)`,
              mediaType: `audio/${fmt}`,
              sampleRate: rate,
              channelCount: channels,
              bufferLength: 480000,
              quantum: 256,
            };
          });
        }
      }
    } catch (_) {}

    return {
      id: `nmos-${target.host.replace(/[\.:]/g, '-')}`,
      name: `NMOS IS-04: ${self.hostname || self.label || target.defaultName}`,
      type: 'nmos-node' as const,
      port: target.port,
      baseUrl: `http://${target.host}:${target.port}`,
      domainId: 'nmos-is04',
      domainLabel: 'NMOS IS-04 Broadcast Network',
      flows,
      status: 'online' as const,
      latencyMs: 10,
      lastSeen: Date.now(),
    };
  } catch (_) {
    return null;
  }
}

/** Probes local host daemon (port 8467 /api/aoip) for Dante, Ravenna, AES67, and MoipBuddy nodes */
async function probeAoipFromHost(): Promise<XmxlInstance[]> {
  const hosts = ['127.0.0.1', 'localhost'];
  for (const host of hosts) {
    try {
      const res = await fetchWithTimeout(`http://${host}:8467/api/aoip`, { method: 'GET' }, 700);
      if (!res.ok) continue;
      const data = await res.json();
      const instances: XmxlInstance[] = [];

      // 1. Dante Devices & Channels
      const danteDevs = data.dante?.devices || [];
      for (const d of danteDevs) {
        instances.push({
          id: `dante-${d.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: `Dante: ${d.name} (${d.manufacturer || 'Audinate DCM'} 16ch)`,
          type: 'dante-node',
          port: d.port || 4440,
          baseUrl: `http://${d.ip}:${d.port || 4440}`,
          domainId: 'dante-aoip',
          domainLabel: 'Audinate Dante Broadcast Network',
          status: 'online',
          latencyMs: 1,
          lastSeen: Date.now(),
          flows: [
            { flowId: `${d.name}-Ch1-Ch2`, label: `${d.name} Ch 1-2 (2ch L24 @ 48000Hz)`, mediaType: 'audio/L24', sampleRate: 48000, channelCount: 2, bufferLength: 480000, quantum: 256 },
            { flowId: `${d.name}-Ch3-Ch4`, label: `${d.name} Ch 3-4 (2ch L24 @ 48000Hz)`, mediaType: 'audio/L24', sampleRate: 48000, channelCount: 2, bufferLength: 480000, quantum: 256 },
            { flowId: `${d.name}-Ch5-Ch8`, label: `${d.name} Ch 5-8 (4ch L24 @ 48000Hz)`, mediaType: 'audio/L24', sampleRate: 48000, channelCount: 4, bufferLength: 480000, quantum: 256 },
            { flowId: `${d.name}-Ch9-Ch16`, label: `${d.name} Ch 9-16 (8ch L24 @ 48000Hz)`, mediaType: 'audio/L24', sampleRate: 48000, channelCount: 8, bufferLength: 480000, quantum: 256 },
          ],
        });
      }

      // 2. Ravenna RTSP Streams
      const ravStreams = data.ravenna?.streams || [];
      if (ravStreams.length > 0) {
        instances.push({
          id: 'ravenna-archwave',
          name: `Ravenna: WBS-32me (Archwave uNet2500)`,
          type: 'ravenna-node',
          port: 554,
          baseUrl: 'rtsp://44.44.44.158:554',
          domainId: 'ravenna-aes67',
          domainLabel: 'Ravenna / AES67 Media Network',
          status: 'online',
          latencyMs: 5,
          lastSeen: Date.now(),
          flows: ravStreams.map((s: any) => ({
            flowId: s.name,
            label: `${s.name} (8ch L24 @ 48000Hz RTSP)`,
            mediaType: 'audio/L24',
            sampleRate: 48000,
            channelCount: 8,
            bufferLength: 480000,
            quantum: 256,
          })),
        });
      }

      // 3. AES67 SAP Multicast Bus
      const sapList = data.aes67_sap?.active_announcements || [];
      if (sapList.length > 0) {
        instances.push({
          id: 'aes67-sap-bus',
          name: `AES67: SAP Multicast (239.69.1.1)`,
          type: 'aes67-node',
          port: 5004,
          baseUrl: 'rtp://239.69.1.1:5004',
          domainId: 'aes67-sap',
          domainLabel: 'AES67 Session Announcement Bus',
          status: 'online',
          latencyMs: 4,
          lastSeen: Date.now(),
          flows: sapList.map((sap: any) => ({
            flowId: sap.session_name,
            label: `${sap.session_name} (2ch L24 @ 48000Hz PTP)`,
            mediaType: 'audio/L24',
            sampleRate: 48000,
            channelCount: 2,
            bufferLength: 480000,
            quantum: 256,
          })),
        });
      }

      // 4. LikeDotAudio MoipBuddy & Dante Plugin Gateway
      instances.push({
        id: 'likedotaudio-moip',
        name: `LikeDotAudio: MoipBuddy AoIP Gateway`,
        type: 'moip-node',
        port: 8467,
        baseUrl: 'https://github.com/LikeDotAudio/APK.softapp.EDITORS.MoipBuddy',
        domainId: 'likedotaudio-moip',
        domainLabel: 'LikeDotAudio AoIP Ecosystem',
        status: 'online',
        latencyMs: 2,
        lastSeen: Date.now(),
        flows: [
          { flowId: 'moip-virtual-master', label: 'MoipBuddy Master AoIP Flow (Dante + Ravenna)', mediaType: 'audio/float32', sampleRate: 48000, channelCount: 2, bufferLength: 480000, quantum: 256 },
        ],
      });

      return instances;
    } catch (_) {}
  }
  return [];
}

/** Executes an active scan across all candidate ports */
export async function scanXmxlInstances(): Promise<XmxlInstance[]> {
  if (isScanning) return discoveredInstances;
  isScanning = true;

  try {
    const probePromises = CANDIDATE_TARGETS.map((t) => probeTarget(t));
    const [probeResults, hostNmos, hostAoip] = await Promise.all([
      Promise.all(probePromises),
      probeNmosFromHost(),
      probeAoipFromHost(),
    ]);
    // Direct probe of the hardware node is plain http on the LAN: an https page
    // (ward-beck.ca) can never load it (mixed content), so only try it from an http
    // page and only when the local daemon (localhost is exempt) reported nothing.
    const canProbeLan = typeof location === 'undefined' || location.protocol !== 'https:';
    const directNmos = hostNmos.length === 0 && canProbeLan ? await probeDirectNmos(NMOS_TARGETS[0]) : null;

    const validInstances = probeResults.filter((r): r is XmxlInstance => r !== null);
    const nmosNodes = hostNmos.length > 0 ? hostNmos : (directNmos ? [directNmos] : []);
    for (const n of nmosNodes) {
      if (!validInstances.some((inst) => inst.id === n.id)) {
        validInstances.push(n);
      }
    }
    for (const a of hostAoip) {
      if (!validInstances.some((inst) => inst.id === a.id)) {
        validInstances.push(a);
      }
    }

    // Add dedicated Ward-Beck Test Signals MXL Domain instance if flows are discovered
    const tapInst = validInstances.find((i) => i.port === 8467);
    if (tapInst && tapInst.flows.some((f) => f.label.startsWith('⚡'))) {
      const testFlows = tapInst.flows.filter((f) => f.label.startsWith('⚡'));
      if (testFlows.length > 0 && !validInstances.some((i) => i.id === 'xmxl-wbs-test-signals')) {
        validInstances.push({
          id: 'xmxl-wbs-test-signals',
          name: 'Ward-Beck Test Signals (MXL Domain)',
          type: 'wbs-router',
          port: 8467,
          baseUrl: tapInst.baseUrl,
          domainId: 'domain-wbs-test-signals',
          domainLabel: 'Ward-Beck Test Signals',
          flows: testFlows,
          status: 'online',
          latencyMs: tapInst.latencyMs,
          lastSeen: Date.now(),
        });
      }
    }

    // Merge or update instances
    discoveredInstances = validInstances;
    notifyChange();
    return discoveredInstances;
  } finally {
    isScanning = false;
  }
}

/** Start recurring background auto-discovery loop */
export function startXmxlDiscoveryLoop(intervalMs = 4500): void {
  if (discoveryTimer) clearInterval(discoveryTimer);
  // Initial immediate scan
  scanXmxlInstances();
  discoveryTimer = setInterval(() => {
    scanXmxlInstances();
  }, intervalMs);
}

/** Stop recurring discovery loop */
export function stopXmxlDiscoveryLoop(): void {
  if (discoveryTimer) {
    clearInterval(discoveryTimer);
    discoveryTimer = null;
  }
}

/** Fetches real-time 720-bin radar waveform from an active instance */
export async function fetchMxlWaveform(instance: XmxlInstance, flowId?: string): Promise<any | null> {
  if (instance.port !== 8467) return null;
  const targetFlow = flowId || instance.selectedFlowId || 'wbs-flow-master-stereo';
  const url = `${instance.baseUrl}/api/mxl/flow/${targetFlow}/waveform`;
  try {
    const res = await fetchWithTimeout(url, { method: 'GET' }, 350);
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

/** Connects to 60 FPS SSE telemetry stream from an active instance */
export function connectXmxlStream(instance: XmxlInstance, onUpdate: (data: any) => void): () => void {
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  if (instance.port !== 8467) {
    return () => {};
  }

  try {
    const sse = new EventSource(`${instance.baseUrl}/api/stream/meters`);
    activeEventSource = sse;

    sse.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        onUpdate(d);
      } catch (_) {}
    };

    sse.onerror = (e) => {
      console.warn('XMXL SSE stream connection issue:', e);
    };

    return () => {
      sse.close();
      if (activeEventSource === sse) activeEventSource = null;
    };
  } catch (err) {
    console.warn('Could not initialize XMXL SSE stream:', err);
    return () => {};
  }
}
