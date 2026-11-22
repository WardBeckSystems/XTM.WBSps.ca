#!/usr/bin/env python3
"""
WARD BECK TAP
=============
Virtual Audio Patchbay & Non-Destructive Signal Tap Controller Daemon (HTML Router + Live VU Bridge)
Linux Audio & MXL (Media eXchange Layer / EBU DMF) Compatible Controller
Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.

Routes Linux desktop audio (YouTube, Spotify, DAWs, Media Players) into Ward-Beck XTM-4
via isolated virtual null-sinks (100% feedback-free, banner-free, low-latency signal tap).
Includes live multi-source VU metering, matrix source tapping, calibrated test generator,
and full 3-layer Linux audio pipeline awareness (ALSA, PipeWire/WirePlumber, and
high-throughput POSIX shared-memory continuous circular ring buffers via DMF / MXL).
"""

import http.server
import json
import math
import os
import signal
import socketserver
import struct
import subprocess
import sys
import threading
import time
from urllib.parse import parse_qs, urlparse

# Ensure local modules (mxl_engine, pipeline_inspector) are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mxl_engine import MXL_ENGINE, current_tai_ns
from pipeline_inspector import inspect_alsa, inspect_full_pipeline, inspect_pipewire

PORT = 8467

MANAGED_MODULES = []
METER_LEVELS = {"left_db": -60.0, "right_db": -60.0, "left_vu": -42.0, "right_vu": -42.0}
ACTIVE_ROUTES = {
    "meter_tap": True,
    "insert_stage": True,
    "speaker_split": True,
    "test_point_split": True,
}
PHYSICAL_SINK = ""
SELECTED_SOURCE = "wbs_input_bus.monitor"
AVAILABLE_SOURCES = []
SOURCE_METERS = {}          # {source_name: {"db": float, "vu": float}}
SOURCE_THREADS = {}         # {source_name: threading.Thread}
SOURCE_PROCS = {}           # {source_name: subprocess.Popen}

TEST_TONE_ACTIVE = False
TEST_TONE_FREQ = 1000
TEST_TONE_PROC = None

SHUTDOWN_EVENT = threading.Event()
STATE_LOCK = threading.RLock()


def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=2.5)
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return -1, "", str(e)


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


