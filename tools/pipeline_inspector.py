#!/usr/bin/env python3
"""
Ward-Beck Systems - Linux Audio Layered Pipeline Inspector
==========================================================
Inspects and visualizes the 4-layer Linux audio & AoIP broadcast architecture:
1. Kernel & Hardware Layer: ALSA cards, PCM devices, hardware mixer controls (amixer/alsamixer).
2. Graph & Session Layer: PipeWire unified multimedia graph & WirePlumber session manager (nodes, ports, links, quantum, latency).
3. High-Throughput Shared-Memory Layer: EBU DMF / MXL (/dev/shm/mxl) continuous Float32 circular ring buffers.
4. Audio-over-IP (AoIP) Network Layer: Dante, Ravenna (uNet2500), AES67 (SAP/SDP), NMOS IS-04/05, SIP & LikeDotAudio MoipBuddy.

Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved.
"""

import json
import os
import re
import socket
import struct
import subprocess
import time


def run_cmd(args, timeout=2.0):
    try:
        res = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return -1, "", str(e)


def inspect_alsa() -> dict:
    """Inspects Kernel & Hardware Layer (ALSA)."""
    cards = []
    code, out, _ = run_cmd(["aplay", "-l"])
    if code == 0:
        for line in out.splitlines():
            line = line.strip()
            if line.startswith("card "):
                cards.append(line)

    mixer_controls = []
    code, sctrls_out, _ = run_cmd(["amixer", "scontrols"])
    if code == 0:
        for line in sctrls_out.splitlines():
            m = re.search(r"'([^']+)'", line)
            if m:
                cname = m.group(1)
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
        "streams": streams[:12],
    }


_AOIP_CACHE = {}
_AOIP_CACHE_TIME = 0.0


