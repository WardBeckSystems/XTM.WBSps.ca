/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * MXL flow as a real meter source: pulls the flow's samples from the host
 * (/api/mxl/flow/<id>/pcm) and runs them through the same block processor as a
 * soundcard, so the XTM-4 needles, POD-22, loudness (LUFS), phase and the dBFS scope
 * all follow the flow, not just a pair of level numbers.
 */

import type { XtmAudioEngine } from '../../audio-engine';

const BLOCK = 1024; // same block size the loudness / ballistics time constants assume
const POLL_MS = 40;

export interface MxlFlowFeed {
  baseUrl: string;
  flowId: string;
  stop(): void;
}

export async function connectMxlFlow(engine: XtmAudioEngine, baseUrl: string, flowId: string, label?: string): Promise<boolean> {
  await engine.ensureContext();
  engine.stopCurrentSource(); // one source at a time: this also ends any previous feed

  let stopped = false;
  let busy = false;
  let cursor = -1;
  let pendL = new Float32Array(0);
  let pendR = new Float32Array(0);
  const url = `${baseUrl.replace(/\/$/, '')}/api/mxl/flow/${encodeURIComponent(flowId)}/pcm`;

  const push = (l: Float32Array, r: Float32Array) => {
    const nl = new Float32Array(pendL.length + l.length); nl.set(pendL); nl.set(l, pendL.length);
    const nr = new Float32Array(pendR.length + r.length); nr.set(pendR); nr.set(r, pendR.length);
    let o = 0;
    while (nl.length - o >= BLOCK) {
      engine.processAudioBlockBuffers(nl.subarray(o, o + BLOCK), nr.subarray(o, o + BLOCK));
      o += BLOCK;
    }
    pendL = nl.slice(o);
    pendR = nr.slice(o);
  };

  const tick = async () => {
    if (stopped || busy) return;
    busy = true;
    try {
      const res = await fetch(`${url}?since=${cursor}&max=9600`, { cache: 'no-store' });
      if (stopped) return;
      if (!res.ok) return;
      const next = Number(res.headers.get('X-Cursor'));
      const nch = Math.max(1, Number(res.headers.get('X-Channels')) || 2);
      const frames = Number(res.headers.get('X-Frames')) || 0;
      if (Number.isFinite(next)) cursor = next;
      if (frames > 0) {
        const all = new Float32Array(await res.arrayBuffer());
        const l = all.subarray(0, frames);
        const r = nch > 1 ? all.subarray(frames, frames * 2) : l;
        if (!stopped) push(l, r);
      }
    } catch (_) {
      // host not reachable: keep trying, meters fall back to silence
    } finally {
      busy = false;
    }
  };

  const timer = window.setInterval(tick, POLL_MS);
  tick();

  engine.mxlFeed = {
    baseUrl,
    flowId,
    stop() {
      stopped = true;
      window.clearInterval(timer);
    },
  };
  engine.sourceType = 'mxl';
  engine.activeDeviceId = null;
  if (engine.onStatusChange) engine.onStatusChange({ type: 'mxl', label: label || flowId, flowId });
  return true;
}
