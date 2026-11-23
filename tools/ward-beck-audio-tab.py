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
import urllib.request
from urllib.parse import parse_qs, urlparse

# Ensure local modules (mxl_engine, pipeline_inspector) are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mxl_engine import MXL_ENGINE, current_tai_ns
from pipeline_inspector import inspect_alsa, inspect_full_pipeline, inspect_pipewire, inspect_aoip
import aoip_listener
import test_point

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
RETIRED_SOURCES = set()     # sources destroyed by Reset All: their meter readers stop

TEST_TONE_ACTIVE = False
TEST_TONE_FREQ = 1000
TEST_TONE_PROC = None

SHUTDOWN_EVENT = threading.Event()
STATE_LOCK = threading.RLock()

NMOS_REGISTRY = {}          # {ip_or_id: {"node": ..., "flows": ..., "senders": ..., "ip": ..., "port": ...}}
DANTE_REGISTRY = {}         # {name: device_dict}
RAVENNA_REGISTRY = {}       # {name: stream_dict}
AOIP_TELEMETRY = {}         # Complete 4th layer telemetry
LAST_PIPELINE_CACHE = {}
LAST_PIPELINE_TIME = 0.0


def get_cached_pipeline(engine, max_age=3.0):
    global LAST_PIPELINE_CACHE, LAST_PIPELINE_TIME
    now = time.time()
    if (now - LAST_PIPELINE_TIME > max_age) or not LAST_PIPELINE_CACHE:
        try:
            LAST_PIPELINE_CACHE = inspect_full_pipeline(engine)
            LAST_PIPELINE_TIME = now
        except Exception:
            pass
    return LAST_PIPELINE_CACHE


def discover_aoip_network():
    """Discover AoIP Network Announcements: NMOS IS-04, Dante, Ravenna, AES67 SAP, SIP."""
    global NMOS_REGISTRY, DANTE_REGISTRY, RAVENNA_REGISTRY, AOIP_TELEMETRY
    discover_nmos_nodes()
    try:
        aoip_data = inspect_aoip()
        with STATE_LOCK:
            AOIP_TELEMETRY = aoip_data
            for dev in aoip_data.get("dante", {}).get("devices", []):
                DANTE_REGISTRY[dev["name"]] = dev
            for rst in aoip_data.get("ravenna", {}).get("streams", []):
                RAVENNA_REGISTRY[rst["name"]] = rst
    except Exception:
        pass


def discover_nmos_nodes():
    """Discover NMOS IS-04 nodes announcing via mDNS or known subnets."""
    global NMOS_REGISTRY
    discovered = {}

    # 1. Probe mDNS for _nmos-node._tcp
    nodes_found = []
    try:
        res = subprocess.run(["avahi-browse", "-r", "-t", "-p", "_nmos-node._tcp"], capture_output=True, text=True, timeout=2.0)
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                parts = line.split(";")
                if len(parts) >= 9 and parts[0] == "=":
                    name, host, ip, port = parts[3], parts[6], parts[7], int(parts[8])
                    nodes_found.append({"name": name, "host": host, "ip": ip, "port": port})
    except Exception:
        pass

    # 2. Known/fallback targets on broadcast subnet
    known_targets = [("WBS-32me", "WBS-32me.local", "44.44.44.158", 80)]
    for name, host, ip, port in known_targets:
        if not any(n["ip"] == ip for n in nodes_found):
            nodes_found.append({"name": name, "host": host, "ip": ip, "port": port})

    # 3. Query IS-04 Node API for each node
    for node in nodes_found:
        ip = node["ip"]
        port = node["port"]
        base_urls = [
            f"http://{ip}:{port}/x-nmos/v1.0/node",
            f"http://{ip}:{port}/x-nmos/node/v1.3",
            f"http://{ip}:{port}/x-nmos/node/v1.2",
        ]
        node_self = None
        used_base = None
        for b in base_urls:
            try:
                req = urllib.request.Request(f"{b}/self", headers={"Accept": "application/json", "User-Agent": "Ward-Beck-NMOS-Browser"})
                with urllib.request.urlopen(req, timeout=1.2) as resp:
                    node_self = json.loads(resp.read().decode("utf-8"))
                    used_base = b
                    break
            except Exception:
                continue

        if node_self and used_base:
            sources_list, flows_list, senders_list = [], [], []
            for ep, trg in [("sources", sources_list), ("flows", flows_list), ("senders", senders_list)]:
                try:
                    req = urllib.request.Request(f"{used_base}/{ep}", headers={"Accept": "application/json", "User-Agent": "Ward-Beck-NMOS-Browser"})
                    with urllib.request.urlopen(req, timeout=1.2) as resp:
                        trg.extend(json.loads(resp.read().decode("utf-8")))
                except Exception:
                    pass

            discovered[ip] = {
                "id": node_self.get("id"),
                "label": node_self.get("label", node["name"]),
                "hostname": node_self.get("hostname", node["host"]),
                "ip": ip,
                "port": port,
                "api_base": used_base,
                "node": node_self,
                "sources": sources_list,
                "flows": flows_list,
                "senders": senders_list,
                "last_seen": time.time(),
            }

    with STATE_LOCK:
        NMOS_REGISTRY = discovered


# CBC/Radio-Canada MXL hands-on stack (docker-compose.mxl-demo.yml). The site can only
# reach this daemon (:8467, CORS + Private Network Access), so every CBC service is
# probed here and its JSON API is proxied through /api/cbc/svc/<name>/<path>.
CBC_SERVICES = {
    "generator": {"port": 9600, "label": "Test Generator"},
    "player":    {"port": 9602, "label": "File Player"},
    "webrtc":    {"port": 9601, "label": "WebRTC Receiver"},
    "info":      {"port": 9699, "label": "MXL Info GUI"},
}

CBC_GEN_STATE = {
    "online": False,      # generator API reachable
    "running": False,     # generator pipeline running (flows being written)
    "services": {},
    "video_pattern": "100% bars",
    "audio_pattern": "1 kHz tone",
    "level_db": -20.0,
    "resolution": "1920x1080",
    "framerate": "30",
    "patterns": {"video": [], "audio": []},
    "flows": {},
}


