#!/usr/bin/env python3
"""
WBS Test Point Inserter & Virtual Audio Patchbay (HTML Router + Live VU Bridge)
Supports selecting ANY available PulseAudio/PipeWire source or monitor as input,
plus Full Restart and Emergency 'Abandon Ship' teardown.
"""

import http.server
import json
import math
import os
import signal
import socketserver
import struct
import subprocess
import threading
import time
from urllib.parse import urlparse

PORT = 8467

MANAGED_MODULES = []
METER_LEVELS = {"left_db": -60.0, "right_db": -60.0, "left_vu": 0.0, "right_vu": 0.0}
ACTIVE_ROUTES = {
    "meter_tap": True,
    "insert_stage": True,
    "speaker_split": True,
    "test_point_split": True,
}
PHYSICAL_SINK = ""
SELECTED_SOURCE = "wbs_input_bus.monitor"
AVAILABLE_SOURCES = []
SHUTDOWN_EVENT = threading.Event()
STATE_LOCK = threading.Lock()


def run_cmd(cmd):
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.returncode, res.stdout.strip(), res.stderr.strip()


def list_sources():
    """Returns list of dicts: [{'name': ..., 'description': ...}]"""
    code, out, _ = run_cmd(["pactl", "list", "sources"])
    sources = []
    if code != 0:
        return sources

    current_name = None
    current_desc = None
    for line in out.splitlines():
        s = line.strip()
        if s.startswith("Name: "):
            if current_name:
                sources.append({"name": current_name, "description": current_desc or current_name})
            current_name = s.split("Name: ", 1)[1].strip()
            current_desc = None
        elif s.startswith("Description: "):
            current_desc = s.split("Description: ", 1)[1].strip()

    if current_name:
        sources.append({"name": current_name, "description": current_desc or current_name})
    return sources


def refresh_sources():
    global AVAILABLE_SOURCES, SELECTED_SOURCE
    srcs = list_sources()
    AVAILABLE_SOURCES = srcs
    names = {s["name"] for s in srcs}
    if SELECTED_SOURCE not in names:
        if "wbs_input_bus.monitor" in names:
            SELECTED_SOURCE = "wbs_input_bus.monitor"
        elif srcs:
            SELECTED_SOURCE = srcs[0]["name"]


def detect_physical_sink():
    _, default_sink, _ = run_cmd(["pactl", "get-default-sink"])
    if default_sink and not default_sink.startswith("wbs_"):
        return default_sink
    _, sinks_out, _ = run_cmd(["pactl", "list", "short", "sinks"])
    for line in sinks_out.splitlines():
        parts = line.split("\t")
        if len(parts) >= 2 and not parts[1].startswith("wbs_"):
            return parts[1]
    return ""


def move_all_streams_to(target_sink):
    if not target_sink:
        return
    _, inputs_out, _ = run_cmd(["pactl", "list", "short", "sink-inputs"])
    for line in inputs_out.splitlines():
        parts = line.split("\t")
        if parts and parts[0].isdigit():
            run_cmd(["pactl", "move-sink-input", parts[0], target_sink])


def load_module(args):
    code, out, err = run_cmd(["pactl", "load-module"] + args)
    if code == 0 and out.isdigit():
        mod_id = int(out)
        MANAGED_MODULES.append(mod_id)
        return mod_id
    print(f"[WARN] pactl load-module {' '.join(args)} failed: {err}")
    return None


def abandon_ship():
    """Complete teardown: restores hardware default sink, migrates streams, unloads all wbs_ modules."""
    global MANAGED_MODULES
    phys = detect_physical_sink() or PHYSICAL_SINK
    if phys:
        run_cmd(["pactl", "set-default-sink", phys])
        move_all_streams_to(phys)

    for mod_id in reversed(MANAGED_MODULES):
        run_cmd(["pactl", "unload-module", str(mod_id)])
    MANAGED_MODULES.clear()

    _, mods_out, _ = run_cmd(["pactl", "list", "short", "modules"])
    wbs_ids = []
    for line in mods_out.splitlines():
        parts = line.split("\t")
        if len(parts) >= 3 and "wbs_" in parts[2] and parts[0].isdigit():
            wbs_ids.append(int(parts[0]))
    for mod_id in sorted(wbs_ids, reverse=True):
        run_cmd(["pactl", "unload-module", str(mod_id)])

    print(f"[WBS] Abandon ship complete. Hardware sink restored: {phys or 'None'}")