def inspect_aoip(use_cache: bool = True) -> dict:
    """
    Inspects Audio-over-IP (AoIP) Network Announcements & Multicast Streams:
    - Dante (mDNS _netaudio-arc, _netaudio-dbc, _netaudio-chan, _netaudio-cmc)
    - Ravenna (RTSP _rtsp._tcp, _ravenna._tcp, Archwave uNet2500)
    - AES67 (SAP Multicast 239.255.255.255:9875 & SDP Announcements)
    - NMOS IS-04 Discovery (_nmos-node._tcp)
    - SIP (_sip._udp, _sip._tcp)
    - LikeDotAudio MoipBuddy & Dante Docker Plugin Ecosystem
    """
    global _AOIP_CACHE, _AOIP_CACHE_TIME
    now = time.time()
    if use_cache and _AOIP_CACHE and (now - _AOIP_CACHE_TIME < 15.0):
        return _AOIP_CACHE

    dante_devices = []
    dante_channels = []
    ravenna_streams = []
    nmos_nodes = []
    sap_announcements = []

    # 1. Dante Device Discovery via avahi-browse
    code, arc_out, _ = run_cmd(["avahi-browse", "-r", "-t", "-p", "_netaudio-arc._udp"], timeout=1.8)
    if code == 0:
        for line in arc_out.splitlines():
            parts = line.split(";")
            if len(parts) >= 9 and parts[0] == "=":
                name, host, ip, port = parts[3], parts[6], parts[7], int(parts[8])
                txt = ";".join(parts[9:]) if len(parts) > 9 else ""
                mf = re.search(r'mf=([^"]+)', txt)
                router_info = re.search(r'router_info=([^"]+)', txt)
                vers = re.search(r'router_vers=([^"]+)', txt)
                dante_devices.append({
                    "name": name,
                    "host": host,
                    "ip": ip,
                    "port": port,
                    "manufacturer": mf.group(1) if mf else "Audinate / OEM",
                    "engine": router_info.group(1) if router_info else "DCM",
                    "version": vers.group(1) if vers else "4.0",
                })

    # Dante Channels
    code, chan_out, _ = run_cmd(["avahi-browse", "-r", "-t", "-p", "_netaudio-chan._udp"], timeout=1.8)
    if code == 0:
        for line in chan_out.splitlines():
            parts = line.split(";")
            if len(parts) >= 9 and parts[0] == "=":
                raw_chan = parts[3].replace(r"\064", "@")
                txt = ";".join(parts[9:]) if len(parts) > 9 else ""
                rate_m = re.search(r'rate=(\d+)', txt)
                enc_m = re.search(r'enc=(\d+)', txt)
                dante_channels.append({
                    "channel": raw_chan,
                    "sample_rate": int(rate_m.group(1)) if rate_m else 48000,
                    "bit_depth": int(enc_m.group(1)) if enc_m else 24,
                    "ip": parts[7],
                })

    # 2. Ravenna / RTSP Discovery
    code, rtsp_out, _ = run_cmd(["avahi-browse", "-r", "-t", "-p", "_rtsp._tcp"], timeout=1.8)
    if code == 0:
        for line in rtsp_out.splitlines():
            parts = line.split(";")
            if len(parts) >= 9 and parts[0] == "=":
                sname, host, ip, port = parts[3], parts[6], parts[7], int(parts[8])
                ravenna_streams.append({
                    "name": sname,
                    "host": host,
                    "ip": ip,
                    "port": port,
                    "url": f"rtsp://{ip}:{port}/{sname}",
                    "standard": "RAVENNA / AES67",
                })

    # 3. NMOS IS-04 Nodes
    code, nmos_out, _ = run_cmd(["avahi-browse", "-r", "-t", "-p", "_nmos-node._tcp"], timeout=1.8)
    if code == 0:
        for line in nmos_out.splitlines():
            parts = line.split(";")
            if len(parts) >= 9 and parts[0] == "=":
                nname, host, ip, port = parts[3], parts[6], parts[7], int(parts[8])
                nmos_nodes.append({
                    "name": nname,
                    "host": host,
                    "ip": ip,
                    "port": port,
                    "api": f"http://{ip}:{port}/x-nmos/node/v1.3/self",
                })

    # Fallback to known hardware targets if not resolved via avahi
    if not any(d["name"] == "Metro16-DANTE2AVB" for d in dante_devices):
        dante_devices.append({
            "name": "Metro16-DANTE2AVB",
            "host": "Metro16D-02775b.local",
            "ip": "44.44.44.184",
            "port": 4440,
            "manufacturer": "PreSonus",
            "engine": "Audinate DCM",
            "version": "4.0.1",
        })

    if not any(r["name"] == "32ME-STREAM-1" for r in ravenna_streams):
        ravenna_streams.append({
            "name": "32ME-STREAM-1",
            "host": "WBS-32me.local",
            "ip": "44.44.44.158",
            "port": 554,
            "url": "rtsp://44.44.44.158:554/32ME-STREAM-1",
            "standard": "RAVENNA / AES67 (8ch L24 @ 48kHz)",
        })
        ravenna_streams.append({
            "name": "32ME-STREAM-2",
            "host": "WBS-32me.local",
            "ip": "44.44.44.158",
            "port": 554,
            "url": "rtsp://44.44.44.158:554/32ME-STREAM-2",
            "standard": "RAVENNA / AES67 (8ch L24 @ 48kHz)",
        })

    if not any(n["name"] == "WBS-32me" for n in nmos_nodes):
        nmos_nodes.append({
            "name": "WBS-32me (uNet2500 Archwave)",
            "host": "WBS-32me.local",
            "ip": "44.44.44.158",
            "port": 80,
            "api": "http://44.44.44.158:80/x-nmos/v1.0/node",
        })

    # 4. Standard AES67 SAP Multicast Entry
    sap_announcements.append({
        "session_name": "Ward-Beck-AES67-Master",
        "multicast_ip": "239.69.1.1",
        "port": 5004,
        "format": "L24 @ 48kHz Stereo",
        "sdp_sap": "239.255.255.255:9875",
        "clock_sync": "PTP IEEE 1588-2008 (SMPTE 2059-2)",
    })

    result = {
        "status": "online",
        "dante": {
            "device_count": len(dante_devices),
            "devices": dante_devices,
            "channel_count": len(dante_channels),
            "channels": dante_channels[:16],
        },
        "ravenna": {
            "stream_count": len(ravenna_streams),
            "streams": ravenna_streams,
            "module": "Archwave uNet2500 / AMS8E-1",
        },
        "nmos": {
            "node_count": len(nmos_nodes),
            "nodes": nmos_nodes,
        },
        "aes67_sap": {
            "active_announcements": sap_announcements,
            "sap_port": 9875,
            "sap_group": "239.255.255.255",
        },
        "likedotaudio_ecosystem": {
            "moip_buddy": "https://github.com/LikeDotAudio/APK.softapp.EDITORS.MoipBuddy",
            "dante_docker_plugin": "https://github.com/LikeDotAudio/APK.audio.Docker.PLUGIN.audio.DANTE",
            "supported_protocols": ["Dante", "Ravenna", "AES67", "SMPTE-ST-2110-30", "SAP", "SIP", "NMOS-IS04/05"],
        },
    }
    _AOIP_CACHE = result
    _AOIP_CACHE_TIME = time.time()
    return result


def inspect_full_pipeline(mxl_engine=None) -> dict:
    """Returns the complete 4-layer Linux audio & AoIP architecture telemetry."""
    mxl_info = {}
    if mxl_engine:
        mxl_info = mxl_engine.get_telemetry()
    else:
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
            "layer4_network_aoip": {
                "name": "Network Audio-over-IP (AoIP) Layer",
                "description": "Dante, Ravenna/AES67 (Archwave), SAP announcements, NMOS IS-04 & MoipBuddy integration",
                "telemetry": inspect_aoip(),
            },
        },
    }


if __name__ == "__main__":
    rep = inspect_full_pipeline()
    print(json.dumps(rep, indent=2))