def source_meter_worker(src_name):
    """Background reader thread computing live RMS, dBFS, and VU for an individual source."""
    chunk_frames = 512
    bytes_per_read = chunk_frames * 2  # s16le mono
    vu_val = 0.0

    while not SHUTDOWN_EVENT.is_set():
        proc = None
        try:
            proc = subprocess.Popen(
                [
                    "parec",
                    f"--device={src_name}",
                    "--format=s16le",
                    "--rate=24000",
                    "--channels=1",
                    "--latency-msec=35",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )
            with STATE_LOCK:
                SOURCE_PROCS[src_name] = proc

            while not SHUTDOWN_EVENT.is_set():
                data = proc.stdout.read(bytes_per_read)
                if not data or len(data) < bytes_per_read:
                    break
                samples = struct.unpack(f"<{chunk_frames}h", data)
                sum_sq = sum((s / 32768.0) ** 2 for s in samples)
                rms = math.sqrt(sum_sq / chunk_frames)

                # Smooth VU ballistic filter (300ms integration simulation)
                vu_val = 0.70 * vu_val + 0.30 * rms
                db = 20 * math.log10(max(vu_val, 1e-5))
                vu = db + 18.0

                with STATE_LOCK:
                    SOURCE_METERS[src_name] = {
                        "db": round(db, 1),
                        "vu": round(vu, 1),
                    }
        except Exception:
            pass
        finally:
            if proc:
                try:
                    proc.terminate()
                except Exception:
                    pass
            time.sleep(0.5)


def refresh_sources():
    global AVAILABLE_SOURCES, SELECTED_SOURCE
    srcs = list_sources()
    AVAILABLE_SOURCES = srcs
    names = {s["name"] for s in srcs}

    # Default to wbs_input_bus.monitor or first source
    if SELECTED_SOURCE not in names:
        if "wbs_input_bus.monitor" in names:
            SELECTED_SOURCE = "wbs_input_bus.monitor"
        elif srcs:
            SELECTED_SOURCE = srcs[0]["name"]

    # Start background meter reader threads for each detected source
    for s in srcs:
        s_name = s["name"]
        if s_name not in SOURCE_METERS:
            SOURCE_METERS[s_name] = {"db": -60.0, "vu": -42.0}
        if s_name not in SOURCE_THREADS or not SOURCE_THREADS[s_name].is_alive():
            t = threading.Thread(target=source_meter_worker, args=(s_name,), daemon=True)
            SOURCE_THREADS[s_name] = t
            t.start()


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
    """Complete teardown: restores hardware default sink, stops tone, unloads all wbs_ modules."""
    global MANAGED_MODULES
    stop_test_tone()
    try:
        MXL_ENGINE.stop()
    except Exception:
        pass

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

    # Terminate all source meter readers
    with STATE_LOCK:
        for p in SOURCE_PROCS.values():
            try:
                p.terminate()
            except Exception:
                pass
        SOURCE_PROCS.clear()

    print(f"[WARD BECK TAP] Teardown complete. Hardware sink restored: {phys or 'None'}")


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

    # Start MXL Engine continuous ring buffers
    try:
        MXL_ENGINE.start(SELECTED_SOURCE)
    except Exception as e:
        print(f"[WARN] MXL Engine start failed: {e}")

    print(f"[WARD BECK TAP] Topology active. Source={SELECTED_SOURCE} -> Speakers={PHYSICAL_SINK}")


def apply_routes():
    """Rebuilds WBS loopbacks using SELECTED_SOURCE as the patchbay input with acoustic feedback protection."""
    global MANAGED_MODULES

    loopback_ids = []
    _, mods_out, _ = run_cmd(["pactl", "list", "short", "modules"])
    for line in mods_out.splitlines():
        parts = line.split("\t")
        if len(parts) >= 2 and parts[1] == "module-loopback" and parts[0].isdigit():
            mid = int(parts[0])
            if mid in MANAGED_MODULES:
                loopback_ids.append(mid)

    for mid in reversed(loopback_ids):
        run_cmd(["pactl", "unload-module", str(mid)])
        if mid in MANAGED_MODULES:
            MANAGED_MODULES.remove(mid)

    source_is_mic = ("input" in SELECTED_SOURCE.lower() or "mic" in SELECTED_SOURCE.lower()) and not SELECTED_SOURCE.endswith(".monitor")

    # 1. Selected Source -> WBS Meter Tap
    if ACTIVE_ROUTES.get("meter_tap", True):
        load_module([
            "module-loopback",
            f"source={SELECTED_SOURCE}",
            "sink=wbs_meter_tap",
            "latency_msec=10",
        ])

    # 2. Selected Source -> WBS Insert Bus
    if ACTIVE_ROUTES.get("insert_stage", True):
        load_module([
            "module-loopback",
            f"source={SELECTED_SOURCE}",
            "sink=wbs_insert_bus",
            "latency_msec=10",
        ])

    # 3. WBS Insert Bus -> Physical Speakers (SAFEGUARDED)
    if ACTIVE_ROUTES.get("speaker_split", True) and PHYSICAL_SINK:
        if not source_is_mic:
            load_module([
                "module-loopback",
                "source=wbs_insert_bus.monitor",
                f"sink={PHYSICAL_SINK}",
                "latency_msec=10",
            ])
        else:
            print("[SAFEGUARD] Physical speaker split muted: microphone/input source tapped to avoid acoustic feedback!")

    # 4. WBS Insert Bus -> WBS Test Point
    if ACTIVE_ROUTES.get("test_point_split", True):
        load_module([
            "module-loopback",
            "source=wbs_insert_bus.monitor",
            "sink=wbs_test_point",
            "latency_msec=10",
        ])

    # Update MXL edge ingestion source
    try:
        MXL_ENGINE.set_source(SELECTED_SOURCE)
    except Exception:
        pass


def meter_reader_loop():
    """Reads raw PCM from wbs_meter_tap.monitor and calculates stereo VU ballistics."""
    global METER_LEVELS
    chunk_frames = 512
    bytes_per_read = chunk_frames * 4  # s16le stereo = 4 bytes per frame
    vu_l, vu_r = 0.0, 0.0

    while not SHUTDOWN_EVENT.is_set():
        proc = None
        try:
            proc = subprocess.Popen(
                [
                    "parec",
                    "--device=wbs_meter_tap.monitor",
                    "--format=s16le",
                    "--rate=24000",
                    "--channels=2",
                    "--latency-msec=35",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )
            while not SHUTDOWN_EVENT.is_set():
                data = proc.stdout.read(bytes_per_read)
                if not data or len(data) < bytes_per_read:
                    break
                samples = struct.unpack(f"<{chunk_frames * 2}h", data)
                left_sq = sum((samples[i] / 32768.0) ** 2 for i in range(0, len(samples), 2))
                right_sq = sum((samples[i + 1] / 32768.0) ** 2 for i in range(0, len(samples), 2))
                rms_l = math.sqrt(left_sq / chunk_frames)
                rms_r = math.sqrt(right_sq / chunk_frames)

                # Simulated 300ms mechanical needle inertia filter
                vu_l = 0.75 * vu_l + 0.25 * rms_l
                vu_r = 0.75 * vu_r + 0.25 * rms_r

                db_l = 20 * math.log10(max(vu_l, 1e-5))
                db_r = 20 * math.log10(max(vu_r, 1e-5))
                vu_left = db_l + 18.0
                vu_right = db_r + 18.0

                with STATE_LOCK:
                    METER_LEVELS = {
                        "left_db": round(db_l, 1),
                        "right_db": round(db_r, 1),
                        "left_vu": round(vu_left, 1),
                        "right_vu": round(vu_right, 1),
                    }
        except Exception:
            pass
        finally:
            if proc:
                try:
                    proc.terminate()
                except Exception:
                    pass
            time.sleep(0.5)


def start_test_tone(freq=1000):
    global TEST_TONE_ACTIVE, TEST_TONE_FREQ, TEST_TONE_PROC
    stop_test_tone()
    TEST_TONE_FREQ = int(freq)
    TEST_TONE_ACTIVE = True

    t = threading.Thread(target=_tone_stream_worker, args=(TEST_TONE_FREQ,), daemon=True)
    t.start()


def stop_test_tone():
    global TEST_TONE_ACTIVE, TEST_TONE_PROC
    TEST_TONE_ACTIVE = False
    if TEST_TONE_PROC:
        try:
            TEST_TONE_PROC.terminate()
            TEST_TONE_PROC.kill()
        except Exception:
            pass
        TEST_TONE_PROC = None


def _tone_stream_worker(freq):
    global TEST_TONE_PROC, TEST_TONE_ACTIVE
    try:
        pacat_cmd = [
            "pacat", "--playback", "--device=wbs_input_bus",
            "--format=s16le", "--rate=48000", "--channels=2",
            "--latency-msec=20", "--stream-name=Ward-Beck Test Tone"
        ]
        proc = subprocess.Popen(
            pacat_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            preexec_fn=os.setsid
        )
        TEST_TONE_PROC = proc
        rate = 48000
        amp = 32767 * 0.12589  # -18 dBFS reference level
        step = 2 * math.pi * freq / rate
        p = 0.0
        chunk = 256
        fmt = f"<{chunk * 2}h"

        while TEST_TONE_ACTIVE and proc.poll() is None:
            samples = []
            for _ in range(chunk):
                v = int(amp * math.sin(p))
                samples.extend((v, v))
                p = (p + step) % (2 * math.pi)
            raw = struct.pack(fmt, *samples)
            if proc.stdin:
                proc.stdin.write(raw)
                proc.stdin.flush()
    except (BrokenPipeError, OSError):
        pass
    except Exception as e:
        print(f"[Ward-Beck Tone] Error: {e}", file=sys.stderr)
    finally:
        if TEST_TONE_PROC:
            try:
                TEST_TONE_PROC.terminate()
            except Exception:
                pass
            TEST_TONE_PROC = None


HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>WARD BECK TAP // Signal Tap &amp; MXL Ring Buffer Controller</title>
<style>
  :root {
    --wbs-blue: #142e47;
    --wbs-panel: #0d1e2e;
    --wbs-bezel: #08131d;
    --accent-orange: rgb(244, 144, 44);
    --accent-green: #22c55e;
    --accent-cyan: #38bdf8;
    --text-light: #e6eef5;
    --text-dim: #94a3b8;
  }
  * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; }
  body {
    margin: 0; background: #070d13; color: var(--text-light);
    display: flex; justify-content: center; padding: 18px;
  }
  .rack-unit {
    width: 100%; max-width: 1200px; background: var(--wbs-blue);
    border: 3px solid #2b547e; border-radius: 8px; padding: 22px;
    box-shadow: 0 18px 50px rgba(0,0,0,0.85);
  }
  .header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid #2b547e; padding-bottom: 14px; margin-bottom: 18px;
    gap: 12px; flex-wrap: wrap;
  }
  .header h1 { margin: 0; font-size: 1.25rem; letter-spacing: 1.5px; text-transform: uppercase; color: #fff; }
  .badge-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .badge {
    background: var(--wbs-panel); padding: 5px 12px; border-radius: 4px;
    font-size: 0.78rem; border: 1px solid #356596; font-weight: 700;
  }
  .badge-active { border-color: var(--accent-green); color: var(--accent-green); }
  .badge-cyan { border-color: var(--accent-cyan); color: var(--accent-cyan); }
  .badge-orange { border-color: var(--accent-orange); color: var(--accent-orange); }

  /* Section Styling */
  .section-title {
    font-size: 0.95rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--accent-orange); margin: 24px 0 12px 0; border-left: 4px solid var(--accent-orange);
    padding-left: 10px; display: flex; justify-content: space-between; align-items: center;
  }
  .section-subtitle { font-size: 0.75rem; color: var(--text-dim); font-weight: 400; text-transform: none; }

  /* MXL 10-Second Continuous Polar Ring Visualizer (Scanalyzer Audio Eye Style) */
  .mxl-card {
    background: var(--wbs-bezel); border: 1px solid #23486a; border-radius: 6px;
    padding: 18px; margin-bottom: 20px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.6);
  }
  .eye-player-main-grid {
    display: grid;
    grid-template-columns: minmax(360px, 480px) 1fr;
    gap: 24px;
    align-items: center;
  }
  @media (max-width: 900px) {
    .eye-player-main-grid { grid-template-columns: 1fr; }
  }
  .eye-player-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .eye-canvas-container {
    position: relative;
    width: 440px;
    height: 440px;
    margin: 0 auto;
    background: #060e17;
    border: 1px solid #162d47;
    border-radius: 8px;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
  }
  #eye-player-canvas {
    width: 440px;
    height: 440px;
    display: block;
    cursor: crosshair;
  }
  .scanalyzer-phase-bar-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 420px;
    margin-top: 14px;
    font-family: monospace;
    font-size: 0.72rem;
  }
  .phase-lbl { font-weight: 800; color: #94a3b8; }
  .phase-track {
    position: relative;
    flex: 1;
    height: 16px;
    background: #09141f;
    border: 1px solid #1c3b5e;
    border-radius: 3px;
    overflow: hidden;
  }
  .phase-marker-scale {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 6px;
    font-size: 0.62rem;
    color: #64748b;
    z-index: 1;
  }
  .phase-needle {
    position: absolute;
    top: 0; bottom: 0;
    width: 6px;
    margin-left: -3px;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
    transition: left 0.08s ease-out;
  }
  .eye-info-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .eye-flow-switcher {
    background: #09141f;
    border: 1px solid #1c3b5e;
    border-radius: 6px;
    padding: 10px 14px;
  }
  .eye-hud-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .eye-hud-card {
    background: #050b11;
    border: 1px solid #162d47;
    border-radius: 6px;
    padding: 10px 12px;
  }
  .eye-hud-label {
    font-size: 0.66rem;
    color: #64748b;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .eye-hud-val {
    font-family: monospace;
    font-size: 1.05rem;
    font-weight: 800;
    color: #fff;
    margin: 4px 0 2px 0;
  }
  .eye-hud-sub {
    font-size: 0.68rem;
    color: #94a3b8;
  }
  .eye-legend-box {
    background: #09141f;
    border: 1px solid #1c3b5e;
    border-radius: 6px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.72rem;
    color: #cbd5e1;
  }
  .eye-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .legend-swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* Linear Unwrap Visualizer */
  .slice-view-box {
    margin-top: 16px; background: #050b11; border: 1px solid #1c3b5e; border-radius: 4px;
    padding: 12px; font-size: 0.75rem; display: none;
  }
  .memory-bar {
    height: 32px; background: #13273d; border-radius: 4px; position: relative;
    overflow: hidden; margin: 10px 0; display: flex; border: 1px solid #2b547e;
  }
  .slice-block {
    height: 100%; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.7rem; color: #fff;
  }
  .slice1-block { background: #0284c7; width: 35%; }
  .headroom-block { background: #0f172a; flex: 1; color: #64748b; }
  .slice2-block { background: #f97316; width: 20%; }

  /* 3-Layer Pipeline Grid */
  .pipeline-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px; margin-bottom: 20px;
  }
  .pipeline-card {
    background: var(--wbs-panel); border: 1px solid #2b547e; border-radius: 6px;
    padding: 14px; font-size: 0.8rem;
  }
  .pipeline-card h3 {
    margin: 0 0 10px 0; font-size: 0.88rem; color: #fff; display: flex;
    justify-content: space-between; align-items: center;
  }
  .pipeline-list {
    list-style: none; padding: 0; margin: 0; font-size: 0.75rem; color: var(--text-dim);
    max-height: 140px; overflow-y: auto;
  }
  .pipeline-list li {
    padding: 4px 0; border-bottom: 1px solid #183350; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }

  /* Master VU Meters */
  .vu-stage {
    background: var(--wbs-bezel); border: 2px solid #0f2438; border-radius: 6px;
    padding: 20px; margin-bottom: 20px; box-shadow: inset 0 4px 15px rgba(0,0,0,0.8);
  }
  .vu-meters-row {
    display: flex; gap: 24px; justify-content: center; align-items: center; flex-wrap: wrap;
  }
  .vu-bezel {
    background: #000; border: 3px solid #334155; border-radius: 6px;
    padding: 8px; box-shadow: 0 8px 20px rgba(0,0,0,0.9);
  }
  .vu-dial {
    width: 320px; height: 195px; background: #eed5a1; border-radius: 4px;
    position: relative; overflow: hidden;
  }
  .vu-dial svg { width: 100%; height: 100%; display: block; }
  .vu-label {
    text-align: center; margin-top: 8px; font-weight: 700; font-size: 0.85rem;
    letter-spacing: 1px; color: var(--text-dim);
  }

  /* Multi-Source Matrix Grid */
  .source-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px; margin-bottom: 20px;
  }
  .source-card {
    background: var(--wbs-panel); border: 1px solid #23486a; border-radius: 6px;
    padding: 12px; display: flex; flex-direction: column; justify-content: space-between;
    transition: all 0.15s ease;
  }
  .source-card.tapped {
    border-color: var(--accent-orange); background: #183654;
    box-shadow: 0 0 12px rgba(244, 144, 44, 0.4);
  }
  .source-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .source-name {
    font-size: 0.82rem; font-weight: 700; color: #fff; word-break: break-all;
    line-height: 1.25; margin-bottom: 4px;
  }
  .source-desc { font-size: 0.72rem; color: var(--text-dim); }
  .source-pill {
    font-size: 0.65rem; padding: 2px 6px; border-radius: 3px; font-weight: 800; text-transform: uppercase;
  }
  .pill-wbs { background: #0369a1; color: #fff; }
  .pill-monitor { background: #334155; color: #94a3b8; }
  .pill-mic { background: #b45309; color: #fff; }
  
  .mini-meter-track {
    width: 100%; height: 10px; background: #08131d; border-radius: 3px;
    overflow: hidden; margin: 10px 0 6px 0; border: 1px solid #162e47; position: relative;
  }
  .mini-meter-fill {
    height: 100%; width: 0%; background: linear-gradient(90deg, #22c55e 60%, #eab308 85%, #ef4444 100%);
    transition: width 0.08s ease;
  }
  .meter-digits {
    display: flex; justify-content: space-between; font-size: 0.68rem; color: #94a3b8; font-weight: 600;
  }

  .btn-tap {
    width: 100%; margin-top: 8px; padding: 7px; background: #162f47; border: 1px solid #2b547e;
    color: #e6eef5; border-radius: 4px; font-weight: 700; font-size: 0.75rem;
    cursor: pointer; transition: all 0.15s ease;
  }
  .btn-tap:hover { background: #23486a; color: #fff; }
  .btn-tap.tapped { background: var(--accent-orange); color: #000; border-color: #ff9d42; }

  /* Buttons & Controls */
  .controls-bar {
    display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px;
    background: var(--wbs-panel); padding: 12px; border-radius: 6px; border: 1px solid #23486a;
  }
  .ctrl-btn {
    padding: 8px 16px; background: #1b3a5a; border: 1px solid #356596; border-radius: 4px;
    color: #fff; font-weight: 700; font-size: 0.78rem; cursor: pointer; transition: all 0.15s ease;
  }
  .ctrl-btn:hover { background: #26507c; border-color: var(--accent-cyan); }
  .ctrl-btn.active { background: var(--accent-green); color: #000; border-color: #4ade80; }
  .ctrl-btn.warn { background: #991b1b; border-color: #ef4444; }
  .ctrl-btn.warn:hover { background: #b91c1c; }

  .offline-banner {
    display: none; background: #7f1d1d; border: 2px solid #ef4444; border-radius: 6px;
    padding: 14px; text-align: center; font-weight: 700; font-size: 0.95rem; margin-bottom: 16px;
    color: #fff;
  }
</style>
</head>
<body>

<div class="rack-unit">
  <!-- System Header -->
  <div class="header">
    <div>
      <h1>WARD BECK TAP // Signal Tap &amp; MXL Controller</h1>
      <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 3px;">
        Non-Destructive Signal Tap · Virtual Audio Patchbay · EBU DMF / MXL Shared Memory · Native 60 FPS Meter Telemetry
      </div>
    </div>
    <div class="badge-row">
      <div class="badge badge-active">PIPEWIRE 1.0</div>
      <div class="badge badge-cyan">ALSA HARDWARE</div>
      <div class="badge badge-orange" id="badge-mxl">MXL /dev/shm</div>
      <div class="badge" id="badge-tai">TAI: SYNCING...</div>
    </div>
  </div>

  <div class="offline-banner" id="offline-banner">
    ROUTER OFFLINE: Hardware audio sink has been cleanly restored. WBS virtual null-sinks unloaded.
  </div>

  <!-- SECTION 1: EBU DMF / MXL Continuous 10-Second Circular Ring Buffer Visualizer (Scanalyzer Audio Eye Style) -->
  <div class="section-title">
    <span>EBU DMF / MXL 10-Second Continuous Circular Ring Buffer (Float32 Stereo)</span>
    <div class="section-subtitle">
      <button class="ctrl-btn" style="padding: 4px 10px; font-size: 0.7rem;" onclick="toggleSliceView()">Toggle Memory Slice View</button>
      <button class="ctrl-btn" style="padding: 4px 10px; font-size: 0.7rem;" onclick="testSliceWrap()">Test Wrap-Around Slice (480k)</button>
    </div>
  </div>

  <div class="mxl-card">
    <div class="eye-player-main-grid">
      <!-- Left Column: Scanalyzer Eye Player Canvas & Correlation Bar -->
      <div class="eye-player-col">
        <div class="eye-canvas-container">
          <canvas id="eye-player-canvas" width="440" height="440"></canvas>
        </div>
        <!-- Scanalyzer Style Correlation & Phase Bar -->
        <div class="scanalyzer-phase-bar-wrapper">
          <span class="phase-lbl">L</span>
          <div class="phase-track">
            <div class="phase-marker-scale">
              <span>-1 out of phase</span>
              <span id="corr-val-readout">corr +0.00</span>
              <span>mono +1</span>
            </div>
            <div class="phase-needle" id="phase-needle" style="left: 50%;"></div>
          </div>
          <span class="phase-lbl">R</span>
        </div>
      </div>

      <!-- Right Column: Real-time Telemetry, NTP Clock & Flow Inspector -->
      <div class="eye-info-col">
        <!-- Flow Selector -->
        <div class="eye-flow-switcher">
          <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 6px; text-transform: uppercase; font-weight: 700;">Monitored MXL Shared-Memory Flow:</div>
          <div class="badge-row">
            <button id="btn-flow-master" class="ctrl-btn active" style="font-size: 0.75rem; padding: 4px 12px;" onclick="switchEyeFlow('wbs-flow-master-stereo')">Master Bus (Live Audio)</button>
            <button id="btn-flow-tone" class="ctrl-btn" style="font-size: 0.75rem; padding: 4px 12px;" onclick="switchEyeFlow('wbs-flow-ref-tone')">Calibrated 1kHz Ref Tone</button>
          </div>
        </div>

        <!-- Telemetry Cards -->
        <div class="eye-hud-grid">
          <div class="eye-hud-card">
            <div class="eye-hud-label">NTP TIME (UTC / SMPTE 2059-1)</div>
            <div class="eye-hud-val accent-cyan" id="eye-ntp-clock">00:00:00.000</div>
            <div class="eye-hud-sub" id="eye-tai-ns">TAI: 0 ns</div>
          </div>
          <div class="eye-hud-card">
            <div class="eye-hud-label">10-SECOND BUFFER PHASE</div>
            <div class="eye-hud-val accent-orange" id="eye-sec-10">0.000 s / 10.000 s</div>
            <div class="eye-hud-sub">0s @ Far Right (3 o'clock) · Clockwise</div>
          </div>
          <div class="eye-hud-card">
            <div class="eye-hud-label">ACTIVE WRITE HEAD</div>
            <div class="eye-hud-val" id="eye-head-index">HEAD: 0</div>
            <div class="eye-hud-sub" id="eye-head-sec">0.000s / 480,000 frames</div>
          </div>
          <div class="eye-hud-card">
            <div class="eye-hud-label">BUFFER CAPACITY &amp; SHM</div>
            <div class="eye-hud-val" style="color: #4ade80;">480,000 FRAMES (10.0s)</div>
            <div class="eye-hud-sub">Float32 Stereo · 3.84 MB POSIX Shm</div>
          </div>
        </div>

        <!-- Channel Legend & Spec -->
        <div class="eye-legend-box">
          <div class="eye-legend-item">
            <span class="legend-swatch" style="background: #22c55e;"></span>
            <span>CH 0: LEFT (Outer Radial Band, Float32 @ 48 kHz)</span>
          </div>
          <div class="eye-legend-item">
            <span class="legend-swatch" style="background: #38bdf8;"></span>
            <span>CH 1: RIGHT (Inner Radial Band, Float32 @ 48 kHz)</span>
          </div>
          <div class="eye-legend-item">
            <span class="legend-swatch" style="background: #d946ef;"></span>
            <span>Center Pointer &amp; NTP Sweep Playhead (Scanalyzer Style)</span>
          </div>
          <div class="eye-legend-item">
            <span class="legend-swatch" style="background: #ef4444;"></span>
            <span>0.0s Marker @ Far Right (3 O'clock) &amp; Top-of-Second Ticks</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Memory Slice Unwrap View -->
    <div id="slice-view-box" class="slice-view-box">
      <div style="font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
        mxlFlowReaderGetSamples() 10-Second Contiguous Memory Layout (wrappedMultiBufferSlice)
      </div>
      <div class="memory-bar">
        <div class="slice-block slice2-block" id="slice2-visual">Part 2: Seam Wrap (Frames 0..156)</div>
        <div class="slice-block headroom-block">Contiguous Unread Memory Buffer (480,000 Frames Headroom)</div>
        <div class="slice-block slice1-block" id="slice1-visual">Part 1: Tail Boundary (Frames 479900..479999)</div>
      </div>
      <div id="slice-json-details" style="font-family: monospace; font-size: 0.7rem; color: #cbd5e1; background: #000; padding: 8px; border-radius: 4px;">
        Awaiting slice test...
      </div>
    </div>
  </div>

  <!-- SECTION 2: Linux Audio 3-Layer Pipeline Architecture -->
  <div class="section-title">
    <span>Layered Linux Audio Pipeline &amp; Graph Topology</span>
    <div class="section-subtitle">Kernel ALSA · Graph PipeWire · Shared-Memory MXL</div>
  </div>

  <div class="pipeline-grid">
    <!-- Layer 1: ALSA -->
    <div class="pipeline-card">
      <h3>
        <span>1. ALSA Hardware Layer</span>
        <span class="badge badge-cyan" id="alsa-card-count">0 CARDS</span>
      </h3>
      <ul class="pipeline-list" id="alsa-card-list">
        <li>Detecting soundcards...</li>
      </ul>
      <div style="margin-top: 10px; font-size: 0.72rem; color: var(--text-dim);" id="alsa-mixers">
        Master: 49% | Capture: 42%
      </div>
    </div>

    <!-- Layer 2: PipeWire Graph -->
    <div class="pipeline-card">
      <h3>
        <span>2. PipeWire &amp; WirePlumber</span>
        <span class="badge badge-active" id="pw-quantum-badge">256 / 48kHz</span>
      </h3>
      <ul class="pipeline-list" id="pw-stream-list">
        <li>Querying active multimedia graph links...</li>
      </ul>
      <div style="margin-top: 10px; font-size: 0.72rem; color: var(--text-dim);" id="pw-status-footer">
        Latency: 5.33 ms | Routing: Active
      </div>
    </div>

    <!-- Layer 3: MXL Shared-Memory -->
    <div class="pipeline-card">
      <h3>
        <span>3. EBU DMF / MXL Layer</span>
        <span class="badge badge-orange">/dev/shm/mxl</span>
      </h3>
      <ul class="pipeline-list" id="mxl-flow-list">
        <li>domain-wbs-dmf-01 (Active)</li>
        <li>wbs-flow-master-stereo (Float32 Stereo)</li>
        <li>wbs-flow-ref-tone (1kHz Calibrated Sine)</li>
      </ul>
      <div style="margin-top: 10px; font-size: 0.72rem; color: var(--text-dim);" id="mxl-status-footer">
        Epoch: SMPTE 2059-1 (TAI) | Lock-Free PROT_READ
      </div>
    </div>
  </div>

  <!-- SECTION 3: Ward-Beck Electromechanical Master VU Meters -->
  <div class="section-title">
    <span>Ward-Beck Precision Electromechanical VU Meters</span>
    <div class="section-subtitle">Calibrated 1 kHz @ 0 VU (-18 dBFS) Reference</div>
  </div>

  <div class="vu-stage">
    <div class="vu-meters-row">
      <!-- LEFT VU METER -->
      <div class="vu-bezel">
        <div class="vu-dial">
          <svg viewBox="0 0 320 195">
            <!-- Scale background -->
            <path d="M 30 150 A 130 130 0 0 1 290 150" fill="none" stroke="#222" stroke-width="2" />
            <!-- Red zone -->
            <path d="M 235 62 A 130 130 0 0 1 285 125" fill="none" stroke="#c0392b" stroke-width="8" />
            <!-- Scale Ticks -->
            <path d="M 45 130 L 55 125 M 65 105 L 75 103 M 95 85 L 103 86 M 130 70 L 135 75 M 175 65 L 175 72 M 220 70 L 217 76 M 255 85 L 248 90 M 275 110 L 268 112" fill="none" stroke="#222" stroke-width="1.5" />
            <!-- Dial Markings -->
            <text x="50" y="145" font-size="11" font-weight="bold" fill="#222">-20</text>
            <text x="90" y="105" font-size="11" font-weight="bold" fill="#222">-10</text>
            <text x="135" y="88" font-size="11" font-weight="bold" fill="#222">-7</text>
            <text x="175" y="82" font-size="11" font-weight="bold" fill="#222">-3</text>
            <text x="215" y="88" font-size="13" font-weight="bold" fill="#222">0</text>
            <text x="250" y="105" font-size="12" font-weight="bold" fill="#c0392b">+1</text>
            <text x="270" y="130" font-size="12" font-weight="bold" fill="#c0392b">+3</text>
            <text x="160" y="125" text-anchor="middle" font-size="16" font-weight="900" letter-spacing="3" fill="#222">VU</text>
            <text x="160" y="142" text-anchor="middle" font-size="9" font-weight="bold" letter-spacing="1" fill="#666">WARD-BECK SYSTEMS</text>
            <!-- Teardrop Needle Left -->
            <g id="needle-l" transform="rotate(-42 160 195)" style="transition: transform 0.07s cubic-bezier(0.1, 0.9, 0.2, 1);">
              <!-- Needle body with teardrop counter-balance and pointer -->
              <path d="M 158.5 195 L 159.5 45 C 159.5 40 160.5 40 160.5 45 L 161.5 195 Z" fill="#111" />
              <!-- Teardrop tip -->
              <path d="M 157.5 45 Q 160 30 160 25 Q 160 30 162.5 45 Z" fill="#111" />
              <!-- Pivot Boss -->
              <circle cx="160" cy="195" r="16" fill="#111" />
              <circle cx="160" cy="195" r="6" fill="#555" />
            </g>
          </svg>
        </div>
        <div class="vu-label">CHANNEL 1 // LEFT (<span id="txt-vu-l">-42.0</span> VU)</div>
      </div>

      <!-- RIGHT VU METER -->
      <div class="vu-bezel">
        <div class="vu-dial">
          <svg viewBox="0 0 320 195">
            <!-- Scale background -->
            <path d="M 30 150 A 130 130 0 0 1 290 150" fill="none" stroke="#222" stroke-width="2" />
            <!-- Red zone -->
            <path d="M 235 62 A 130 130 0 0 1 285 125" fill="none" stroke="#c0392b" stroke-width="8" />
            <!-- Scale Ticks -->
            <path d="M 45 130 L 55 125 M 65 105 L 75 103 M 95 85 L 103 86 M 130 70 L 135 75 M 175 65 L 175 72 M 220 70 L 217 76 M 255 85 L 248 90 M 275 110 L 268 112" fill="none" stroke="#222" stroke-width="1.5" />
            <!-- Dial Markings -->
            <text x="50" y="145" font-size="11" font-weight="bold" fill="#222">-20</text>
            <text x="90" y="105" font-size="11" font-weight="bold" fill="#222">-10</text>
            <text x="135" y="88" font-size="11" font-weight="bold" fill="#222">-7</text>
            <text x="175" y="82" font-size="11" font-weight="bold" fill="#222">-3</text>
            <text x="215" y="88" font-size="13" font-weight="bold" fill="#222">0</text>
            <text x="250" y="105" font-size="12" font-weight="bold" fill="#c0392b">+1</text>
            <text x="270" y="130" font-size="12" font-weight="bold" fill="#c0392b">+3</text>
            <text x="160" y="125" text-anchor="middle" font-size="16" font-weight="900" letter-spacing="3" fill="#222">VU</text>
            <text x="160" y="142" text-anchor="middle" font-size="9" font-weight="bold" letter-spacing="1" fill="#666">WARD-BECK SYSTEMS</text>
            <!-- Teardrop Needle Right -->
            <g id="needle-r" transform="rotate(-42 160 195)" style="transition: transform 0.07s cubic-bezier(0.1, 0.9, 0.2, 1);">
              <path d="M 158.5 195 L 159.5 45 C 159.5 40 160.5 40 160.5 45 L 161.5 195 Z" fill="#111" />
              <path d="M 157.5 45 Q 160 30 160 25 Q 160 30 162.5 45 Z" fill="#111" />
              <circle cx="160" cy="195" r="16" fill="#111" />
              <circle cx="160" cy="195" r="6" fill="#555" />
            </g>
          </svg>
        </div>
        <div class="vu-label">CHANNEL 2 // RIGHT (<span id="txt-vu-r">-42.0</span> VU)</div>
      </div>
    </div>
  </div>

  <!-- SECTION 4: Multi-Source Audio Matrix Grid -->
  <div class="section-title">
    <span>Live Multi-Source Audio Matrix</span>
    <div class="section-subtitle">Tapped Source: <span id="tapped-info" style="color: var(--accent-orange); font-weight: bold;">wbs_input_bus.monitor</span></div>
  </div>

  <div class="source-grid" id="source-grid">
    <!-- Dynamically populated source cards -->
  </div>

  <!-- Bottom Global Actions -->
  <div class="controls-bar">
    <button class="ctrl-btn" id="btn-tone" onclick="toggleTone()">1 kHz Tone: OFF</button>
    <select id="tone-freq-select" class="ctrl-btn" onchange="changeToneFreq(this.value)">
      <option value="100">100 Hz Reference</option>
      <option value="440">440 Hz Pitch A</option>
      <option value="1000" selected>1 kHz 0 VU Reference</option>
      <option value="10000">10 kHz HF Reference</option>
    </select>
    <button class="ctrl-btn" onclick="fullRestart()">Rebuild Virtual Topology</button>
    <button class="ctrl-btn" onclick="refreshSourcesList()">Refresh Sources</button>
    <div style="flex: 1;"></div>
    <button class="ctrl-btn warn" onclick="abandonShip()">Abandon Ship (Restore Hardware)</button>
  </div>
</div>

<script>
let abandoned = false;
let lastSourcesJson = "";
let currentToneActive = false;
let sliceViewVisible = false;

// Audio Ring Visualizer State - 10 Second Circular Buffer
const RING_BUFFER_LENGTH = 480000;  // 10.000s @ 48,000 Hz Float32
let mxlTelemetry = null;
let ch0Head = 0;
let ch1Head = 0;
let activeMonitoredFlow = 'wbs-flow-master-stereo';
let cachedWaveform = null;
let currentPhaseCorr = 0.0;
let lastWaveformFetch = 0;

function vuToAngle(vu) {
  const clamped = Math.max(-20, Math.min(3, vu));
  return -42 + ((clamped + 20) / 23) * 84;
}

function escapeId(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function toggleSliceView() {
  sliceViewVisible = !sliceViewVisible;
  document.getElementById('slice-view-box').style.display = sliceViewVisible ? 'block' : 'none';
}

function switchEyeFlow(flowId) {
  activeMonitoredFlow = flowId;
  const btnMaster = document.getElementById('btn-flow-master');
  const btnTone = document.getElementById('btn-flow-tone');
  if (btnMaster && btnTone) {
    btnMaster.className = (flowId === 'wbs-flow-master-stereo') ? 'ctrl-btn active' : 'ctrl-btn';
    btnTone.className = (flowId === 'wbs-flow-ref-tone') ? 'ctrl-btn active' : 'ctrl-btn';
  }
  cachedWaveform = null;
  fetchWaveform();
}

async function testSliceWrap() {
  sliceViewVisible = true;
  document.getElementById('slice-view-box').style.display = 'block';
  try {
    const res = await fetch(`/api/mxl/flow/${activeMonitoredFlow}/slice?tail=479900&count=256`);
    const data = await res.json();
    document.getElementById('slice-json-details').textContent = JSON.stringify(data, null, 2);
    if (data.is_wrapped) {
      document.getElementById('slice1-visual').textContent = `Slice 1: Frames ${data.slice1.start}..${data.slice1.start + data.slice1.length - 1} (${data.slice1.length} f)`;
      document.getElementById('slice2-visual').textContent = `Slice 2 (Wrapped Seam): Frames 0..${data.slice2.length - 1} (${data.slice2.length} f)`;
    }
  } catch (err) {
    document.getElementById('slice-json-details').textContent = 'Error testing slice: ' + err.message;
  }
}

async function fetchWaveform() {
  const now = Date.now();
  if (now - lastWaveformFetch < 140) return;
  lastWaveformFetch = now;
  try {
    const res = await fetch(`/api/mxl/flow/${activeMonitoredFlow}/waveform`);
    if (res.ok) {
      cachedWaveform = await res.json();
    }
  } catch (e) {
    // Silent network retry
  }
}

// Draw Scanalyzer Audio Eye 10-Second Continuous Ring Buffer
// 0 seconds is at Far Right (3 o'clock / 0 rad in Cartesian geometry)
// Top of each second aligned to NTP wall-clock seconds
function drawScanalyzerEye(canvas, waveform, ntpSecOf10, headIndex, quantum, flowLabel) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Geometry: outer band (Left channel), inner band (Right channel)
  const rOuter = 188;
  const rMid = 140;
  const rInner = 82;
  const rCenterPlayhead = 28;

  ctx.clearRect(0, 0, w, h);

  // 1. Background Tracks & Radial Grid
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#0e2338';
  for (const r of [rInner, rMid, rOuter]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radial spokes for each second (0s through 9s)
  for (let s = 0; s < 10; s++) {
    const a = (s / 10.0) * Math.PI * 2; // 0 rad at 3 o'clock (far right)
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (rInner - 4), cy + Math.sin(a) * (rInner - 4));
    ctx.lineTo(cx + Math.cos(a) * (rOuter + 6), cy + Math.sin(a) * (rOuter + 6));
    ctx.strokeStyle = (s === 0) ? 'rgba(239, 68, 68, 0.45)' : '#112942';
    ctx.lineWidth = (s === 0) ? 2 : 1;
    ctx.stroke();
  }
  ctx.restore();

  // 2. Radial Waveform Spokes (CH0 Left in Emerald #22c55e, CH1 Right in Cyan #38bdf8)
  const bins = (waveform && waveform.ch0_max && waveform.ch0_max.length) ? waveform.ch0_max.length : 720;
  const reachL = (rOuter - rMid) * 0.48;
  const baseRL = (rOuter + rMid) / 2;
  const reachR = (rMid - rInner) * 0.48;
  const baseRR = (rMid + rInner) / 2;

  // Draw Channel 0: Left (Outer Band, Emerald #22c55e)
  ctx.save();
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.88)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  for (let b = 0; b < bins; b++) {
    const frac = b / bins;
    const a = frac * Math.PI * 2; // 0 rad = 3 o'clock, clockwise sweep
    const minVal = (waveform && waveform.ch0_min) ? (waveform.ch0_min[b] || 0) : 0;
    const maxVal = (waveform && waveform.ch0_max) ? (waveform.ch0_max[b] || 0) : 0;
    const rIn = baseRL + (minVal * reachL * 0.96);
    const rOut = baseRL + Math.max(0.04, maxVal * reachL * 0.96);
    ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
    ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
  }
  ctx.stroke();

  // Draw Channel 1: Right (Inner Band, Cyan #38bdf8)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.88)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  for (let b = 0; b < bins; b++) {
    const frac = b / bins;
    const a = frac * Math.PI * 2;
    const minVal = (waveform && waveform.ch1_min) ? (waveform.ch1_min[b] || 0) : 0;
    const maxVal = (waveform && waveform.ch1_max) ? (waveform.ch1_max[b] || 0) : 0;
    const rIn = baseRR + (minVal * reachR * 0.96);
    const rOut = baseRR + Math.max(0.04, maxVal * reachR * 0.96);
    ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
    ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
  }
  ctx.stroke();
  ctx.restore();

  // 3. NTP Second Ticks (10 Seconds: 0s at Far Right, Top of Second Aligned)
  ctx.save();
  for (let s = 0; s < 10; s++) {
    const a = (s / 10.0) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const isZero = (s === 0);
    const isTopPulse = Math.abs(ntpSecOf10 - s) < 0.12;

    const tLen = isZero ? 16 : 10;
    const p1X = cx + cos * (rOuter + 3);
    const p1Y = cy + sin * (rOuter + 3);
    const p2X = cx + cos * (rOuter + 3 + tLen);
    const p2Y = cy + sin * (rOuter + 3 + tLen);

    ctx.beginPath();
    ctx.moveTo(p1X, p1Y);
    ctx.lineTo(p2X, p2Y);
    ctx.strokeStyle = isTopPulse ? '#ffffff' : (isZero ? '#ef4444' : '#38bdf8');
    ctx.lineWidth = (isZero || isTopPulse) ? 3 : 1.5;
    if (isTopPulse) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Second Tick Label
    const lblDist = rOuter + (isZero ? 27 : 20);
    const lblX = cx + cos * lblDist;
    const lblY = cy + sin * lblDist;
    ctx.font = isZero ? 'bold 11px monospace' : '9px monospace';
    ctx.fillStyle = isTopPulse ? '#ffffff' : (isZero ? '#ef4444' : '#94a3b8');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const txt = isZero ? '0.0s [NTP]' : `${s}.0s`;
    ctx.fillText(txt, lblX, lblY);
  }
  ctx.restore();

  // 4. Center Playhead Triangle (Scanalyzer Style Magenta #d946ef)
  const currentAngle = (ntpSecOf10 / 10.0) * Math.PI * 2;
  const ca = Math.cos(currentAngle);
  const sa = Math.sin(currentAngle);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(currentAngle);

  // Magenta pointer triangle pointing towards the sweep angle
  ctx.beginPath();
  ctx.moveTo(rCenterPlayhead, 0);
  ctx.lineTo(-rCenterPlayhead * 0.65, -rCenterPlayhead * 0.65);
  ctx.lineTo(-rCenterPlayhead * 0.38, 0);
  ctx.lineTo(-rCenterPlayhead * 0.65, rCenterPlayhead * 0.65);
  ctx.closePath();
  ctx.fillStyle = '#d946ef';
  ctx.shadowColor = '#d946ef';
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.restore();

  // 5. Rotating NTP Write-Head Needle Arm with Red-Hot Glowing Tip
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3.2;
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = 9;
  ctx.beginPath();
  ctx.moveTo(cx + ca * (rInner - 6), cy + sa * (rInner - 6));
  ctx.lineTo(cx + ca * (rOuter + 6), cy + sa * (rOuter + 6));
  ctx.stroke();

  // Red-hot Glowing Tip Ball at Perimeter
  const tipX = cx + ca * (rOuter + 6);
  const tipY = cy + sa * (rOuter + 6);
  ctx.beginPath();
  ctx.arc(tipX, tipY, 5.2, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2810';
  ctx.shadowColor = '#ff2810';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.restore();
}

function renderSourceCards(sources, selected) {
  const jsonStr = JSON.stringify(sources) + "::" + selected;
  if (jsonStr === lastSourcesJson) return;
  lastSourcesJson = jsonStr;

  const container = document.getElementById('source-grid');
  container.innerHTML = "";

  for (const s of sources) {
    const isTapped = (s.name === selected);
    const isWbs = s.name.startsWith("wbs_");
    const isMon = s.name.endsWith(".monitor");

    let typeClass = "pill-monitor";
    let typeLabel = "MONITOR";
    if (isWbs) {
      typeClass = "pill-wbs";
      typeLabel = "WBS BUS";
    } else if (!isMon) {
      typeClass = "pill-mic";
      typeLabel = "HARDWARE IN";
    }

    const safeId = escapeId(s.name);

    const card = document.createElement('div');
    card.className = `source-card ${isTapped ? 'tapped' : ''}`;
    card.id = `card-${safeId}`;

    card.innerHTML = `
      <div class="source-top">
        <div>
          <div class="source-name">${s.name}</div>
          <div class="source-desc">${s.description || s.name}</div>
        </div>
        <span class="source-pill ${typeClass}">${typeLabel}</span>
      </div>
      <div>
        <div class="mini-meter-track">
          <div class="mini-meter-fill" id="meter-fill-${safeId}" style="width: 0%;"></div>
        </div>
        <div class="meter-digits">
          <span id="meter-db-${safeId}">-60.0 dBFS</span>
          <span id="meter-vu-${safeId}">-42.0 VU</span>
        </div>
      </div>
      <button class="btn-tap ${isTapped ? 'tapped' : ''}" id="btn-tap-${safeId}" onclick="tapSource('${s.name}')">
        ${isTapped ? '★ ROUTED &amp; METERED' : 'TAP THIS SOURCE'}
      </button>
    `;
    container.appendChild(card);
  }
}

async function pollStatus() {
  if (abandoned) return;
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    // 1. Update Master VU needles
    const vuL = data.meters.left_vu;
    const vuR = data.meters.right_vu;
    document.getElementById('needle-l').setAttribute('transform', `rotate(${vuToAngle(vuL)} 160 195)`);
    document.getElementById('needle-r').setAttribute('transform', `rotate(${vuToAngle(vuR)} 160 195)`);
    document.getElementById('txt-vu-l').textContent = vuL.toFixed(1);
    document.getElementById('txt-vu-r').textContent = vuR.toFixed(1);

    // 2. Update Tapped source display
    document.getElementById('tapped-info').textContent = data.selected_source;

    // 3. Update Tone button
    currentToneActive = data.test_tone.active;
    const toneBtn = document.getElementById('btn-tone');
    if (currentToneActive) {
      toneBtn.className = 'ctrl-btn active';
      toneBtn.textContent = `1 kHz Tone: ON (${data.test_tone.freq} Hz)`;
    } else {
      toneBtn.className = 'ctrl-btn';
      toneBtn.textContent = `1 kHz Tone: OFF`;
    }

    // 4. Render and update individual source meter bars
    renderSourceCards(data.sources, data.selected_source);
    for (const [sname, m] of Object.entries(data.source_meters || {})) {
      const safeId = escapeId(sname);
      const fillEl = document.getElementById(`meter-fill-${safeId}`);
      const dbEl = document.getElementById(`meter-db-${safeId}`);
      const vuEl = document.getElementById(`meter-vu-${safeId}`);
      if (fillEl && dbEl && vuEl) {
        const pct = Math.max(0, Math.min(100, ((m.db + 60) / 60) * 100));
        fillEl.style.width = `${pct}%`;
        dbEl.textContent = `${m.db.toFixed(1)} dBFS`;
        vuEl.textContent = `${m.vu.toFixed(1)} VU`;
      }
    }

    // 5. Update MXL Continuous 10-Second Ring Buffer Telemetry
    if (data.mxl && data.mxl.flows) {
      const activeFlow = data.mxl.flows.find(f => f.flow_id === activeMonitoredFlow) || data.mxl.flows[0];
      if (activeFlow) {
        ch0Head = activeFlow.write_head;
        ch1Head = activeFlow.write_head;
        const headSec = (ch0Head / (activeFlow.sample_rate || 48000)).toFixed(3);
        const headEl = document.getElementById('eye-head-index');
        const headSecEl = document.getElementById('eye-head-sec');
        if (headEl) headEl.textContent = `HEAD: ${ch0Head}`;
        if (headSecEl) headSecEl.textContent = `${headSec}s / 480,000 frames`;
      }
      if (data.mxl.tai_epoch_ns) {
        document.getElementById('badge-tai').textContent = `TAI: ${data.mxl.tai_epoch_ns.toString().slice(-9)} ns`;
        const taiEl = document.getElementById('eye-tai-ns');
        if (taiEl) taiEl.textContent = `TAI: ${data.mxl.tai_epoch_ns} ns`;
      }
      // Compute Phase Correlation from stereo meter difference
      if (data.meters) {
        const diff = Math.abs((data.meters.left_vu || 0) - (data.meters.right_vu || 0));
        currentPhaseCorr = Math.max(-0.95, Math.min(0.98, 1.0 - (diff / 16.0)));
        const corrEl = document.getElementById('corr-val-readout');
        const needleEl = document.getElementById('phase-needle');
        if (corrEl) corrEl.textContent = `corr ${currentPhaseCorr >= 0 ? '+' : ''}${currentPhaseCorr.toFixed(2)}`;
        if (needleEl) needleEl.style.left = `${((currentPhaseCorr + 1.0) / 2.0) * 100}%`;
      }
    }

    // 6. Update Pipeline Cards
    if (data.pipeline && data.pipeline.layers) {
      const alsa = data.pipeline.layers.layer1_kernel_hardware.telemetry;
      const pw = data.pipeline.layers.layer2_graph_session.telemetry;

      document.getElementById('alsa-card-count').textContent = `${alsa.card_count} CARDS`;
      const cardList = document.getElementById('alsa-card-list');
      if (cardList && alsa.cards) {
        cardList.innerHTML = alsa.cards.map(c => `<li>${c}</li>`).join('');
      }

      const streamList = document.getElementById('pw-stream-list');
      if (streamList && pw.streams) {
        streamList.innerHTML = pw.streams.slice(0, 5).map(s => `<li>${s}</li>`).join('');
      }
    }

  } catch (e) {}
}

async function tapSource(srcName) {
  if (abandoned) return;
  document.getElementById('tapped-info').textContent = 'SWITCHING...';
  await fetch('/api/set_source', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({source: srcName})
  });
  lastSourcesJson = "";
  pollStatus();
}

async function refreshSourcesList() {
  await fetch('/api/refresh_sources', {method: 'POST'});
  lastSourcesJson = "";
  pollStatus();
}

async function toggleTone() {
  if (abandoned) return;
  const freq = parseInt(document.getElementById('tone-freq-select').value, 10) || 1000;
  await fetch('/api/toggle_test_tone', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({freq})
  });
  pollStatus();
}

async function changeToneFreq(val) {
  if (currentToneActive) {
    const freq = parseInt(val, 10) || 1000;
    await fetch('/api/toggle_test_tone', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({freq, restart: true})
    });
  }
}

async function fullRestart() {
  if (abandoned) return;
  document.getElementById('tapped-info').textContent = 'RESTARTING BUSES...';
  await fetch('/api/restart', {method: 'POST'});
  lastSourcesJson = "";
  pollStatus();
}

async function abandonShip() {
  abandoned = true;
  document.getElementById('offline-banner').style.display = 'block';
  document.getElementById('needle-l').setAttribute('transform', 'rotate(-42 160 195)');
  document.getElementById('needle-r').setAttribute('transform', 'rotate(-42 160 195)');
  try {
    await fetch('/api/abandon', {method: 'POST'});
  } catch (e) {}
}

// Interactive Canvas Scrub & Slice Inspector on Click
const eyeCanvas = document.getElementById('eye-player-canvas');
if (eyeCanvas) {
  eyeCanvas.addEventListener('click', (e) => {
    const rect = eyeCanvas.getBoundingClientRect();
    const dx = e.clientX - rect.left - (rect.width / 2);
    const dy = e.clientY - rect.top - (rect.height / 2);
    let a = Math.atan2(dy, dx);
    if (a < 0) a += Math.PI * 2;
    const frac = a / (Math.PI * 2);
    const targetFrame = Math.floor(frac * RING_BUFFER_LENGTH);
    sliceViewVisible = true;
    document.getElementById('slice-view-box').style.display = 'block';
    fetch(`/api/mxl/flow/${activeMonitoredFlow}/slice?tail=${targetFrame}&count=256`)
      .then(r => r.json())
      .then(data => {
        document.getElementById('slice-json-details').textContent = JSON.stringify(data, null, 2);
        if (data.is_wrapped) {
          document.getElementById('slice1-visual').textContent = `Slice 1: Frames ${data.slice1.start}..${data.slice1.start + data.slice1.length - 1} (${data.slice1.length} f)`;
          document.getElementById('slice2-visual').textContent = `Slice 2 (Wrapped Seam): Frames 0..${data.slice2.length - 1} (${data.slice2.length} f)`;
        } else {
          document.getElementById('slice1-visual').textContent = `Contiguous: Frames ${data.slice1.start}..${data.slice1.start + data.slice1.length - 1} (${data.slice1.length} f)`;
          document.getElementById('slice2-visual').textContent = `Part 2: Headroom (No Wrap)`;
        }
      })
      .catch(() => {});
  });
}

// 60 FPS Smooth Radial Eye Player Rendering Loop (NTP-Aligned)
function renderEyeFrame() {
  const canvas = document.getElementById('eye-player-canvas');
  if (canvas) {
    const nowMs = Date.now();
    const secOf10 = (nowMs / 1000.0) % 10.0;
    drawScanalyzerEye(canvas, cachedWaveform, secOf10, ch0Head, 256, activeMonitoredFlow);
    const clkEl = document.getElementById('eye-ntp-clock');
    const secEl = document.getElementById('eye-sec-10');
    if (clkEl) clkEl.textContent = new Date().toISOString().slice(11, 23);
    if (secEl) secEl.textContent = `${secOf10.toFixed(3)} s / 10.000 s`;
  }
  requestAnimationFrame(renderEyeFrame);
}
requestAnimationFrame(renderEyeFrame);

// Periodic Waveform Fetching & Fast Polling
setInterval(fetchWaveform, 150);
fetchWaveform();
setInterval(pollStatus, 70);
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
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Access-Control-Request-Private-Network, Authorization")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_UI.encode("utf-8"))

        elif path == "/api/status":
            with STATE_LOCK:
                pipeline_data = inspect_full_pipeline(MXL_ENGINE)
                payload = {
                    "physical_sink": PHYSICAL_SINK,
                    "selected_source": SELECTED_SOURCE,
                    "sources": AVAILABLE_SOURCES,
                    "routes": ACTIVE_ROUTES,
                    "meters": METER_LEVELS,
                    "source_meters": dict(SOURCE_METERS),
                    "test_tone": {"active": TEST_TONE_ACTIVE, "freq": TEST_TONE_FREQ},
                    "mxl": MXL_ENGINE.get_telemetry(),
                    "pipeline": pipeline_data,
                }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))

        elif path == "/api/pipeline":
            rep = inspect_full_pipeline(MXL_ENGINE)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rep).encode("utf-8"))

        elif path == "/api/pipeline/alsa":
            rep = inspect_alsa()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rep).encode("utf-8"))

        elif path == "/api/pipeline/pipewire":
            rep = inspect_pipewire()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rep).encode("utf-8"))

        elif path == "/api/mxl":
            rep = MXL_ENGINE.get_telemetry()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rep).encode("utf-8"))

        elif path == "/api/mxl/waveform" or (path.startswith("/api/mxl/flow/") and "/waveform" in path):
            parts = path.split("/")
            flow_id = parts[4] if len(parts) >= 5 and parts[4] != "waveform" else "wbs-flow-master-stereo"
            flow = MXL_ENGINE.flows.get(flow_id, MXL_ENGINE.master_flow)
            waveform_data = flow.get_waveform_bins()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(waveform_data).encode("utf-8"))

        elif path.startswith("/api/mxl/flow/") and "/slice" in path:
            # Query slice: /api/mxl/flow/<flow_id>/slice?tail=479900&count=256
            parts = path.split("/")
            flow_id = parts[4] if len(parts) >= 5 else "wbs-flow-master-stereo"
            qs = parse_qs(parsed.query)
            tail = int(qs.get("tail", ["479900"])[0])
            count = int(qs.get("count", ["256"])[0])

            flow = MXL_ENGINE.flows.get(flow_id, MXL_ENGINE.master_flow)
            slice_data = flow.get_samples(tail, count)
            # Truncate samples in JSON preview to first 8 for readability
            slice_data["samples_ch0_preview"] = slice_data["samples_ch0"][:8]
            slice_data["samples_ch1_preview"] = slice_data["samples_ch1"][:8]
            del slice_data["samples_ch0"]
            del slice_data["samples_ch1"]

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(slice_data).encode("utf-8"))

        elif path == "/api/stream/meters":
            # 60 FPS Server-Sent Events (SSE) live metering stream for web clients
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.end_headers()

            try:
                while not SHUTDOWN_EVENT.is_set():
                    with STATE_LOCK:
                        cur_meters = dict(METER_LEVELS)
                        mxl_head = MXL_ENGINE.master_flow.write_head
                        mxl_seq = MXL_ENGINE.master_flow.write_seq
                        tai_ns = current_tai_ns()
                        ntp_time = time.time()

                    event_data = {
                        "left_db": cur_meters.get("left_db", -60.0),
                        "right_db": cur_meters.get("right_db", -60.0),
                        "left_vu": cur_meters.get("left_vu", -42.0),
                        "right_vu": cur_meters.get("right_vu", -42.0),
                        "mxl_write_head": mxl_head,
                        "mxl_write_seq": mxl_seq,
                        "tai_ns": tai_ns,
                        "ntp_sec": ntp_time,
                        "second_of_10": round(ntp_time % 10.0, 4),
                        "selected_source": SELECTED_SOURCE,
                    }
                    self.wfile.write(f"data: {json.dumps(event_data)}\n\n".encode("utf-8"))
                    self.wfile.flush()
                    time.sleep(0.016)  # ~60 FPS
            except (BrokenPipeError, ConnectionResetError):
                pass

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
        elif parsed.path == "/api/toggle_test_tone":
            data = json.loads(body)
            freq = data.get("freq", 1000)
            restart = data.get("restart", False)
            with STATE_LOCK:
                if restart:
                    start_test_tone(freq)
                elif TEST_TONE_ACTIVE:
                    stop_test_tone()
                else:
                    start_test_tone(freq)
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