def full_restart():
    """Tears down everything cleanly and rebuilds the entire WBS topology from zero."""
    global PHYSICAL_SINK, ACTIVE_ROUTES, SELECTED_SOURCE
    abandon_ship()
    time.sleep(0.25)

    ACTIVE_ROUTES = {
        "meter_tap": True,
        "insert_stage": True,
        "speaker_split": True,
        "test_point_split": True,
    }
    PHYSICAL_SINK = detect_physical_sink()

    sinks = [
        ("wbs_input_bus", "WBS_Input_Bus"),
        ("wbs_insert_bus", "WBS_Insert_Bus"),
        ("wbs_meter_tap", "WBS_Meter_Tap"),
        ("wbs_test_point", "WBS_Test_Point"),
    ]
    for name, desc in sinks:
        load_module([
            "module-null-sink",
            f"sink_name={name}",
            f"sink_properties=device.description={desc}",
        ])

    run_cmd(["pactl", "set-default-sink", "wbs_input_bus"])
    move_all_streams_to("wbs_input_bus")
    refresh_sources()
    SELECTED_SOURCE = "wbs_input_bus.monitor"
    apply_routes()
    print(f"[WBS] Full restart complete. Source={SELECTED_SOURCE} -> Speakers={PHYSICAL_SINK}")


def apply_routes():
    """Rebuilds WBS loopbacks using SELECTED_SOURCE as the patchbay input."""
    _, mods_out, _ = run_cmd(["pactl", "list", "short", "modules"])
    for line in mods_out.splitlines():
        parts = line.split("\t")
        if len(parts) >= 3 and parts[1] == "module-loopback" and "wbs_" in parts[2]:
            run_cmd(["pactl", "unload-module", parts[0]])

    src = SELECTED_SOURCE or "wbs_input_bus.monitor"

    # Guard against accidental self-loop on meter_tap or insert_stage
    if ACTIVE_ROUTES["meter_tap"] and src != "wbs_meter_tap.monitor":
        load_module([
            "module-loopback",
            f"source={src}",
            "sink=wbs_meter_tap",
            "latency_msec=20",
        ])

    insert_active = ACTIVE_ROUTES["insert_stage"] and (src != "wbs_insert_bus.monitor")
    if insert_active:
        load_module([
            "module-loopback",
            f"source={src}",
            "sink=wbs_insert_bus",
            "latency_msec=20",
        ])

    post_source = "wbs_insert_bus.monitor" if insert_active else src

    # Acoustic Feedback Guard: Never route a physical microphone into physical speakers!
    is_microphone = not src.endswith(".monitor")
    if ACTIVE_ROUTES["speaker_split"] and PHYSICAL_SINK and post_source != f"{PHYSICAL_SINK}.monitor":
        if is_microphone:
            print(f"[FEEDBACK GUARD] Protecting speakers: microphone source '{src}' will not be routed to physical speakers '{PHYSICAL_SINK}'.")
        else:
            load_module([
                "module-loopback",
                f"source={post_source}",
                f"sink={PHYSICAL_SINK}",
                "latency_msec=20",
            ])

    if ACTIVE_ROUTES["test_point_split"] and post_source != "wbs_test_point.monitor":
        load_module([
            "module-loopback",
            f"source={post_source}",
            "sink=wbs_test_point",
            "latency_msec=20",
        ])


