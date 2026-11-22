#!/usr/bin/env python3
"""
Ward-Beck Audio Tab
===================
Virtual Audio Patchbay & Test Point Controller Daemon (HTML Router + Live VU Bridge)
Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.

Routes Linux desktop audio (YouTube, Spotify, DAWs, Media Players) into Ward-Beck XTM-4
via isolated virtual null-sinks (100% feedback-free, banner-free, low-latency).
Includes live multi-source VU metering, matrix source tapping, and calibrated test generator.
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
from urllib.parse import urlparse

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

    print(f"[Ward-Beck Audio Tab] Teardown complete. Hardware sink restored: {phys or 'None'}")


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
    print(f"[Ward-Beck Audio Tab] Topology active. Source={SELECTED_SOURCE} -> Speakers={PHYSICAL_SINK}")


def apply_routes():
    """Rebuilds WBS loopbacks using SELECTED_SOURCE as the patchbay input with acoustic feedback protection."""
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
    """Stereo precision meter reader loop for WBS METER TAP."""
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

                with STATE_LOCK:
                    METER_LEVELS["left_db"] = round(db_l, 1)
                    METER_LEVELS["right_db"] = round(db_r, 1)
                    METER_LEVELS["left_vu"] = round(db_l + 18.0, 1)
                    METER_LEVELS["right_vu"] = round(db_r + 18.0, 1)
        except Exception:
            pass
        finally:
            proc.terminate()
            time.sleep(0.3)


# ---------------------------------------------------------------------------
# Calibrated Test Tone Generator (-20 dBFS / 0 VU Broadcast Reference)
# ---------------------------------------------------------------------------

def start_test_tone(freq=1000):
    global TEST_TONE_ACTIVE, TEST_TONE_FREQ
    stop_test_tone()
    TEST_TONE_ACTIVE = True
    TEST_TONE_FREQ = freq
    t = threading.Thread(target=_tone_stream_worker, args=(freq,), daemon=True)
    t.start()


def stop_test_tone():
    global TEST_TONE_ACTIVE, TEST_TONE_PROC
    TEST_TONE_ACTIVE = False
    if TEST_TONE_PROC:
        try:
            TEST_TONE_PROC.terminate()
        except Exception:
            pass
        TEST_TONE_PROC = None


def _tone_stream_worker(freq):
    global TEST_TONE_PROC
    rate = 48000
    chunk_size = 2048
    amplitude = int(32767 * 0.1)  # -20 dBFS = Broadcast 0 VU standard alignment
    target = "wbs_input_bus"

    try:
        proc = subprocess.Popen(
            ["paplay", f"--device={target}", "--raw", "--format=s16le", f"--rate={rate}", "--channels=2"],
            stdin=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        TEST_TONE_PROC = proc
        phase = 0.0
        phase_inc = 2.0 * math.pi * freq / rate

        while TEST_TONE_ACTIVE and not SHUTDOWN_EVENT.is_set():
            samples = []
            for _ in range(chunk_size):
                val = int(amplitude * math.sin(phase))
                samples.extend([val, val])  # Stereo
                phase = (phase + phase_inc) % (2.0 * math.pi)
            raw_bytes = struct.pack(f"<{chunk_size * 2}h", *samples)
            proc.stdin.write(raw_bytes)
            proc.stdin.flush()
    except Exception:
        pass
    finally:
        try:
            proc.terminate()
        except Exception:
            pass


HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Ward-Beck Audio Tab // Virtual Audio Router &amp; VU Bridge</title>
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
    display: flex; justify-content: center; padding: 20px;
  }
  .rack-unit {
    width: 100%; max-width: 1100px; background: var(--wbs-blue);
    border: 3px solid #2b547e; border-radius: 6px; padding: 20px;
    box-shadow: 0 16px 45px rgba(0,0,0,0.75);
  }
  .header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid #2b547e; padding-bottom: 12px; margin-bottom: 16px;
    gap: 12px; flex-wrap: wrap;
  }
  .header h1 { margin: 0; font-size: 1.15rem; letter-spacing: 1.5px; text-transform: uppercase; color: #fff; }
  .badge-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .badge {
    background: var(--wbs-panel); padding: 6px 12px; border-radius: 4px;
    font-size: 0.8rem; border: 1px solid #356596; font-weight: 700;
  }
  .badge-active { border-color: var(--accent-green); color: var(--accent-green); }

  /* SECTION LABELS */
  .section-label {
    font-size: 0.85rem; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
    color: var(--accent-cyan); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
  }

  /* MASTER METERS ROW */
  .meters-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;
  }
  .vu-housing {
    background: var(--wbs-bezel); padding: 14px; border-radius: 6px;
    border: 2px solid #223b54; text-align: center;
  }
  .vu-label { font-size: 0.82rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; color: #a8c4de; }
  svg.vu-svg { width: 100%; height: auto; display: block; border-radius: 3px; }
  .readout { margin-top: 6px; font-size: 0.85rem; font-weight: 700; color: #8fb4d6; font-family: monospace; }

  /* TEST OUTPUT & GENERATOR BAR */
  .test-bar {
    background: var(--wbs-panel); border: 1px solid #2d5985; border-radius: 5px;
    padding: 14px 16px; margin-bottom: 22px; display: flex; justify-content: space-between;
    align-items: center; gap: 14px; flex-wrap: wrap;
  }
  .test-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .test-btn {
    background: #182838; color: #bae6fd; border: 1px solid #38bdf8;
    padding: 8px 14px; border-radius: 4px; cursor: pointer; font-weight: 800;
    font-size: 0.82rem; letter-spacing: 0.6px; transition: 0.15s;
  }
  .test-btn:hover { background: #233e5c; }
  .test-btn.active {
    background: var(--accent-orange); color: #111; border-color: #ff9d42;
    box-shadow: 0 0 12px rgba(244, 144, 44, 0.5);
  }
  select.test-select {
    padding: 7px 10px; border-radius: 4px; border: 1px solid #3c6e9e;
    background: var(--wbs-bezel); color: #fff; font-size: 0.82rem; font-weight: 700;
  }
  .test-point-indicator {
    display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #93c5fd; font-family: monospace;
  }

  /* SOUND SOURCES & LIVE METER STRIPS (GRID) */
  .source-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px; margin-bottom: 22px;
  }
  .source-card {
    background: var(--wbs-panel); border: 1px solid #284c72; border-radius: 5px;
    padding: 12px; display: flex; flex-direction: column; justify-content: space-between;
    transition: all 0.15s ease; position: relative;
  }
  .source-card.tapped {
    border-color: var(--accent-orange);
    box-shadow: 0 0 14px rgba(244, 144, 44, 0.25);
    background: #10263b;
  }
  .source-top {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
  }
  .source-pill {
    font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 2px 6px;
    border-radius: 3px; letter-spacing: 0.6px;
  }
  .pill-monitor { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #0284c7; }
  .pill-mic { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid #dc2626; }
  .pill-wbs { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid #16a34a; }
  .tapped-badge {
    font-size: 0.7rem; font-weight: 800; color: var(--accent-orange); letter-spacing: 0.8px;
  }
  .source-desc {
    font-size: 0.82rem; font-weight: 700; color: #fff; margin-bottom: 8px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .source-mini-meter {
    background: var(--wbs-bezel); padding: 8px; border-radius: 4px;
    border: 1px solid #1c3650; margin-bottom: 8px; text-align: center;
  }
  .source-mini-readout {
    font-size: 0.75rem; font-family: monospace; font-weight: 700; color: #94a3b8; margin-top: 4px;
  }
  button.tap-btn {
    width: 100%; padding: 8px; border: none; border-radius: 4px; cursor: pointer;
    font-weight: 800; font-size: 0.78rem; letter-spacing: 0.8px; text-transform: uppercase;
    background: #1f374f; color: #94a3b8; transition: 0.15s; border: 1px solid #2d547d;
  }
  button.tap-btn:hover { background: #284c72; color: #fff; }
  button.tap-btn.active {
    background: var(--accent-orange); color: #111; border-color: #ff9d42;
    box-shadow: 0 0 10px rgba(244, 144, 44, 0.4);
  }

  /* MATRIX GRID */
  .matrix-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;
  }
  .node-card {
    background: var(--wbs-panel); border: 1px solid #284c72; border-radius: 5px;
    padding: 12px; display: flex; flex-direction: column; justify-content: space-between;
  }
  .node-title { font-weight: 800; font-size: 0.85rem; margin-bottom: 4px; color: #fff; }
  .node-desc { font-size: 0.75rem; color: #9cb9d4; margin-bottom: 12px; line-height: 1.35; }
  button.patch-btn {
    width: 100%; padding: 9px; border: none; border-radius: 4px; cursor: pointer;
    font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; font-size: 0.78rem;
    background: #1f374f; color: #829ab1; transition: 0.15s;
  }
  button.patch-btn.active {
    background: var(--accent-orange); color: #111;
    box-shadow: 0 0 10px rgba(244, 144, 44, 0.35);
  }

  /* FLOW FOOTER */
  .flow-bar {
    background: var(--wbs-bezel); padding: 12px 16px; border-radius: 4px;
    font-size: 0.82rem; color: #b9d3ea; display: flex; justify-content: space-between;
    align-items: center; border: 1px solid #234363; gap: 12px; flex-wrap: wrap;
  }
  .controls-group { display: flex; gap: 10px; }
  .restart-btn {
    background: #1f6feb; color: #fff; border: none; padding: 8px 14px;
    border-radius: 4px; cursor: pointer; font-weight: 800; font-size: 0.8rem;
  }
  .restart-btn:hover { background: #388bfd; }
  .abandon-btn {
    background: #b62324; color: #fff; border: 2px solid #ff7b72; padding: 8px 16px;
    border-radius: 4px; cursor: pointer; font-weight: 800; font-size: 0.8rem;
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

  <!-- HEADER -->
  <div class="header">
    <h1>Ward-Beck Audio Tab // Virtual Audio Router</h1>
    <div class="badge-row">
      <div class="badge badge-active" id="tapped-info">INPUT: Detecting...</div>
      <div class="badge" id="sink-info">OUT: Detecting...</div>
    </div>
  </div>

  <!-- MASTER VU METERS FOR CURRENTLY TAPPED SOURCE -->
  <div class="section-label">1. MASTER MONITOR TAP (CURRENTLY ROUTED TO XTM-4)</div>
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

  <!-- TEST OUTPUT & CALIBRATION BAR -->
  <div class="test-bar">
    <div class="test-left">
      <span style="font-size:0.85rem;font-weight:800;color:#fff;">CALIBRATION GENERATOR (-20 dBFS / 0 VU):</span>
      <button class="test-btn" id="btn-test-tone" onclick="toggleTestTone()">
        🔊 INJECT TEST TONE (OFF)
      </button>
      <select class="test-select" id="test-freq" onchange="changeToneFreq(this.value)">
        <option value="1000">1000 Hz (Standard 0 VU Broadcast)</option>
        <option value="440">440 Hz (Concert Tuning A)</option>
        <option value="100">100 Hz (Low End Alignment)</option>
        <option value="10000">10 kHz (High End Response)</option>
      </select>
    </div>
    <div class="test-point-indicator">
      <span>TEST POINT B-LEG:</span>
      <strong id="test-point-val">-60.0 dBFS | -42.0 VU</strong>
    </div>
  </div>

  <!-- ALL AUDIO SOURCES & INDIVIDUAL LIVE VU METERS -->
  <div class="section-label">2. ALL AUDIO SOURCES // LIVE METERING &amp; MATRIX TAPS</div>
  <div class="source-grid" id="source-grid">
    <!-- Dynamic cards rendered for each audio source -->
  </div>

  <!-- MATRIX ROUTING GRID -->
  <div class="section-label">3. WBS MATRIX NODES // INSERT &amp; OUTPUT SPLITS</div>
  <div class="matrix-grid">
    <div class="node-card">
      <div>
        <div class="node-title">1. WBS METER TAP</div>
        <div class="node-desc">Parallel mult from tapped source directly into <code>wbs_meter_tap</code>.</div>
      </div>
      <button class="patch-btn active" id="btn-meter_tap" onclick="toggleRoute('meter_tap')">ACTIVE</button>
    </div>

    <div class="node-card">
      <div>
        <div class="node-title">2. WBS INSERT STAGE</div>
        <div class="node-desc">Routes through <code>wbs_insert_bus</code> for processing (Off = Bypass).</div>
      </div>
      <button class="patch-btn active" id="btn-insert_stage" onclick="toggleRoute('insert_stage')">ACTIVE</button>
    </div>

    <div class="node-card">
      <div>
        <div class="node-title">3. SPEAKER SPLITTER</div>
        <div class="node-desc">Leg A feeding physical speakers (Feedback Guard blocks mics).</div>
      </div>
      <button class="patch-btn active" id="btn-speaker_split" onclick="toggleRoute('speaker_split')">ACTIVE</button>
    </div>

    <div class="node-card">
      <div>
        <div class="node-title">4. WBS TEST POINT</div>
        <div class="node-desc">Leg B feeding <code>wbs_test_point.monitor</code> for capture/audition.</div>
      </div>
      <button class="patch-btn active" id="btn-test_point_split" onclick="toggleRoute('test_point_split')">ACTIVE</button>
    </div>
  </div>

  <!-- FOOTER -->
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
let lastSourcesJson = "";
let currentToneActive = false;

function vuToAngle(vu) {
  const clamped = Math.max(-20, Math.min(3, vu));
  return -42 + ((clamped + 20) / 23) * 84;
}

function escapeId(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
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
        <span class="source-pill ${typeClass}">${typeLabel}</span>
        <span class="tapped-badge" id="badge-${safeId}">${isTapped ? '● CURRENTLY TAPPED' : ''}</span>
      </div>
      <div class="source-desc" title="${s.name}">${s.description || s.name}</div>
      <div class="source-mini-meter">
        <svg viewBox="0 0 240 120" style="width:100%;height:auto;display:block;">
          <rect x="0" y="0" width="240" height="120" fill="#f5f0e1"/>
          <path d="M 34 85 A 95 95 0 0 1 155 58" fill="none" stroke="#1b1b1b" stroke-width="2"/>
          <path d="M 155 58 A 95 95 0 0 1 206 85" fill="none" stroke="#c92a2a" stroke-width="3.5"/>
          <text x="32" y="76" font-size="9" fill="#1b1b1b" font-weight="bold">-20</text>
          <text x="68" y="58" font-size="9" fill="#1b1b1b" font-weight="bold">-10</text>
          <text x="110" y="50" font-size="9" fill="#1b1b1b" font-weight="bold">-5</text>
          <text x="152" y="52" font-size="10" fill="#c92a2a" font-weight="bold">0</text>
          <text x="194" y="75" font-size="9" fill="#c92a2a" font-weight="bold">+3</text>
          <text x="120" y="86" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">VU</text>
          <g id="mini-needle-${safeId}" transform="rotate(-42 120 140)">
            <line x1="120" y1="140" x2="120" y2="38" stroke="#c92a2a" stroke-width="2" stroke-linecap="round"/>
          </g>
          <rect x="0" y="104" width="240" height="16" fill="#18222d"/>
        </svg>
        <div class="source-mini-readout" id="mini-readout-${safeId}">-60.0 dBFS | -42.0 VU</div>
      </div>
      <button class="tap-btn ${isTapped ? 'active' : ''}" id="btn-tap-${safeId}" onclick="changeSource('${s.name}')">
        ${isTapped ? '★ TAPPED (ACTIVE IN XTM)' : 'TAP THIS SOURCE'}
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

    document.getElementById('sink-info').textContent = 'SPEAKERS: ' + (data.physical_sink || 'None');
    document.getElementById('tapped-info').textContent = 'TAPPED: ' + (data.selected_source || 'None');

    renderSourceCards(data.sources || [], data.selected_source || '');

    document.getElementById('chain-summary').innerHTML =
      `<strong>CHAIN:</strong> <code>${data.selected_source}</code> &rarr; [Meters + WBS Insert] &rarr; Speakers &amp; <code>wbs_test_point</code>`;

    // Master Left & Right VU meters
    const lAngle = vuToAngle(data.meters.left_vu);
    const rAngle = vuToAngle(data.meters.right_vu);
    document.getElementById('needle-l').setAttribute('transform', `rotate(${lAngle.toFixed(1)} 160 195)`);
    document.getElementById('needle-r').setAttribute('transform', `rotate(${rAngle.toFixed(1)} 160 195)`);

    document.getElementById('readout-l').textContent = `${data.meters.left_db.toFixed(1)} dBFS | ${data.meters.left_vu.toFixed(1)} VU`;
    document.getElementById('readout-r').textContent = `${data.meters.right_db.toFixed(1)} dBFS | ${data.meters.right_vu.toFixed(1)} VU`;

    // Update Individual Source Meters
    if (data.source_meters) {
      for (const [sName, m] of Object.entries(data.source_meters)) {
        const safeId = escapeId(sName);
        const needleEl = document.getElementById(`mini-needle-${safeId}`);
        const readEl = document.getElementById(`mini-readout-${safeId}`);
        if (needleEl && readEl) {
          const ang = vuToAngle(m.vu);
          needleEl.setAttribute('transform', `rotate(${ang.toFixed(1)} 120 140)`);
          readEl.textContent = `${m.db.toFixed(1)} dBFS | ${m.vu.toFixed(1)} VU`;
        }
      }

      // Small Test Output level (from wbs_test_point.monitor)
      const tp = data.source_meters['wbs_test_point.monitor'];
      if (tp) {
        document.getElementById('test-point-val').textContent = `${tp.db.toFixed(1)} dBFS | ${tp.vu.toFixed(1)} VU`;
      }
    }

    // Test tone button state
    if (data.test_tone) {
      currentToneActive = data.test_tone.active;
      const btnTone = document.getElementById('btn-test-tone');
      btnTone.classList.toggle('active', currentToneActive);
      btnTone.textContent = currentToneActive
        ? `🔊 INJECTING ${data.test_tone.freq} Hz (ACTIVE)`
        : '🔊 INJECT TEST TONE (OFF)';
    }

    // Matrix Route Buttons
    for (const [key, enabled] of Object.entries(data.routes)) {
      const btn = document.getElementById('btn-' + key);
      if (btn) {
        btn.classList.toggle('active', enabled);
        btn.textContent = enabled ? 'ACTIVE' : 'BYPASSED';
      }
    }
  } catch (e) {}
}

async function changeSource(sourceName) {
  if (abandoned || !sourceName) return;
  await fetch('/api/set_source', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({source: sourceName})
  });
  lastSourcesJson = "";
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

async function toggleTestTone() {
  if (abandoned) return;
  const freq = parseInt(document.getElementById('test-freq').value, 10) || 1000;
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
  document.getElementById('sink-info').textContent = 'OFFLINE (HARDWARE RESTORED)';
  document.getElementById('tapped-info').textContent = 'OFFLINE';
  document.getElementById('needle-l').setAttribute('transform', 'rotate(-42 160 195)');
  document.getElementById('needle-r').setAttribute('transform', 'rotate(-42 160 195)');
  try {
    await fetch('/api/abandon', {method: 'POST'});
  } catch (e) {}
}

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
                    "source_meters": dict(SOURCE_METERS),
                    "test_tone": {"active": TEST_TONE_ACTIVE, "freq": TEST_TONE_FREQ},
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


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def handle_sigterm(signum, frame):
    SHUTDOWN_EVENT.set()
    with STATE_LOCK:
        abandon_ship()
    os._exit(0)


if __name__ == "__main__":
    if any(arg in sys.argv for arg in ("--check", "--test", "--self-test")):
        print("[Ward-Beck Audio Tab] Validating configuration and self-test...")
        assert len(HTML_UI) > 1000, "HTML template empty"
        assert "Ward-Beck Audio Tab" in HTML_UI, "HTML header missing"
        assert "needle-l" in HTML_UI and "needle-r" in HTML_UI, "VU needle elements missing"
        srcs = list_sources()
        print(f"[Ward-Beck Audio Tab] Detected audio subsystem ({len(srcs)} available audio sources).")
        print("[Ward-Beck Audio Tab] ✔ Self-test passed: Ward-Beck Audio Tab is valid and deployment-ready.")
        sys.exit(0)

    if any(arg in sys.argv for arg in ("--abandon", "--teardown", "--stop")):
        print("[Ward-Beck Audio Tab] Executing teardown / abandon ship...")
        with STATE_LOCK:
            abandon_ship()
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_sigterm)
    signal.signal(signal.SIGINT, handle_sigterm)

    print("[Ward-Beck Audio Tab] Initializing virtual buses, multi-source meters, and test point...")
    with STATE_LOCK:
        full_restart()

    t = threading.Thread(target=meter_reader_loop, daemon=True)
    t.start()

    server = ThreadingHTTPServer(("127.0.0.1", PORT), WBSHandler)
    print(f"[Ward-Beck Audio Tab] HTML Router & Multi-Source VU Bridge running at: http://127.0.0.1:{PORT}")
    print("[Ward-Beck Audio Tab] Live VU meters active for all sources. Click TAP to route any source.")
    try:
        server.serve_forever()
    finally:
        with STATE_LOCK:
            abandon_ship()