def launch_browser(url: str, delay: float = 0.4):
    """Launches the system browser pointing to the local router interface."""
    def _open():
        time.sleep(delay)
        if not (os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY")):
            return
        try:
            import webbrowser
            if webbrowser.open(url):
                return
        except Exception:
            pass
        try:
            subprocess.Popen(["xdg-open", url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

    t = threading.Thread(target=_open, daemon=True)
    t.start()


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):
        ex_type, _, _ = sys.exc_info()
        if ex_type in (BrokenPipeError, ConnectionResetError):
            return
        super().handle_error(request, client_address)


def handle_sigterm(signum, frame):
    SHUTDOWN_EVENT.set()
    with STATE_LOCK:
        abandon_ship()
    os._exit(0)


if __name__ == "__main__":
    if any(arg in sys.argv for arg in ("--check", "--test", "--self-test")):
        print("[WARD BECK TAP] Validating configuration and self-test...")
        assert len(HTML_UI) > 1000, "HTML template empty"
        assert "WARD BECK TAP" in HTML_UI or "Ward-Beck" in HTML_UI, "HTML header missing"
        assert "needle-l" in HTML_UI and "needle-r" in HTML_UI, "VU needle elements missing"
        assert "eye-player-canvas" in HTML_UI or "ring-canvas" in HTML_UI, "MXL ring buffer canvas missing"
        srcs = list_sources()
        print(f"[WARD BECK TAP] Detected audio subsystem ({len(srcs)} available audio sources).")
        pipe = inspect_full_pipeline(MXL_ENGINE)
        print(f"[WARD BECK TAP] 3-Layer Linux Audio Pipeline online (ALSA cards: {pipe['layers']['layer1_kernel_hardware']['telemetry']['card_count']}).")
        print("[WARD BECK TAP] ✔ Self-test passed: WARD BECK TAP is valid, MXL-aware, and deployment-ready.")
        sys.exit(0)

    if any(arg in sys.argv for arg in ("--abandon", "--teardown", "--stop")):
        print("[WARD BECK TAP] Executing teardown / abandon ship...")
        with STATE_LOCK:
            abandon_ship()
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_sigterm)
    signal.signal(signal.SIGINT, handle_sigterm)

    print("[WARD BECK TAP] Initializing virtual buses, multi-source meters, and signal tap point...")
    with STATE_LOCK:
        full_restart()

    t = threading.Thread(target=meter_reader_loop, daemon=True)
    t.start()

    no_browser = any(arg in sys.argv for arg in ("--no-browser", "--headless", "--daemon")) or (os.environ.get("WBS_NO_BROWSER", "0") == "1")
    if not no_browser:
        print(f"[WARD BECK TAP] Launching browser: http://127.0.0.1:{PORT}")
        launch_browser(f"http://127.0.0.1:{PORT}")

    server = ThreadingHTTPServer(("127.0.0.1", PORT), WBSHandler)
    print(f"[WARD BECK TAP] HTML Router & Multi-Source VU Bridge running at: http://127.0.0.1:{PORT}")
    print("[WARD BECK TAP] Live VU meters & MXL Continuous Ring Buffers active. Signal Tap online.")
    try:
        server.serve_forever()
    finally:
        with STATE_LOCK:
            abandon_ship()