def meter_reader_loop():
    chunk_frames = 1024
    bytes_per_read = chunk_frames * 4
    vu_l = 0.0
    vu_r = 0.0

    while not SHUTDOWN_EVENT.is_set():
        proc = subprocess.Popen(
            [
                "parec",
                "--device=wbs_meter_tap.monitor",
                "--format=s16le",
                "--rate=48000",
                "--channels=2",
                "--latency-msec=25",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        try:
            while not SHUTDOWN_EVENT.is_set():
                data = proc.stdout.read(bytes_per_read)
                if not data or len(data) < bytes_per_read:
                    break
                samples = struct.unpack(f"<{chunk_frames * 2}h", data)
                sum_l = 0.0
                sum_r = 0.0
                for i in range(0, len(samples), 2):
                    l_norm = samples[i] / 32768.0
                    r_norm = samples[i + 1] / 32768.0
                    sum_l += l_norm * l_norm
                    sum_r += r_norm * r_norm

                rms_l = math.sqrt(sum_l / chunk_frames)
                rms_r = math.sqrt(sum_r / chunk_frames)

                vu_l = 0.72 * vu_l + 0.28 * rms_l
                vu_r = 0.72 * vu_r + 0.28 * rms_r

                db_l = 20 * math.log10(max(vu_l, 1e-5))
                db_r = 20 * math.log10(max(vu_r, 1e-5))

                METER_LEVELS["left_db"] = round(db_l, 1)
                METER_LEVELS["right_db"] = round(db_r, 1)
                METER_LEVELS["left_vu"] = round(db_l + 18.0, 1)
                METER_LEVELS["right_vu"] = round(db_r + 18.0, 1)
        except Exception:
            pass
        finally:
            proc.terminate()
            time.sleep(0.3)


HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>WBS Test Point Inserter & Audio Router</title>
<style>
  :root {
    --wbs-blue: #1a3b5c;
    --wbs-panel: #10253a;
    --wbs-bezel: #0b1622;
    --accent-orange: rgb(244, 144, 44);
    --text-light: #e6eef5;
  }
  * { box-sizing: border-box; font-family: 'Segoe UI', system-ui, monospace; }
  body {
    margin: 0; background: #0c131a; color: var(--text-light);
    display: flex; justify-content: center; padding: 24px;
  }
  .rack-unit {
    width: 100%; max-width: 980px; background: var(--wbs-blue);
    border: 3px solid #2b547e; border-radius: 6px; padding: 20px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.65);
  }
  .header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid #2b547e; padding-bottom: 12px; margin-bottom: 16px;
    gap: 12px; flex-wrap: wrap;
  }
  .header h1 { margin: 0; font-size: 1.15rem; letter-spacing: 1.5px; text-transform: uppercase; }
  .badge {
    background: var(--wbs-panel); padding: 6px 12px; border-radius: 4px;
    font-size: 0.82rem; border: 1px solid #356596;
  }
  .source-bar {
    background: var(--wbs-panel); border: 1px solid #2d5985; border-radius: 5px;
    padding: 12px 14px; margin-bottom: 18px; display: flex; align-items: center;
    justify-content: space-between; gap: 12px; flex-wrap: wrap;
  }
  .source-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 280px; }
  .source-label { font-weight: 700; font-size: 0.85rem; letter-spacing: 0.8px; color: #b9d3ea; }
  select.source-select {
    flex: 1; padding: 8px 10px; border-radius: 4px; border: 1px solid #3c6e9e;
    background: var(--wbs-bezel); color: #fff; font-size: 0.85rem;
  }
  .refresh-btn {
    background: #234363; color: #e6eef5; border: 1px solid #3c6e9e;
    padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;
  }
  .refresh-btn:hover { background: #2d5985; }
  .meters-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;
  }
  .vu-housing {
    background: var(--wbs-bezel); padding: 14px; border-radius: 6px;
    border: 2px solid #223b54; text-align: center;
  }
  .vu-label { font-size: 0.85rem; letter-spacing: 1px; margin-bottom: 8px; color: #a8c4de; }
  svg.vu-svg { width: 100%; height: auto; display: block; border-radius: 3px; }
  .readout { margin-top: 6px; font-size: 0.85rem; color: #8fb4d6; }
  .matrix-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;
  }
  .node-card {
    background: var(--wbs-panel); border: 1px solid #2d5985; border-radius: 5px;
    padding: 14px; display: flex; flex-direction: column; justify-content: space-between;
  }
  .node-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; color: #fff; }
  .node-desc { font-size: 0.78rem; color: #9cb9d4; margin-bottom: 14px; line-height: 1.35; }
  button.patch-btn {
    width: 100%; padding: 10px; border: none; border-radius: 4px; cursor: pointer;
    font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
    background: #243b53; color: #829ab1; transition: 0.15s;
  }
  button.patch-btn.active {
    background: var(--accent-orange); color: #111;
    box-shadow: 0 0 12px rgba(244, 144, 44, 0.45);
  }
  .flow-bar {
    background: var(--wbs-bezel); padding: 12px 16px; border-radius: 4px;
    font-size: 0.82rem; color: #b9d3ea; display: flex; justify-content: space-between;
    align-items: center; border: 1px solid #234363; gap: 12px; flex-wrap: wrap;
  }
  .controls-group { display: flex; gap: 10px; }
  .restart-btn {
    background: #1f6feb; color: #fff; border: none; padding: 8px 14px;
    border-radius: 4px; cursor: pointer; font-weight: 700; letter-spacing: 0.6px;
  }
  .restart-btn:hover { background: #388bfd; }
  .abandon-btn {
    background: #b62324; color: #fff; border: 2px solid #ff7b72; padding: 8px 16px;
    border-radius: 4px; cursor: pointer; font-weight: 800; letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  .abandon-btn:hover { background: #da3633; }
  .offline-banner {
    display: none; background: #3d1214; border: 2px solid #f85149; color: #ffdcd7;
    padding: 16px; border-radius: 5px; text-align: center; font-weight: 700;
    margin-bottom: 18px; letter-spacing: 0.8px;
  }
</style>
</head>
<body>
<div class="rack-unit">
  <div class="offline-banner" id="offline-banner">
    ABANDON SHIP EXECUTED — ALL WBS VIRTUAL BUSES UNLOADED &amp; HARDWARE SINK RESTORED.
  </div>

  <div class="header">
    <h1>WBS Test Point Inserter // Virtual Audio Router</h1>
    <div class="badge" id="sink-info">OUT: Detecting...</div>
  </div>

  <div class="source-bar">
    <div class="source-left">
      <span class="source-label">PATCH INPUT SOURCE:</span>
      <select class="source-select" id="source-select" onchange="changeSource(this.value)"></select>
    </div>
    <button class="refresh-btn" onclick="refreshSourceList()">SCAN SOURCES</button>
  </div>

  <div class="meters-row">
    <div class="vu-housing">
      <div class="vu-label">CHANNEL 1 (LEFT) — WBS METER TAP</div>
      <svg class="vu-svg" viewBox="0 0 320 175">
        <rect x="0" y="0" width="320" height="175" fill="#f5f0e1"/>
        <path d="M 45 120 A 135 135 0 0 1 215 86" fill="none" stroke="#1b1b1b" stroke-width="2.5"/>
        <path d="M 215 86 A 135 135 0 0 1 275 120" fill="none" stroke="#c92a2a" stroke-width="4.5"/>
        <text x="42" y="108" font-size="11" fill="#1b1b1b" font-weight="bold">-20</text>
        <text x="92" y="83" font-size="11" fill="#1b1b1b" font-weight="bold">-10</text>
        <text x="148" y="72" font-size="11" fill="#1b1b1b" font-weight="bold">-5</text>
        <text x="208" y="74" font-size="12" fill="#c92a2a" font-weight="bold">0</text>
        <text x="262" y="106" font-size="11" fill="#c92a2a" font-weight="bold">+3</text>
        <text x="160" y="118" text-anchor="middle" font-size="15" font-weight="bold" fill="#222">VU</text>
        <g id="needle-l" transform="rotate(-42 160 195)">
          <line x1="160" y1="195" x2="160" y2="58" stroke="#c92a2a" stroke-width="2.4" stroke-linecap="round"/>
        </g>
        <rect x="0" y="148" width="320" height="27" fill="#18222d"/>
      </svg>
      <div class="readout" id="readout-l">-60.0 dBFS | -42.0 VU</div>
    </div>

    <div class="vu-housing">
      <div class="vu-label">CHANNEL 2 (RIGHT) — WBS METER TAP</div>
      <svg class="vu-svg" viewBox="0 0 320 175">
        <rect x="0" y="0" width="320" height="175" fill="#f5f0e1"/>
        <path d="M 45 120 A 135 135 0 0 1 215 86" fill="none" stroke="#1b1b1b" stroke-width="2.5"/>
        <path d="M 215 86 A 135 135 0 0 1 275 120" fill="none" stroke="#c92a2a" stroke-width="4.5"/>
        <text x="42" y="108" font-size="11" fill="#1b1b1b" font-weight="bold">-20</text>
        <text x="92" y="83" font-size="11" fill="#1b1b1b" font-weight="bold">-10</text>
        <text x="148" y="72" font-size="11" fill="#1b1b1b" font-weight="bold">-5</text>
        <text x="208" y="74" font-size="12" fill="#c92a2a" font-weight="bold">0</text>
        <text x="262" y="106" font-size="11" fill="#c92a2a" font-weight="bold">+3</text>
        <text x="160" y="118" text-anchor="middle" font-size="15" font-weight="bold" fill="#222">VU</text>
        <g id="needle-r" transform="rotate(-42 160 195)">
          <line x1="160" y1="195" x2="160" y2="58" stroke="#c92a2a" stroke-width="2.4" stroke-linecap="round"/>
        </g>
        <rect x="0" y="148" width="320" height="27" fill="#18222d"/>
      </svg>
      <div class="readout" id="readout-r">-60.0 dBFS | -42.0 VU</div>
    </div>
  </div>

  <div class="matrix-grid">
    <div class="node-card">
      <div>
        <div class="node-title">1. WBS METER TAP</div>
        <div class="node-desc">Parallel mult from selected source into <code>wbs_meter_tap</code>.</div>
      </div>
      <button class="patch-btn active" id="btn-meter_tap" onclick="toggleRoute('meter_tap')">ACTIVE</button>
    </div>

    <div class="node-card">
      <div>
        <div class="node-title">2. WBS INSERT STAGE</div>
        <div class="node-desc">Routes selected source through <code>wbs_insert_bus</code> (Off = Bypass).</div>
      </div>
      <button class="patch-btn active" id="btn-insert_stage" onclick="toggleRoute('insert_stage')">ACTIVE</button>
    </div>

    <div class="node-card">
      <div>
        <div class="node-title">3. SPEAKER SPLITTER</div>
        <div class="node-desc">Splitter Leg A feeding your physical speakers / monitor controller.</div>
      </div>
      <button class="patch-btn active" id="btn-speaker_split" onclick="toggleRoute('speaker_split')">ACTIVE</button>
    </div>

    <div class="node-card">
      <div>
        <div class="node-title">4. WBS TEST POINT</div>
        <div class="node-desc">Splitter Leg B feeding <code>wbs_test_point.monitor</code> for analysis/capture.</div>
      </div>
      <button class="patch-btn active" id="btn-test_point_split" onclick="toggleRoute('test_point_split')">ACTIVE</button>
    </div>
  </div>

  <div class="flow-bar">
    <span id="chain-summary"><strong>CHAIN:</strong> [Source] &rarr; [Meters + WBS Insert] &rarr; Speakers &amp; <code>wbs_test_point</code></span>
    <div class="controls-group">
      <button class="restart-btn" onclick="fullRestart()">FULL RESTART</button>
      <button class="abandon-btn" onclick="abandonShip()">ABANDON SHIP</button>
    </div>
  </div>
</div>

<script>
let abandoned = false;
let lastSourcesSignature = "";

function vuToAngle(vu) {
  const clamped = Math.max(-20, Math.min(3, vu));
  return -42 + ((clamped + 20) / 23) * 84;
}

function renderSourceOptions(sources, selected) {
  const sig = JSON.stringify(sources) + "::" + selected;
  if (sig === lastSourcesSignature) return;
  lastSourcesSignature = sig;

  const sel = document.getElementById('source-select');
  sel.innerHTML = "";
  for (const s of sources) {
    const opt = document.createElement('option');
    opt.value = s.name;
    const isMon = s.name.endsWith('.monitor');
    const prefix = isMon ? '🎧 [Monitor · Safe] ' : '🎤 [Mic/Input] ';
    opt.textContent = `${prefix}${s.description} (${s.name})`;
    if (s.name === selected) opt.selected = true;
    sel.appendChild(opt);
  }
}

async function pollStatus() {
  if (abandoned) return;
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    document.getElementById('sink-info').textContent = 'SPEAKERS: ' + (data.physical_sink || 'None');
    renderSourceOptions(data.sources || [], data.selected_source || '');

    document.getElementById('chain-summary').innerHTML =
      `<strong>CHAIN:</strong> <code>${data.selected_source}</code> &rarr; [Meters + WBS Insert] &rarr; Speakers &amp; <code>wbs_test_point</code>`;

    const lAngle = vuToAngle(data.meters.left_vu);
    const rAngle = vuToAngle(data.meters.right_vu);
    document.getElementById('needle-l').setAttribute('transform', `rotate(${lAngle.toFixed(1)} 160 195)`);
    document.getElementById('needle-r').setAttribute('transform', `rotate(${rAngle.toFixed(1)} 160 195)`);

    document.getElementById('readout-l').textContent = `${data.meters.left_db.toFixed(1)} dBFS | ${data.meters.left_vu.toFixed(1)} VU`;
    document.getElementById('readout-r').textContent = `${data.meters.right_db.toFixed(1)} dBFS | ${data.meters.right_vu.toFixed(1)} VU`;

    for (const [key, enabled] of Object.entries(data.routes)) {
      const btn = document.getElementById('btn-' + key);
      if (btn) {
        btn.classList.toggle('active', enabled);
        btn.textContent = enabled ? 'ACTIVE' : 'BYPASSED';
      }
    }
  } catch (e) {}
}

async function refreshSourceList() {
  if (abandoned) return;
  await fetch('/api/refresh_sources', {method: 'POST'});
  lastSourcesSignature = "";
  pollStatus();
}

async function changeSource(sourceName) {
  if (abandoned || !sourceName) return;
  await fetch('/api/set_source', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({source: sourceName})
  });
  pollStatus();
}

async function toggleRoute(key) {
  if (abandoned) return;
  await fetch('/api/toggle', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({route: key})
  });
  pollStatus();
}

async function fullRestart() {
  if (abandoned) return;
  document.getElementById('sink-info').textContent = 'RESTARTING BUSES...';
  await fetch('/api/restart', {method: 'POST'});
  lastSourcesSignature = "";
  pollStatus();
}

async function abandonShip() {
  abandoned = true;
  document.getElementById('offline-banner').style.display = 'block';
  document.getElementById('sink-info').textContent = 'OFFLINE (HARDWARE RESTORED)';
  document.getElementById('needle-l').setAttribute('transform', 'rotate(-42 160 195)');
  document.getElementById('needle-r').setAttribute('transform', 'rotate(-42 160 195)');
  try {
    await fetch('/api/abandon', {method: 'POST'});
  } catch (e) {}
}

setInterval(pollStatus, 80);
pollStatus();
</script>
</body>
</html>
"""


class WBSHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_UI.encode("utf-8"))
        elif parsed.path == "/api/status":
            with STATE_LOCK:
                payload = {
                    "physical_sink": PHYSICAL_SINK,
                    "selected_source": SELECTED_SOURCE,
                    "sources": AVAILABLE_SOURCES,
                    "routes": ACTIVE_ROUTES,
                    "meters": METER_LEVELS,
                }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length else "{}"

        if parsed.path == "/api/set_source":
            global SELECTED_SOURCE
            data = json.loads(body)
            new_src = data.get("source", "")
            with STATE_LOCK:
                valid = {s["name"] for s in AVAILABLE_SOURCES}
                if new_src in valid:
                    SELECTED_SOURCE = new_src
                    apply_routes()
            self.send_response(200)
            self.end_headers()
        elif parsed.path == "/api/refresh_sources":
            with STATE_LOCK:
                refresh_sources()
            self.send_response(200)
            self.end_headers()
        elif parsed.path == "/api/toggle":
            data = json.loads(body)
            route = data.get("route")
            with STATE_LOCK:
                if route in ACTIVE_ROUTES:
                    ACTIVE_ROUTES[route] = not ACTIVE_ROUTES[route]
                    apply_routes()
            self.send_response(200)
            self.end_headers()
        elif parsed.path == "/api/restart":
            with STATE_LOCK:
                full_restart()
            self.send_response(200)
            self.end_headers()
        elif parsed.path == "/api/abandon":
            self.send_response(200)
            self.end_headers()
            SHUTDOWN_EVENT.set()
            threading.Thread(target=self._shutdown_sequence, daemon=True).start()
        else:
            self.send_response(404)
            self.end_headers()

    def _shutdown_sequence(self):
        time.sleep(0.15)
        with STATE_LOCK:
            abandon_ship()
        os._exit(0)


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def handle_sigterm(signum, frame):
    SHUTDOWN_EVENT.set()
    with STATE_LOCK:
        abandon_ship()
    os._exit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, handle_sigterm)
    signal.signal(signal.SIGINT, handle_sigterm)

    print("[WBS] Initializing virtual buses and test point splitters...")
    with STATE_LOCK:
        full_restart()

    t = threading.Thread(target=meter_reader_loop, daemon=True)
    t.start()

    server = ThreadingHTTPServer(("127.0.0.1", PORT), WBSHandler)
    print(f"[WBS] HTML Router & VU Bridge running at: http://127.0.0.1:{PORT}")
    print("[WBS] Select any source in the UI, hit FULL RESTART, or ABANDON SHIP.")
    server.serve_forever()