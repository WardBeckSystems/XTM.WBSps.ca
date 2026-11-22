#!/usr/bin/env python3
"""
Ward-Beck Systems - Linux Audio Layered Pipeline Inspector
==========================================================
Inspects and visualizes the 3-layer Linux audio architecture:
1. Kernel & Hardware Layer: ALSA cards, PCM devices, hardware mixer controls (amixer/alsamixer).
2. Graph & Session Layer: PipeWire unified multimedia graph & WirePlumber session manager (nodes, ports, links, quantum, latency).
3. High-Throughput Shared-Memory Layer: EBU DMF / MXL (/dev/shm/mxl) continuous Float32 circular ring buffers.

Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.
"""

import json
import os
import re
import subprocess
import time


def run_cmd(args):
    try:
        res = subprocess.run(args, capture_output=True, text=True, timeout=2.0)
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return -1, "", str(e)


def inspect_alsa() -> dict:
    """Inspects Kernel & Hardware Layer (ALSA)."""
    cards = []
    code, out, _ = run_cmd(["aplay", "-l"])
    if code == 0:
        # Parse card entries
        # card 0: NVidia [HDA NVidia], device 3: HDMI 0 [LEN LT2452pwC]
        for line in out.splitlines():
            line = line.strip()
            if line.startswith("card "):
                cards.append(line)

    # Simple mixer controls via amixer
    mixer_controls = []
    code, sctrls_out, _ = run_cmd(["amixer", "scontrols"])
    if code == 0:
        for line in sctrls_out.splitlines():
            m = re.search(r"'([^']+)'", line)
            if m:
                cname = m.group(1)
                # Query contents of control
                _, scontent, _ = run_cmd(["amixer", "sget", cname])
                vol_m = re.search(r"\[(\d+%)\]", scontent)
                db_m = re.search(r"\[(-?\d+\.\d+dB)\]", scontent)
                switch_m = re.search(r"\[(on|off)\]", scontent)
                mixer_controls.append({
                    "name": cname,
                    "volume": vol_m.group(1) if vol_m else "N/A",
                    "db": db_m.group(1) if db_m else "N/A",
                    "state": switch_m.group(1) if switch_m else "N/A",
                })

    return {
        "status": "active" if cards else "no_cards",
        "card_count": len(cards),
        "cards": cards,
        "mixer_controls": mixer_controls,
        "pcm_capture_available": os.path.exists("/dev/snd/pcmC0D0c") or os.path.exists("/proc/asound"),
    }


def inspect_pipewire() -> dict:
    """Inspects Graph & Session Layer (PipeWire & WirePlumber)."""
    code, wp_out, _ = run_cmd(["wpctl", "status"])
    devices = []
    sinks = []
    sources = []
    streams = []

    current_section = None
    if code == 0:
        for line in wp_out.splitlines():
            s = line.strip()
            if "Devices:" in s:
                current_section = "devices"
                continue
            elif "Sinks:" in s:
                current_section = "sinks"
                continue
            elif "Sources:" in s:
                current_section = "sources"
                continue
            elif "Streams:" in s:
                current_section = "streams"
                continue
            elif s.startswith("Video") or s.startswith("Settings"):
                current_section = None
                continue

            if current_section and s and not s.startswith("├") and not s.startswith("└") and not s.startswith("│"):
                # Clean entry line
                cleaned = re.sub(r"^[│\s*├─└]+\s*", "", line).strip()
                if not cleaned:
                    continue
                if current_section == "devices":
                    devices.append(cleaned)
                elif current_section == "sinks":
                    sinks.append(cleaned)
                elif current_section == "sources":
                    sources.append(cleaned)
                elif current_section == "streams":
                    streams.append(cleaned)

    # Query active graph quantum and sample rate via pw-dump
    graph_quantum = 256
    graph_rate = 48000
    code, pw_dump_out, _ = run_cmd(["pw-dump", "Node"])
    if code == 0 and pw_dump_out.strip():
        try:
            nodes = json.loads(pw_dump_out)
            for node in nodes:
                props = node.get("info", {}).get("props", {})
                if "clock.quantum-limit" in props:
                    graph_quantum = props.get("clock.quantum-limit")
        except Exception:
            pass

    return {
        "status": "running" if (sinks or sources) else "idle",
        "server": "PipeWire 1.0 (with WirePlumber)",
        "graph_sample_rate": graph_rate,
        "graph_quantum": graph_quantum,
        "graph_quantum_ms": round((graph_quantum / graph_rate) * 1000, 2),
        "devices": devices,
        "sinks": sinks,
        "sources": sources,
        "streams": streams[:12],  # Top 12 streams
    }


def inspect_full_pipeline(mxl_engine=None) -> dict:
    """Returns the complete 3-layer Linux audio architecture telemetry."""
    mxl_info = {}
    if mxl_engine:
        mxl_info = mxl_engine.get_telemetry()
    else:
        # Check /dev/shm/mxl directly
        shm_path = "/dev/shm/mxl"
        exists = os.path.exists(shm_path)
        domains = []
        if exists:
            try:
                for entry in os.listdir(shm_path):
                    p = os.path.join(shm_path, entry)
                    if os.path.isdir(p):
                        domains.append(entry)
            except Exception:
                pass
        mxl_info = {
            "domain_id": domains[0] if domains else "none",
            "shm_base_dir": shm_path,
            "flows": [],
            "available": exists,
        }

    return {
        "timestamp": time.time(),
        "architecture": "Layered Linux Audio Pipeline & DMF/MXL Media Exchange",
        "layers": {
            "layer1_kernel_hardware": {
                "name": "Kernel & Hardware Layer (ALSA)",
                "description": "Kernel drivers, hardware mixer controls, and low-level PCM audio interfaces",
                "telemetry": inspect_alsa(),
            },
            "layer2_graph_session": {
                "name": "Graph & Session Layer (PipeWire & WirePlumber)",
                "description": "Unified multimedia graph server, routing nodes, links, and audio quantum management",
                "telemetry": inspect_pipewire(),
            },
            "layer3_shared_memory_mxl": {
                "name": "High-Throughput Shared-Memory Layer (EBU DMF / MXL)",
                "description": "Lock-free circular ring buffers in POSIX shared memory (/dev/shm/mxl) for Float32 continuous audio",
                "telemetry": mxl_info,
            },
        },
    }


if __name__ == "__main__":
    rep = inspect_full_pipeline()
    print(json.dumps(rep, indent=2))