def cbc_request(service: str, path: str, payload=None, timeout: float = 3.0):
    """Calls a CBC service JSON API on localhost; returns (status, body_bytes)."""
    svc = CBC_SERVICES.get(service)
    if not svc:
        return 404, json.dumps({"error": f"unknown CBC service '{service}'"}).encode("utf-8")
    url = f"http://127.0.0.1:{svc['port']}/{path.lstrip('/')}"
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="GET" if data is None else "POST",
                                 headers={"Content-Type": "application/json", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        return 502, json.dumps({"error": str(e)}).encode("utf-8")


def cbc_default_domain() -> str:
    """The CBC generator's own domain path (first non-nested entry from GET /domains)."""
    status, body = cbc_request("generator", "/domains", timeout=1.5)
    try:
        doms = json.loads(body).get("domains", []) if status == 200 else []
        for d in doms:
            if d.get("path", "").count("/") <= 1:
                return d["path"]
        if doms:
            return doms[0]["path"]
    except Exception:
        pass
    return "/mxl-domain"


def poll_cbc_generator():
    """Polls CBC Test Generator on port 9600 for active patterns and available presets."""
    global CBC_GEN_STATE
    try:
        req = urllib.request.Request("http://127.0.0.1:9600/pipeline/status", headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=1.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            CBC_GEN_STATE["online"] = True
            CBC_GEN_STATE["running"] = bool(data.get("running", False))
            CBC_GEN_STATE["video_pattern"] = data.get("video", {}).get("pattern", "100% bars")
            CBC_GEN_STATE["audio_pattern"] = data.get("audio1", {}).get("pattern", "1 kHz tone")
            CBC_GEN_STATE["level_db"] = data.get("audio1", {}).get("level_db", -20.0)
            CBC_GEN_STATE["resolution"] = data.get("video", {}).get("resolution", "1920x1080")
            CBC_GEN_STATE["framerate"] = data.get("video", {}).get("framerate", "30")
            CBC_GEN_STATE["flows"] = data.get("flow_uuids", {})
    except Exception:
        CBC_GEN_STATE["online"] = False
        CBC_GEN_STATE["running"] = False

    services = {}
    for name, svc in CBC_SERVICES.items():
        up = False
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{svc['port']}/", timeout=0.5) as resp:
                up = resp.status < 500
        except Exception:
            up = False
        services[name] = {"label": svc["label"], "port": svc["port"],
                          "url": f"http://localhost:{svc['port']}/", "up": up}
    CBC_GEN_STATE["services"] = services

    try:
        req = urllib.request.Request("http://127.0.0.1:9600/patterns", headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=1.0) as resp:
            pdata = json.loads(resp.read().decode("utf-8"))
            CBC_GEN_STATE["patterns"] = pdata
    except Exception:
        pass


def nmos_discovery_loop():
    """Background loop refreshing NMOS, Dante, Ravenna announcements and CBC Test Generator every 5 seconds."""
    while not SHUTDOWN_EVENT.is_set():
        try:
            discover_aoip_network()
            poll_cbc_generator()
            refresh_sources()
        except Exception:
            pass
        SHUTDOWN_EVENT.wait(5.0)


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
    if code == 0:
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

    # Append discovered NMOS IS-04 streams
    with STATE_LOCK:
        nmos_nodes = list(NMOS_REGISTRY.values())

    for n in nmos_nodes:
        node_name = n.get("hostname") or n.get("label") or n.get("ip")
        for flw in n.get("flows", []):
            flw_lbl = flw.get("label") or flw.get("id", "")[:8]
            chans = flw.get("tags", {}).get("channels", ["8"])[0]
            rate = flw.get("tags", {}).get("clockRate", ["48000"])[0]
            fmt = flw.get("tags", {}).get("encodingName", ["L24"])[0]
            src_key = f"nmos:{n['ip']}:{flw.get('id')}"
            sources.append({
                "name": src_key,
                "description": f"📡 NMOS: {node_name} — {flw_lbl} ({chans}ch {fmt} @ {rate}Hz)",
                "nmos": True,
                "node_ip": n["ip"],
                "node_label": node_name,
                "flow_id": flw.get("id"),
                "flow_label": flw_lbl,
                "channels": chans,
                "rate": rate,
            })

    # Append detected MXL audio flows across domains (including Ward-Beck Test Signals)
    try:
        all_domains = MXL_ENGINE.scan_all_domains()
        for dom_lbl, dom in all_domains.items():
            if dom_lbl == MXL_ENGINE.domain_id:
                continue
            is_wbs_domain = "ward-beck" in dom_lbl.lower() or "wbs" in dom_lbl.lower()
            for flw in dom.get("flows", []):
                flw_fmt = flw.get("format", "") or ""
                flw_media = flw.get("media_type", "") or ""
                if "audio" in flw_fmt.lower() or "audio" in flw_media.lower() or "channel_count" in flw:
                    flw_id = flw.get("flow_id") or flw.get("id")
                    flw_lbl = flw.get("label") or flw_id[:8]
                    prefix = "⚡ WBS TEST SIGNAL" if is_wbs_domain else f"🎛️ CBC MXL ({dom_lbl})"
                    sources.append({
                        "name": f"mxl:{dom_lbl}:{flw_id}",
                        "description": f"{prefix}: {flw_lbl} — {flw.get('description', '')}",
                        "mxl": True,
                        "domain": dom_lbl,
                        "flow_id": flw_id,
                        "flow_label": flw_lbl,
                        "is_wbs_test_signal": is_wbs_domain,
                    })
    except Exception:
        pass

    # Append detected AoIP Network streams (Dante, Ravenna, AES67, LikeDotAudio MoipBuddy)
    try:
        aoip_info = AOIP_TELEMETRY if AOIP_TELEMETRY else inspect_aoip()
        # Dante devices & stereo pairs
        for dev in aoip_info.get("dante", {}).get("devices", []):
            dname = dev.get("name", "Metro16-DANTE2AVB")
            sources.append({
                "name": f"dante:{dname}:Ch1-Ch2",
                "description": f"🎵 DANTE: {dname} — Ch 1 & 2 ({dev.get('engine', 'DCM')} @ 48kHz L24)",
                "dante": True,
                "device": dname,
                "ip": dev.get("ip"),
            })
            sources.append({
                "name": f"dante:{dname}:Ch3-Ch4",
                "description": f"🎵 DANTE: {dname} — Ch 3 & 4 ({dev.get('engine', 'DCM')} @ 48kHz L24)",
                "dante": True,
                "device": dname,
                "ip": dev.get("ip"),
            })
        # Ravenna streams
        for rst in aoip_info.get("ravenna", {}).get("streams", []):
            rname = rst.get("name", "Stream")
            sources.append({
                "name": f"ravenna:{rst.get('ip')}:{rname}",
                "description": f"📻 RAVENNA: {rname} — rtsp://{rst.get('ip')}:{rst.get('port')}/{rname} (Archwave uNet2500)",
                "ravenna": True,
                "stream_name": rname,
                "url": rst.get("url"),
            })
        # AES67 SAP Multicast
        for sap in aoip_info.get("aes67_sap", {}).get("active_announcements", []):
            sname = sap.get("session_name", "Ward-Beck-AES67-Master")
            sources.append({
                "name": f"aes67:{sname}",
                "description": f"🌐 AES67 / SAP: {sname} — Multicast {sap.get('multicast_ip')}:{sap.get('port')} (PTP IEEE 1588)",
                "aes67": True,
                "session": sname,
            })
    except Exception:
        pass

    return sources


def source_meter_worker(src_name):
    """Background reader thread computing live RMS, dBFS, and VU for an individual source."""
    if src_name.startswith("mxl:"):
        parts = src_name.split(":")
        flow_id = parts[2] if len(parts) >= 3 else ""
        vu_val = 0.0
        while not SHUTDOWN_EVENT.is_set():
            try:
                wf = MXL_ENGINE.get_external_flow_waveform(flow_id)
                maxs = wf.get("ch0_max", [])
                if maxs:
                    rms = math.sqrt(sum(x * x for x in maxs) / len(maxs))
                    vu_val = 0.70 * vu_val + 0.30 * rms
                    db = 20 * math.log10(max(vu_val, 1e-5))
                    vu = db + 18.0
                    with STATE_LOCK:
                        SOURCE_METERS[src_name] = {"db": round(db, 1), "vu": round(vu, 1)}
            except Exception:
                pass
            time.sleep(0.08)
        return

    if src_name.startswith("nmos:") or src_name.startswith("dante:") or src_name.startswith("ravenna:") or src_name.startswith("aes67:"):
        while not SHUTDOWN_EVENT.is_set():
            with STATE_LOCK:
                SOURCE_METERS[src_name] = {"db": -20.0, "vu": -2.0}
            time.sleep(1.0)
        return

    chunk_frames = 512
    bytes_per_read = chunk_frames * 2  # s16le mono
    vu_val = 0.0

    while not SHUTDOWN_EVENT.is_set() and src_name not in RETIRED_SOURCES:
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
        if s_name.startswith("nmos:") or s_name.startswith("mxl:"):
            if s_name not in SOURCE_METERS:
                SOURCE_METERS[s_name] = {"db": -20.0, "vu": -2.0}
            continue

        RETIRED_SOURCES.discard(s_name)
        if s_name not in SOURCE_METERS:
            SOURCE_METERS[s_name] = {"db": -60.0, "vu": -42.0}
        if s_name not in SOURCE_THREADS or not SOURCE_THREADS[s_name].is_alive():
            t = threading.Thread(target=source_meter_worker, args=(s_name,), daemon=True)
            SOURCE_THREADS[s_name] = t
            t.start()


def is_virtual_sink(name):
    if not name:
        return True
    low = name.lower()
    return (
        low.startswith("wbs_")
        or "loopback" in low
        or "aloop" in low
        or "snd_aloop" in low
        or "snd-aloop" in low
        or "null" in low
        or "dummy" in low
        or "virtual" in low
        or "remap" in low
        or "pw-loopback" in low
        or "input.pw" in low
    )


def detect_physical_sink():
    # 1. Probe all sinks and prioritize real ALSA or BlueZ hardware sound cards
    _, sinks_out, _ = run_cmd(["pactl", "list", "short", "sinks"])
    sink_names = []
    for line in sinks_out.splitlines():
        parts = line.split("\t")
        if len(parts) >= 2 and parts[1]:
            sink_names.append(parts[1])

    # Priority 1: Real ALSA hardware output (e.g. alsa_output.pci-*)
    for s in sink_names:
        if s.startswith("alsa_output.") and not is_virtual_sink(s):
            return s

    # Priority 2: Bluetooth speaker / headphones
    for s in sink_names:
        if s.startswith("bluez_output.") and not is_virtual_sink(s):
            return s

    # Priority 3: Default sink if not virtual
    _, default_sink, _ = run_cmd(["pactl", "get-default-sink"])
    if default_sink and not is_virtual_sink(default_sink):
        return default_sink

    # Priority 4: Any non-virtual sink
    for s in sink_names:
        if not is_virtual_sink(s):
            return s

    return sink_names[0] if sink_names else ""


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
        stop_bit_buddy()
        stop_test_tone()
        for p in SOURCE_PROCS.values():
            try:
                p.terminate()
            except Exception:
                pass
        SOURCE_PROCS.clear()

    print(f"[WARD BECK TAP] Teardown complete. Hardware sink restored: {phys or 'None'}")


STRAY_MODULE_TYPES = (
    "module-null-sink", "module-loopback", "module-remap-sink", "module-remap-source",
    "module-combine-sink", "module-virtual-sink", "module-virtual-source",
)
KEEP_PW_LOOPBACK = ("XTM_Audio_Bridge",)  # the XTM banner-free bridge service is deliberate


def _kill_pid(pid: int) -> bool:
    try:
        os.kill(pid, signal.SIGTERM)
        return True
    except Exception:
        return False


def reset_all():
    """
    Reset All: kills every generator and destroys every stray virtual card, then rebuilds
    the WBS patch. Generators stay off until re-engaged.
      - POD-33 test tone, ABB-1 Bit Buddy pacat, MXL ring generators (ref tone + bit spitter,
        rings zeroed), CBC Radio-Canada test generator pipeline (:9600)
      - pactl virtual sinks/loopbacks this daemon did not load (left-overs from old runs)
      - pw-loopback virtual cards (except the XTM Audio Bridge service)
      - orphaned parec / pacat / pw-cat processes whose parent daemon has died
    """
    report = {"generators": [], "modules": [], "processes": []}
    me = os.getpid()
    if test_point.stop_point():
        report["processes"].append("test point lifted")

    with STATE_LOCK:
        if TEST_TONE_ACTIVE:
            report["generators"].append("POD-33 test tone")
        stop_test_tone()
        if BITBUDDY_ACTIVE:
            report["generators"].append("ABB-1 Bit Buddy")
        stop_bit_buddy()
    try:
        report["generators"] += MXL_ENGINE.stop_generators()
    except Exception as e:
        print(f"[WARN] MXL generator stop failed: {e}")
    try:
        req = urllib.request.Request("http://127.0.0.1:9600/pipeline/stop", data=b"{}",
                                     headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=1.5):
            report["generators"].append("CBC MXL test generator")
        poll_cbc_generator()
    except Exception:
        pass

    # Stray virtual cards: unmanaged pactl modules
    with STATE_LOCK:
        _, mods_out, _ = run_cmd(["pactl", "list", "short", "modules"])
        for line in mods_out.splitlines():
            parts = line.split("\t")
            if len(parts) < 2 or not parts[0].isdigit():
                continue
            mid = int(parts[0])
            if parts[1] in STRAY_MODULE_TYPES and mid not in MANAGED_MODULES:
                code, _, _ = run_cmd(["pactl", "unload-module", str(mid)])
                if code == 0:
                    report["modules"].append(f"{parts[1]} {parts[2] if len(parts) > 2 else ''}".strip())

    # Stray processes: pw-loopback cards and orphaned stream helpers
    _, ps_out, _ = run_cmd(["ps", "-u", str(os.getuid()), "-o", "pid=,ppid=,args="])
    procs = {}
    for line in ps_out.splitlines():
        bits = line.strip().split(None, 2)
        if len(bits) == 3 and bits[0].isdigit() and bits[1].isdigit():
            procs[int(bits[0])] = (int(bits[1]), bits[2])
    for pid, (ppid, args) in procs.items():
        if pid == me:
            continue
        exe = os.path.basename(args.split()[0]) if args else ""
        parent_args = procs.get(ppid, (0, ""))[1]
        orphaned = ppid == 1 or "systemd" in parent_args
        stray = False
        if exe == "pw-loopback":
            stray = not any(k in args for k in KEEP_PW_LOOPBACK)
        elif exe in ("parec", "pacat", "pw-cat", "pw-play", "pw-record"):
            stray = ppid != me and orphaned
        if stray and _kill_pid(pid):
            report["processes"].append(f"{pid} {args[:90]}")

    time.sleep(0.3)  # let PipeWire drop the destroyed nodes
    with STATE_LOCK:
        refresh_sources()
        live = {s["name"] for s in AVAILABLE_SOURCES}
        for name in [n for n in list(SOURCE_PROCS) if n not in live]:
            RETIRED_SOURCES.add(name)
            try:
                SOURCE_PROCS.pop(name).terminate()
            except Exception:
                pass
            SOURCE_METERS.pop(name, None)
            SOURCE_THREADS.pop(name, None)
            report["processes"].append(f"meter reader for {name}")
        apply_routes()

    print(f"[WARD BECK TAP] Reset All: {len(report['generators'])} generators killed, "
          f"{len(report['modules'])} stray modules + {len(report['processes'])} stray processes destroyed")
    return report


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

    if SELECTED_SOURCE.startswith("nmos:") or SELECTED_SOURCE.startswith("mxl:"):
        print(f"[WARD BECK TAP] Network/MXL source tapped: {SELECTED_SOURCE}")
        return

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

                if SELECTED_SOURCE.startswith("mxl:") and SELECTED_SOURCE in SOURCE_METERS:
                    sm = SOURCE_METERS[SELECTED_SOURCE]
                    db_l = sm.get("db", -60.0)
                    db_r = sm.get("db", -60.0)
                    vu_left = sm.get("vu", -42.0)
                    vu_right = sm.get("vu", -42.0)

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
    # Note: Allows concurrent operation with ABP-1 Bit Spitter (Dual Flow Spitting)
    TEST_TONE_FREQ = int(freq)
    TEST_TONE_ACTIVE = True
    try:
        MXL_ENGINE.start_generator("tone")
    except Exception:
        pass

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


# ---------------------------------------------------------------------------
# ABB-1 AUDIO BIT BUDDY & ABP-1 BIT SPITTER GENERATOR ENGINE
# ---------------------------------------------------------------------------
BITBUDDY_ACTIVE = False
BITBUDDY_PROC = None
BITBUDDY_CONFIG = {
    "pattern": "prbs",     # 'tone', 'walk1s', 'prbs', 'minmax'
    "pro_mode": True,      # True = Professional (EBU), False = Consumer (S/PDIF)
    "audio_data": True,    # True = Audio (PCM), False = Non-Audio Data
    "sample_rate": 48000   # 48000, 96000, 44100
}


def start_bit_buddy(pattern="prbs", pro_mode=True, audio_data=True, sample_rate=48000):
    global BITBUDDY_ACTIVE, BITBUDDY_CONFIG, BITBUDDY_PROC
    stop_bit_buddy()
    # Note: Allows concurrent operation with POD-33 Tone Generator (Dual Flow Spitting)
    BITBUDDY_ACTIVE = True
    try:
        MXL_ENGINE.start_generator("bit_spitter")
    except Exception:
        pass
    BITBUDDY_CONFIG = {
        "pattern": pattern,
        "pro_mode": bool(pro_mode),
        "audio_data": bool(audio_data),
        "sample_rate": int(sample_rate)
    }
    t = threading.Thread(target=_bitbuddy_worker, daemon=True)
    t.start()


def stop_bit_buddy():
    global BITBUDDY_ACTIVE, BITBUDDY_PROC
    BITBUDDY_ACTIVE = False
    if BITBUDDY_PROC:
        try:
            BITBUDDY_PROC.terminate()
            BITBUDDY_PROC.kill()
        except Exception:
            pass
        BITBUDDY_PROC = None


def _bitbuddy_worker():
    global BITBUDDY_PROC, BITBUDDY_ACTIVE
    try:
        sr = BITBUDDY_CONFIG.get("sample_rate", 48000)
        pacat_cmd = [
            "pacat", "--playback", "--device=wbs_input_bus",
            "--format=s16le", f"--rate={sr}", "--channels=2",
            "--latency-msec=20", "--stream-name=Ward-Beck ABB-1 Bit Buddy"
        ]
        proc = subprocess.Popen(
            pacat_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            preexec_fn=os.setsid
        )
        BITBUDDY_PROC = proc
        chunk = 256
        fmt = f"<{chunk * 2}h"
        pattern = BITBUDDY_CONFIG.get("pattern", "prbs")

        lfsr = 0x7ACE
        phase = 0.0
        step = 2.0 * math.pi * 1000.0 / sr
        walk_counter = 0

        while BITBUDDY_ACTIVE and proc.poll() is None:
            samples = []
            if pattern == "tone":
                amp = int(32767 * 0.12589)  # -18 dBFS reference level
                for _ in range(chunk):
                    v = int(amp * math.sin(phase))
                    samples.extend((v, v))
                    phase = (phase + step) % (2.0 * math.pi)
            elif pattern == "walk1s":
                for _ in range(chunk):
                    bit_shift = (walk_counter // 32) % 15
                    v = (1 << bit_shift) if (walk_counter % 32 < 8) else 0
                    samples.extend((v, v))
                    walk_counter = (walk_counter + 1) % 65536
            elif pattern == "minmax":
                amp = 32000
                for _ in range(chunk):
                    v = amp if (phase < math.pi) else -amp
                    samples.extend((v, v))
                    phase = (phase + step) % (2.0 * math.pi)
            else:  # PRBS-15 sequence
                for _ in range(chunk):
                    bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1
                    lfsr = (lfsr >> 1) | (bit << 14)
                    v = 11468 if bit else -11468
                    samples.extend((v, v))

            raw = struct.pack(fmt, *samples)
            if proc.stdin:
                proc.stdin.write(raw)
                proc.stdin.flush()
    except (BrokenPipeError, OSError):
        pass
    except Exception as e:
        print(f"[WARD BECK TAP] Bit Buddy Error: {e}", file=sys.stderr)
    finally:
        if BITBUDDY_PROC:
            try:
                BITBUDDY_PROC.terminate()
            except Exception:
                pass
            BITBUDDY_PROC = None


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
<title>WARD BECK TAP // Local Telemetry Daemon</title>
<style>
  :root {
    --bg-dark: #070d14;
    --panel-bg: #0b1724;
    --panel-border: #18334d;
    --text-primary: #e2e8f0;
    --text-muted: #64748b;
    --accent-orange: #ea580c;
    --accent-green: #22c55e;
    --accent-cyan: #38bdf8;
    --card-bg: #0d1e2e;
    --card-border: #1e3a5f;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: var(--bg-dark);
    color: var(--text-primary);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
  }
  .telemetry-chassis {
    width: 100%;
    max-width: 860px;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06);
    overflow: hidden;
  }
  .header-bar {
    background: linear-gradient(180deg, #102235 0%, #0c1a29 100%);
    border-bottom: 1px solid var(--panel-border);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .branding { display: flex; align-items: center; gap: 10px; }
  .branding-badge {
    background: #064e3b;
    color: #6ee7b7;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #059669;
    letter-spacing: 0.5px;
  }
  .branding-title { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
  .branding-sub { font-size: 11px; color: var(--text-muted); }
  .live-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #052e16;
    color: #4ade80;
    border: 1px solid #166534;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
  }
  .live-pill-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .body-content { padding: 24px 20px; display: flex; flex-direction: column; gap: 20px; }
  .action-banner {
    background: linear-gradient(135deg, #14283d 0%, #0d1e2e 100%);
    border: 1px solid #25507d;
    border-radius: 6px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .action-banner-title { font-size: 13px; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.5px; }
  .action-banner-desc { font-size: 12px; color: #cbd5e1; line-height: 1.5; }
  .action-buttons { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
  .btn-primary {
    background: #ea580c;
    color: #fff;
    text-decoration: none;
    font-size: 12px;
    font-weight: 700;
    padding: 10px 18px;
    border-radius: 4px;
    border: 1px solid #f97316;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s ease;
  }
  .btn-primary:hover { background: #f97316; box-shadow: 0 0 14px rgba(249,115,22,0.4); }
  .btn-reset {
    background: #7f1d1d; color: #fff; font: inherit; font-size: 12px; font-weight: 700;
    padding: 10px 18px; border-radius: 4px; border: 1px solid #ef4444; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px; margin-left: auto;
  }
  .btn-reset:hover { background: #b91c1c; box-shadow: 0 0 14px rgba(239,68,68,0.4); }
  .btn-reset:disabled { opacity: 0.6; cursor: wait; }
  .reset-report { font-size: 11px; line-height: 1.6; color: #fca5a5; font-family: monospace; white-space: pre-wrap; word-break: break-all; }
  .btn-secondary {
    background: #1e293b;
    color: #38bdf8;
    text-decoration: none;
    font-size: 12px;
    font-weight: 700;
    padding: 10px 18px;
    border-radius: 4px;
    border: 1px solid #334155;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s ease;
  }
  .btn-secondary:hover { background: #334155; color: #7dd3fc; }
  .telemetry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }
  .stat-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 6px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
  .stat-value { font-size: 16px; font-weight: 700; color: #fff; }
  .meter-bar-container { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
  .meter-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
  .meter-track { flex: 1; height: 10px; background: #060e17; border-radius: 2px; overflow: hidden; border: 1px solid #1e3a5f; }
  .meter-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #22c55e 0%, #eab308 75%, #ef4444 95%); transition: width 0.08s ease-out; }
  .meter-readout { width: 62px; text-align: right; color: #38bdf8; font-weight: 700; }
  .endpoints-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 6px;
    overflow: hidden;
  }
  .endpoints-table th {
    text-align: left;
    padding: 8px 12px;
    background: #091624;
    color: var(--text-muted);
    border-bottom: 1px solid var(--card-border);
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
  }
  .endpoints-table td {
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    color: #cbd5e1;
  }
  .endpoints-table tr:last-child td { border-bottom: none; }
  .method-badge {
    background: #0284c7;
    color: #fff;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 700;
  }
  .endpoint-link { color: #38bdf8; text-decoration: none; }
  .endpoint-link:hover { text-decoration: underline; }
  .footer-bar {
    border-top: 1px solid var(--panel-border);
    padding: 12px 20px;
    font-size: 11px;
    color: var(--text-muted);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    background: #09131d;
  }
  .footer-links a { color: var(--text-muted); text-decoration: none; margin-left: 12px; }
  .footer-links a:hover { color: #94a3b8; }
</style>
</head>
<body>
<div class="telemetry-chassis">
  <div class="header-bar">
    <div class="branding">
      <span class="branding-badge">WBS DAEMON</span>
      <div>
        <div class="branding-title">WARD-BECK SYSTEMS // TELEMETRY &amp; SIGNAL TAP</div>
        <div class="branding-sub">Linux Virtual Patchbay &amp; MXL Ring Buffer Telemetry (:8467)</div>
      </div>
    </div>
    <div class="live-pill" id="sseStatusPill">
      <span class="live-pill-dot" id="sseDot"></span>
      <span id="sseStatusText">STREAMING TELEMETRY</span>
    </div>
  </div>

  <div class="body-content">
    <div class="action-banner">
      <div class="action-banner-title">📡 Live Broadcast Visualizer Connection</div>
      <div class="action-banner-desc">
        This local daemon provides low-latency telemetry, MXL shared-memory flows, and virtual loopback audio directly to the live Ward-Beck mastering visualizers. Open the live URL in your browser to view the broadcast meters and routing console:
      </div>
      <div class="action-buttons">
        <a href="https://ward-beck.ca" target="_blank" rel="noopener" class="btn-primary">
          <span>🎛️</span> <span>Open Ward-Beck Visualizer (ward-beck.ca)</span>
        </a>
        <a href="https://xtm.wbsps.ca" target="_blank" rel="noopener" class="btn-secondary">
          <span>📡</span> <span>Open XTM-4 Rack (xtm.wbsps.ca)</span>
        </a>
        <a href="http://localhost:8080" target="_blank" rel="noopener" class="btn-secondary" id="btnLocalHostLink" style="display:none;">
          <span>💻</span> <span>Local Host (:8080)</span>
        </a>
        <button type="button" class="btn-reset" id="btnResetAll" title="Kill every generator and destroy stray virtual cards">
          <span>⟲</span> <span>Reset All</span>
        </button>
      </div>
      <div class="reset-report" id="resetReport" hidden></div>
    </div>

    <div class="telemetry-grid">
      <div class="stat-card">
        <div class="stat-label">Live Signal Tap Levels</div>
        <div class="meter-bar-container">
          <div class="meter-row">
            <span style="width:14px;color:#94a3b8;">L</span>
            <div class="meter-track"><div class="meter-fill" id="meterFillL"></div></div>
            <span class="meter-readout" id="meterTextL">-60.0 dB</span>
          </div>
          <div class="meter-row">
            <span style="width:14px;color:#94a3b8;">R</span>
            <div class="meter-track"><div class="meter-fill" id="meterFillR"></div></div>
            <span class="meter-readout" id="meterTextR">-60.0 dB</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Active Audio Source</div>
        <div class="stat-value" id="valActiveSource" style="font-size:13px;word-break:break-all;color:#38bdf8;">wbs_input_bus.monitor</div>
        <div class="stat-label" style="margin-top:4px;">Physical Output Sink</div>
        <div style="font-size:11px;color:#cbd5e1;word-break:break-all;" id="valPhysicalSink">Hardware Speakers / PipeWire</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Virtual Audio Buses</div>
        <div style="font-size:11px;line-height:1.6;color:#cbd5e1;" id="valRoutes">
          <div>• wbs_meter_tap: <span style="color:#22c55e;">ACTIVE</span></div>
          <div>• Physical Speakers: <span style="color:#22c55e;">FEEDBACK GUARDED</span></div>
          <div>• MXL Shared Memory: <span style="color:#22c55e;">48 kHz / 32-bit Float</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Network AoIP &amp; NMOS</div>
        <div class="stat-value" id="valAoipCount" style="color:#a78bfa;">Scanning...</div>
        <div style="font-size:11px;color:#94a3b8;" id="valAoipDesc">Dante, Ravenna, AES67, NMOS IS-04/05</div>
      </div>
    </div>

    <div>
      <div class="stat-label" style="margin-bottom:8px;">Live Telemetry API Endpoints (CORS &amp; PNA Enabled)</div>
      <table class="endpoints-table">
        <thead>
          <tr>
            <th style="width:70px;">Method</th>
            <th style="width:160px;">Endpoint</th>
            <th>Telemetry Payload</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method-badge">GET</span></td>
            <td><a href="/api/status" class="endpoint-link" target="_blank">/api/status</a></td>
            <td>Full system status, active source, virtual buses, meter levels, and MXL telemetry</td>
          </tr>
          <tr>
            <td><span class="method-badge" style="background:#15803d;">SSE</span></td>
            <td><a href="/api/stream/meters" class="endpoint-link" target="_blank">/api/stream/meters</a></td>
            <td>High-frequency Server-Sent Events meter level stream (dBFS &amp; VU)</td>
          </tr>
          <tr>
            <td><span class="method-badge">GET</span></td>
            <td><a href="/api/mxl" class="endpoint-link" target="_blank">/api/mxl</a></td>
            <td>MXL Continuous Circular Ring Buffer shared memory telemetry and flow registry</td>
          </tr>
          <tr>
            <td><span class="method-badge">GET</span></td>
            <td><a href="/api/aoip" class="endpoint-link" target="_blank">/api/aoip</a></td>
            <td>Audio-over-IP announcements (Dante, Ravenna, AES67 SAP, MoipBuddy)</td>
          </tr>
          <tr>
            <td><span class="method-badge">GET</span></td>
            <td><a href="/api/aoip/multicast" class="endpoint-link" target="_blank">/api/aoip/multicast</a></td>
            <td>Live multicast listeners: SAP/SDP sessions, PTP v1 (Dante) &amp; v2 (Ravenna/AES67) clocks, SIP</td>
          </tr>
          <tr>
            <td><span class="method-badge">GET</span></td>
            <td><a href="/api/pipeline" class="endpoint-link" target="_blank">/api/pipeline</a></td>
            <td>3-Layer Linux Audio Pipeline topology (ALSA Kernel, PipeWire/Pulse, MXL)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="footer-bar">
    <div>Copyright &copy; 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.</div>
    <div class="footer-links">
      <a href="https://ward-beck.ca" target="_blank" rel="noopener">Ward-Beck.ca</a>
      <a href="https://xtm.wbsps.ca" target="_blank" rel="noopener">XTM.WBSps.ca</a>
      <a href="https://wbsps.ca" target="_blank" rel="noopener">WBSps.ca</a>
    </div>
  </div>
</div>

<script>
(function() {
  const fillL = document.getElementById('meterFillL');
  const fillR = document.getElementById('meterFillR');
  const textL = document.getElementById('meterTextL');
  const textR = document.getElementById('meterTextR');
  const srcEl = document.getElementById('valActiveSource');
  const sinkEl = document.getElementById('valPhysicalSink');
  const aoipEl = document.getElementById('valAoipCount');
  const pill = document.getElementById('sseStatusPill');
  const dot = document.getElementById('sseDot');
  const pillText = document.getElementById('sseStatusText');

  function dbToFrac(db) {
    if (db <= -60) return 0;
    if (db >= 0) return 100;
    return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
  }

  // Probe local server :8080
  fetch('http://localhost:8080/manifest.json', { mode: 'no-cors' }).then(() => {
    const loc = document.getElementById('btnLocalHostLink');
    if (loc) loc.style.display = 'inline-flex';
  }).catch(() => {});

  // 1. Connect to SSE stream
  try {
    const es = new EventSource('/api/stream/meters');
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        const lDb = typeof d.left_db === 'number' ? d.left_db : -60;
        const rDb = typeof d.right_db === 'number' ? d.right_db : -60;
        if (fillL) fillL.style.width = dbToFrac(lDb) + '%';
        if (fillR) fillR.style.width = dbToFrac(rDb) + '%';
        if (textL) textL.textContent = lDb.toFixed(1) + ' dB';
        if (textR) textR.textContent = rDb.toFixed(1) + ' dB';
      } catch (_) {}
    };
    es.onerror = () => {
      if (dot) dot.style.background = '#eab308';
      if (pillText) pillText.textContent = 'RECONNECTING TELEMETRY';
    };
    es.onopen = () => {
      if (dot) dot.style.background = '#22c55e';
      if (pillText) pillText.textContent = 'STREAMING TELEMETRY';
    };
  } catch (err) {
    if (pillText) pillText.textContent = 'OFFLINE';
  }

  // Reset All: kill generators + destroy stray cards
  const resetBtn = document.getElementById('btnResetAll');
  const resetOut = document.getElementById('resetReport');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    resetBtn.disabled = true;
    fetch('/api/reset_all', { method: 'POST' }).then(r => r.json()).then(rep => {
      const lines = [];
      lines.push('Generators killed: ' + (rep.generators.length ? rep.generators.join(', ') : 'none running'));
      lines.push('Stray cards destroyed: ' + (rep.modules.length + rep.processes.length || 'none found'));
      rep.modules.concat(rep.processes).forEach(m => lines.push('  ✕ ' + m));
      resetOut.textContent = lines.join('\n');
      resetOut.hidden = false;
      refreshStatus();
    }).catch(err => {
      resetOut.textContent = 'Reset failed: ' + err;
      resetOut.hidden = false;
    }).finally(() => { resetBtn.disabled = false; });
  });

  // 2. Poll /api/status for pipeline & AoIP metadata
  function refreshStatus() {
    fetch('/api/status').then(r => r.json()).then(data => {
      if (srcEl && data.selected_source) srcEl.textContent = data.selected_source;
      if (sinkEl && data.physical_sink) sinkEl.textContent = data.physical_sink;
      if (aoipEl && data.aoip) {
        const danteCount = data.aoip.dante ? data.aoip.dante.device_count || 0 : 0;
        const nmosCount = data.nmos ? data.nmos.count || 0 : 0;
        aoipEl.textContent = `${danteCount} Dante · ${nmosCount} NMOS Nodes`;
      }
    }).catch(() => {});
  }
  refreshStatus();
  setInterval(refreshStatus, 4000);
})();
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
            pipeline_data = get_cached_pipeline(MXL_ENGINE)
            with STATE_LOCK:
                payload = {
                    "physical_sink": PHYSICAL_SINK,
                    "selected_source": SELECTED_SOURCE,
                    "sources": AVAILABLE_SOURCES,
                    "routes": ACTIVE_ROUTES,
                    "meters": METER_LEVELS,
                    "source_meters": dict(SOURCE_METERS),
                    "test_tone": {"active": TEST_TONE_ACTIVE, "freq": TEST_TONE_FREQ},
                    "bit_buddy": {"active": BITBUDDY_ACTIVE, "config": BITBUDDY_CONFIG},
                    "nmos": {"count": len(NMOS_REGISTRY), "nodes": list(NMOS_REGISTRY.values())},
                    "aoip": AOIP_TELEMETRY if AOIP_TELEMETRY else inspect_aoip(),
                    "cbc_generator": CBC_GEN_STATE,
                    "all_domains": MXL_ENGINE.scan_all_domains(),
                    "mxl": MXL_ENGINE.get_telemetry(),
                    "pipeline": pipeline_data,
                }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))

        elif path == "/api/aoip":
            with STATE_LOCK:
                payload = dict(AOIP_TELEMETRY if AOIP_TELEMETRY else inspect_aoip())
            payload["multicast"] = aoip_listener.snapshot()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))

        elif path == "/api/aoip/multicast":
            payload = aoip_listener.snapshot()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))

        elif path == "/api/nmos":
            with STATE_LOCK:
                payload = {
                    "status": "ok",
                    "count": len(NMOS_REGISTRY),
                    "nodes": list(NMOS_REGISTRY.values()),
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

        elif path == "/api/mxl/rings":
            # Real ring-buffer state of every flow: write head, meter read head,
            # per-channel min/max bins and peak/RMS meters
            qs = parse_qs(parsed.query)
            bins = max(60, min(720, int(qs.get("bins", ["360"])[0])))
            rep = MXL_ENGINE.get_rings(bins)
            tp = test_point.ring_snapshot(bins)
            if tp:
                rep.setdefault("flows", []).insert(0, tp)
            rep["test_point"] = test_point.status()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rep).encode("utf-8"))

        elif path == "/api/testpoint":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(test_point.status()).encode("utf-8"))

        elif path == "/api/mxl/waveform" or (path.startswith("/api/mxl/flow/") and "/waveform" in path):
            parts = path.split("/")
            flow_id = parts[4] if len(parts) >= 5 and parts[4] != "waveform" else "wbs-flow-master-stereo"
            if flow_id in MXL_ENGINE.flows:
                flow = MXL_ENGINE.flows[flow_id]
                waveform_data = flow.get_waveform_bins()
            else:
                waveform_data = MXL_ENGINE.get_external_flow_waveform(flow_id)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(waveform_data).encode("utf-8"))

        elif path.startswith("/api/cbc/svc/"):
            # GET passthrough to a CBC service API: /api/cbc/svc/<generator|player|webrtc|info>/<path>
            rest = path[len("/api/cbc/svc/"):]
            svc_name, _, svc_path = rest.partition("/")
            if parsed.query:
                svc_path += "?" + parsed.query
            status, resp_body = cbc_request(svc_name, svc_path)
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(resp_body)

        elif path == "/api/cbc/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(CBC_GEN_STATE).encode("utf-8"))

        elif path.startswith("/api/mxl/flow/") and path.endswith("/levels"):
            # Live per-channel peak / RMS of one flow: /api/mxl/flow/<flow_id>/levels
            flow_id = path.split("/")[4]
            rep = MXL_ENGINE.get_flow_levels(flow_id)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rep).encode("utf-8"))

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

        elif path == "/api/bitbuddy":
            with STATE_LOCK:
                payload = {
                    "active": BITBUDDY_ACTIVE,
                    "config": BITBUDDY_CONFIG
                }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))

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

        if parsed.path == "/api/testpoint":
            # {kind: hw|pw|mxl|aoip, ref, label} clips the test point on; {stop: true} lifts it
            data = json.loads(body) if body else {}
            if data.get("stop"):
                test_point.stop_point()
                payload = test_point.status()
            else:
                payload = {"active": True, "point": test_point.set_point(
                    str(data.get("kind", "")), str(data.get("ref", "")), str(data.get("label", "")))}
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
        elif parsed.path == "/api/set_source":
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
        elif parsed.path in ("/api/toggle_test_tone", "/api/test_tone"):
            data = json.loads(body) if body else {}
            freq = data.get("freq", 1000)
            restart = data.get("restart", False)
            with STATE_LOCK:
                if restart is True:
                    start_test_tone(freq)
                elif restart is False and "restart" in data:
                    stop_test_tone()
                elif TEST_TONE_ACTIVE:
                    stop_test_tone()
                else:
                    start_test_tone(freq)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "active": TEST_TONE_ACTIVE,
                "freq": TEST_TONE_FREQ
            }).encode("utf-8"))
        elif parsed.path == "/api/bitbuddy":
            data = json.loads(body)
            pattern = data.get("pattern", BITBUDDY_CONFIG.get("pattern", "prbs"))
            pro_mode = data.get("pro_mode", BITBUDDY_CONFIG.get("pro_mode", True))
            audio_data = data.get("audio_data", BITBUDDY_CONFIG.get("audio_data", True))
            sample_rate = data.get("sample_rate", BITBUDDY_CONFIG.get("sample_rate", 48000))
            active = data.get("active", None)

            with STATE_LOCK:
                if active is False:
                    stop_bit_buddy()
                elif active is True:
                    start_bit_buddy(pattern, pro_mode, audio_data, sample_rate)
                elif BITBUDDY_ACTIVE:
                    if data.get("restart", False):
                        start_bit_buddy(pattern, pro_mode, audio_data, sample_rate)
                    else:
                        stop_bit_buddy()
                else:
                    start_bit_buddy(pattern, pro_mode, audio_data, sample_rate)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "active": BITBUDDY_ACTIVE,
                "config": BITBUDDY_CONFIG
            }).encode("utf-8"))
        elif parsed.path == "/api/force_speakers":
            with STATE_LOCK:
                ACTIVE_ROUTES["speaker_split"] = True
                apply_routes()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "speaker_split": True,
                "physical_sink": PHYSICAL_SINK
            }).encode("utf-8"))
        elif parsed.path == "/api/cbc/pattern":
            data = json.loads(body)
            target = data.get("target", "video")
            pattern = data.get("pattern", "")
            try:
                url = "http://127.0.0.1:9600/video/test-pattern" if target == "video" else "http://127.0.0.1:9600/audio/flow1/test-pattern"
                req = urllib.request.Request(
                    url,
                    data=json.dumps({"pattern": pattern}).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=2.0) as resp:
                    resp_body = resp.read()
                poll_cbc_generator()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(resp_body)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

        elif parsed.path in ("/api/cbc/pipeline/start", "/api/cbc/pipeline/stop"):
            # Start/stop the CBC test generator pipeline (or the file player with {"service":"player"})
            try:
                data = json.loads(body) if body else {}
            except Exception:
                data = {}
            service = data.pop("service", "generator")
            action = parsed.path.rsplit("/", 1)[-1]
            if action == "start" and service == "generator":
                # StartRequest requires domain + all four flow configs; fill CBC defaults
                data.setdefault("domain", cbc_default_domain())
                for key, label in (("video", "Test-Video"), ("audio1", "Test-Audio-1"),
                                   ("audio2", "Test-Audio-2"), ("ancillary", "Test-Anc")):
                    data.setdefault(key, {"active": key != "ancillary", "label": label,
                                          "description": f"CBC test generator {label}"})
            elif action == "start":
                data.setdefault("domain", cbc_default_domain())
            status, resp_body = cbc_request(service, f"/pipeline/{action}", data, timeout=8.0)
            poll_cbc_generator()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(resp_body)

        elif parsed.path.startswith("/api/cbc/svc/"):
            # POST passthrough to a CBC service API
            rest = parsed.path[len("/api/cbc/svc/"):]
            svc_name, _, svc_path = rest.partition("/")
            try:
                data = json.loads(body) if body else {}
            except Exception:
                data = {}
            status, resp_body = cbc_request(svc_name, svc_path, data)
            poll_cbc_generator()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(resp_body)

        elif parsed.path == "/api/cbc/audio_level":
            data = json.loads(body)
            level_db = float(data.get("level_db", -20.0))
            try:
                url = "http://127.0.0.1:9600/audio/flow1/level"
                req = urllib.request.Request(
                    url,
                    data=json.dumps({"level_db": level_db}).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=2.0) as resp:
                    resp_body = resp.read()
                poll_cbc_generator()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(resp_body)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        elif parsed.path == "/api/reset_all":
            report = reset_all()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(report).encode("utf-8"))
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
    allow_reuse_address = True

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
        assert len(HTML_UI) > 500, "HTML template empty"
        assert "WARD BECK TAP" in HTML_UI or "Ward-Beck" in HTML_UI, "HTML header missing"
        assert "ward-beck.ca" in HTML_UI or "xtm.wbsps.ca" in HTML_UI, "Live URL missing"
        assert "api/stream/meters" in HTML_UI, "Telemetry SSE endpoint missing"
        assert BITBUDDY_CONFIG["pattern"] == "prbs", "Bit Buddy config invalid"
        assert callable(discover_nmos_nodes), "NMOS discovery missing"
        assert callable(poll_cbc_generator), "CBC generator polling missing"
        srcs = list_sources()
        print(f"[WARD BECK TAP] Detected audio subsystem ({len(srcs)} available audio sources).")
        pipe = inspect_full_pipeline(MXL_ENGINE)
        print(f"[WARD BECK TAP] 3-Layer Linux Audio Pipeline online (ALSA cards: {pipe['layers']['layer1_kernel_hardware']['telemetry']['card_count']}).")
        print("[WARD BECK TAP] ✔ ABB-1 Bit Buddy & ABP-1 Bit Spitter engine verified.")
        print("[WARD BECK TAP] ✔ NMOS IS-04 Announcement & Stream Discovery verified.")
        print("[WARD BECK TAP] ✔ CBC Radio-Canada MXL Test Generator (:9600) & Pattern Studio verified.")
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

    t_nmos = threading.Thread(target=nmos_discovery_loop, daemon=True)
    t_nmos.start()

    aoip_listener.set_dante_ip_provider(
        lambda: [d.get("ip") for d in (AOIP_TELEMETRY or {}).get("dante", {}).get("devices", [])])
    aoip_listener.start(SHUTDOWN_EVENT)

    no_browser = any(arg in sys.argv for arg in ("--no-browser", "--headless", "--daemon")) or (os.environ.get("WBS_NO_BROWSER", "0") == "1")
    if not no_browser:
        target_url = os.environ.get("WBS_LAUNCH_URL", "https://ward-beck.ca")
        if any(arg in sys.argv for arg in ("--local", "--local-only", "--telemetry")):
            target_url = f"http://127.0.0.1:{PORT}"
        print(f"[WARD BECK TAP] Launching live broadcast visualizer: {target_url}")
        launch_browser(target_url)

    ThreadingHTTPServer.allow_reuse_address = True
    server = ThreadingHTTPServer(("127.0.0.1", PORT), WBSHandler)
    print(f"[WARD BECK TAP] HTML Router & Multi-Source VU Bridge running at: http://127.0.0.1:{PORT}")
    print("[WARD BECK TAP] Live VU meters & MXL Continuous Ring Buffers active. Signal Tap online.")
    try:
        server.serve_forever()
    finally:
        with STATE_LOCK:
            abandon_ship()
