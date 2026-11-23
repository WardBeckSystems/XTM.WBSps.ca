# Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.
"""
AoIP multicast listeners (stdlib only).

Joins the real multicast groups used by Audio-over-IP networks and decodes
what arrives on the wire:

  - SAP / SDP (RFC 2974 / RFC 4566): 239.255.255.255:9875, 224.2.127.254:9875
    (AES67, RAVENNA, Dante in AES67 mode)
  - PTP: 224.0.1.129 UDP 319 (event) and 320 (general)
    PTPv2 / IEEE 1588-2008 (AES67, RAVENNA, Dante AES67 mode)
    PTPv1 / IEEE 1588-2002 (Dante native clocking)
  - SIP: 224.0.1.75:5060 (sip.mcast.net)

Nothing here is simulated: if a socket cannot bind or join, the listener
reports listening=false with the error text and an empty list.

PTP is passive by default: rather than binding 319/320 (privileged ports
that the apk-ptp / clock containers already own), it subscribes read-only
to the retained MQTT topic those containers publish
(APK.audio/System/Gui/Discovered/ptp). Nothing is bound, joined or sent
on the PTP network. Set AOIP_PTP_MODE=sockets to listen on the wire instead.

Environment:
  AOIP_IFACE      optional IPv4 address of the interface to join on
                  (default: join on every interface, reported as 0.0.0.0).
  AOIP_PTP_MODE   "mqtt" (default, passive) or "sockets" (bind 319/320).
  MQTT_HOST/PORT  broker for the passive PTP source (127.0.0.1:1883).
  AOIP_PTP_TOPIC  topic to read (APK.audio/System/Gui/Discovered/ptp).
"""

import os
import socket
import struct
import sys
import threading
import time
import zlib

SAP_GROUPS = [("239.255.255.255", 9875), ("224.2.127.254", 9875)]
PTP_GROUP = "224.0.1.129"
PTP_PORTS = (319, 320)
SIP_GROUP = ("224.0.1.75", 5060)

SAP_EXPIRY_S = 300.0
PTP_EXPIRY_S = 30.0
SIP_MAX_ENTRIES = 50

_LOCK = threading.Lock()
_THREADS = []
_STOP = None
_DANTE_IP_PROVIDER = None


def _iface():
    return os.environ.get("AOIP_IFACE", "").strip() or "0.0.0.0"


def _fmt_id(raw: bytes) -> str:
    return "-".join(f"{b:02X}" for b in raw)


def _new_state(groups):
    return {"listening": False, "error": None, "groups": groups, "packets": 0,
            "joined_interfaces": [], "join_errors": []}


_SAP = _new_state([f"{g}:{p}" for g, p in SAP_GROUPS])
_SAP_SESSIONS = {}
_PTP = _new_state([f"{PTP_GROUP}:{p}" for p in PTP_PORTS])
_PTP_ERRORS = {}
_PTP_BOUND = set()
_PTP_CLOCKS = {}
_SIP = _new_state([f"{SIP_GROUP[0]}:{SIP_GROUP[1]}"])
_SIP_MESSAGES = {}


def set_dante_ip_provider(fn):
    """fn() -> iterable of Dante device IPs (used to tag PTPv2 clocks as Dante AES67 mode)."""
    global _DANTE_IP_PROVIDER
    _DANTE_IP_PROVIDER = fn


# ---------------------------------------------------------------------------
# SAP / SDP
# ---------------------------------------------------------------------------

def parse_sdp(text: str) -> dict:
    out = {"session_name": None, "origin": None, "origin_address": None,
           "multicast_ip": None, "ttl": None, "port": None, "encoding": None,
           "sample_rate": None, "channels": None, "ptime": None,
           "ptp_version": None, "ptp_grandmaster": None, "ptp_domain": None,
           "mediaclk": None}
    for raw in text.replace("\r\n", "\n").split("\n"):
        line = raw.strip()
        if len(line) < 2 or line[1] != "=":
            continue
        k, v = line[0], line[2:].strip()
        if k == "s":
            out["session_name"] = v
        elif k == "o":
            out["origin"] = v
            parts = v.split()
            if len(parts) >= 6:
                out["origin_address"] = parts[5]
        elif k == "c":
            parts = v.split()
            if len(parts) >= 3 and out["multicast_ip"] is None:
                addr = parts[2].split("/")
                out["multicast_ip"] = addr[0]
                if len(addr) > 1 and addr[1].isdigit():
                    out["ttl"] = int(addr[1])
        elif k == "m":
            parts = v.split()
            if len(parts) >= 2 and parts[0] == "audio" and out["port"] is None:
                try:
                    out["port"] = int(parts[1].split("/")[0])
                except ValueError:
                    pass
        elif k == "a":
            if v.startswith("rtpmap:") and out["encoding"] is None:
                spec = v[7:].split(None, 1)
                if len(spec) == 2:
                    enc = spec[1].split("/")
                    out["encoding"] = enc[0]
                    if len(enc) > 1 and enc[1].isdigit():
                        out["sample_rate"] = int(enc[1])
                    out["channels"] = int(enc[2]) if len(enc) > 2 and enc[2].isdigit() else 1
            elif v.startswith("ptime:"):
                try:
                    out["ptime"] = float(v[6:])
                except ValueError:
                    pass
            elif v.startswith("mediaclk:"):
                out["mediaclk"] = v[9:]
            elif v.startswith("ts-refclk:ptp="):
                # ptp=IEEE1588-2008:00-1D-C1-FF-FE-12-34-56:0  (or ...:traceable)
                fields = v[len("ts-refclk:ptp="):].split(":")
                out["ptp_version"] = fields[0]
                if len(fields) > 1 and fields[1] != "traceable":
                    out["ptp_grandmaster"] = fields[1].upper()
                elif len(fields) > 1:
                    out["ptp_grandmaster"] = "traceable"
                if len(fields) > 2:
                    try:
                        out["ptp_domain"] = int(fields[2])
                    except ValueError:
                        pass
    return out


def parse_sap(data: bytes) -> dict:
    """Decode a SAP packet (RFC 2974). Raises ValueError on malformed input."""
    if len(data) < 8:
        raise ValueError("SAP packet too short")
    b0 = data[0]
    version = b0 >> 5
    ipv6 = bool(b0 & 0x10)
    deletion = bool(b0 & 0x04)
    encrypted = bool(b0 & 0x02)
    compressed = bool(b0 & 0x01)
    auth_len = data[1] * 4
    msg_id_hash = struct.unpack("!H", data[2:4])[0]
    alen = 16 if ipv6 else 4
    pos = 4
    if len(data) < pos + alen:
        raise ValueError("SAP origin truncated")
    origin_ip = socket.inet_ntop(socket.AF_INET6 if ipv6 else socket.AF_INET, data[pos:pos + alen])
    pos += alen + auth_len
    payload = data[pos:]
    if compressed:
        payload = zlib.decompress(payload)
    payload_type = "application/sdp"
    if not payload.startswith(b"v=0"):
        nul = payload.find(b"\x00")
        if nul >= 0:
            payload_type = payload[:nul].decode("ascii", "replace")
            payload = payload[nul + 1:]
    res = {"version": version, "deletion": deletion, "encrypted": encrypted,
           "compressed": compressed, "msg_id_hash": msg_id_hash,
           "origin_ip": origin_ip, "payload_type": payload_type, "sdp": None}
    if not encrypted and payload_type == "application/sdp":
        res["sdp"] = parse_sdp(payload.decode("utf-8", "replace"))
    return res


def _handle_sap(data, addr, now):
    try:
        pkt = parse_sap(data)
    except Exception:
        return
    key = (pkt["origin_ip"], pkt["msg_id_hash"])
    with _LOCK:
        if pkt["deletion"]:
            _SAP_SESSIONS.pop(key, None)
            # A deletion may carry a different hash; also match the o= line.
            origin = (pkt["sdp"] or {}).get("origin")
            if origin:
                for k in [k for k, s in _SAP_SESSIONS.items() if s.get("origin") == origin]:
                    _SAP_SESSIONS.pop(k, None)
            return
        if pkt["sdp"] is None:
            return
        s = dict(pkt["sdp"])
        s.update({"id": f"{pkt['origin_ip']}#{pkt['msg_id_hash']:04x}",
                  "origin_ip": pkt["origin_ip"], "source_ip": addr[0],
                  "last_seen": now})
        prev = _SAP_SESSIONS.get(key)
        s["announce_count"] = (prev["announce_count"] + 1) if prev else 1
        _SAP_SESSIONS[key] = s


# ---------------------------------------------------------------------------
# PTP
# ---------------------------------------------------------------------------

PTP2_TYPES = {0x0: "Sync", 0x1: "Delay_Req", 0x2: "Pdelay_Req", 0x3: "Pdelay_Resp",
              0x8: "Follow_Up", 0x9: "Delay_Resp", 0xA: "Pdelay_Resp_Follow_Up",
              0xB: "Announce", 0xC: "Signaling", 0xD: "Management"}
PTP1_CONTROL = {0: "Sync", 1: "Delay_Req", 2: "Follow_Up", 3: "Delay_Resp", 4: "Management"}
TIME_SOURCES = {0x10: "ATOMIC_CLOCK", 0x20: "GPS", 0x30: "TERRESTRIAL_RADIO", 0x40: "PTP",
                0x50: "NTP", 0x60: "HAND_SET", 0x90: "OTHER", 0xA0: "INTERNAL_OSCILLATOR"}


def parse_ptp(data: bytes) -> dict:
    """Decode a PTPv1 or PTPv2 message. Raises ValueError if neither."""
    if len(data) >= 40 and struct.unpack("!H", data[0:2])[0] == 1:
        return _parse_ptp1(data)
    if len(data) >= 34 and (data[1] & 0x0F) == 2:
        return _parse_ptp2(data)
    raise ValueError("not a PTPv1/v2 message")


def _parse_ptp2(data):
    mtype = data[0] & 0x0F
    msg = {"version": 2, "message_type": mtype,
           "message_name": PTP2_TYPES.get(mtype, f"0x{mtype:X}"),
           "domain": data[4],
           "clock_identity": _fmt_id(data[20:28]),
           "port_number": struct.unpack("!H", data[28:30])[0],
           "sequence_id": struct.unpack("!H", data[30:32])[0],
           "log_message_interval": struct.unpack("!b", data[33:34])[0]}
    if mtype == 0xB and len(data) >= 64:
        msg["announce"] = {
            "current_utc_offset": struct.unpack("!h", data[44:46])[0],
            "priority1": data[47],
            "clock_class": data[48],
            "clock_accuracy": f"0x{data[49]:02X}",
            "offset_scaled_log_variance": f"0x{struct.unpack('!H', data[50:52])[0]:04X}",
            "priority2": data[52],
            "grandmaster_identity": _fmt_id(data[53:61]),
            "steps_removed": struct.unpack("!H", data[61:63])[0],
            "time_source": TIME_SOURCES.get(data[63], f"0x{data[63]:02X}"),
        }
    return msg


def _parse_ptp1(data):
    control = data[32]
    msg = {"version": 1,
           "version_network": struct.unpack("!H", data[2:4])[0],
           "subdomain": data[4:20].split(b"\x00", 1)[0].decode("ascii", "replace"),
           "message_type": data[20],
           "control": control,
           "message_name": PTP1_CONTROL.get(control, f"0x{control:X}"),
           "clock_identity": _fmt_id(data[22:28]),
           "port_number": struct.unpack("!H", data[28:30])[0],
           "sequence_id": struct.unpack("!H", data[30:32])[0]}
    # Sync / Delay_Req bodies carry the grandmaster dataset (124-byte message)
    if control in (0, 1) and len(data) >= 124:
        msg["sync"] = {
            "grandmaster_identity": _fmt_id(data[54:60]),
            "grandmaster_port": struct.unpack("!H", data[60:62])[0],
            "grandmaster_stratum": data[67],
            "grandmaster_identifier": data[68:72].split(b"\x00", 1)[0].decode("ascii", "replace"),
            "grandmaster_variance": struct.unpack("!h", data[74:76])[0],
            "grandmaster_preferred": bool(data[77]),
            "grandmaster_is_boundary_clock": bool(data[79]),
            "sync_interval": struct.unpack("!b", data[83:84])[0],
            "local_clock_variance": struct.unpack("!h", data[86:88])[0],
            "steps_removed": struct.unpack("!H", data[90:92])[0],
            "local_clock_stratum": data[95],
            "local_clock_identifier": data[96:100].split(b"\x00", 1)[0].decode("ascii", "replace"),
            "parent_uuid": _fmt_id(data[102:108]),
        }
    return msg


def _handle_ptp(data, addr, now):
    try:
        m = parse_ptp(data)
    except Exception:
        return
    domain = m["domain"] if m["version"] == 2 else m["subdomain"]
    key = (m["version"], domain, m["clock_identity"])
    with _LOCK:
        c = _PTP_CLOCKS.get(key)
        if c is None:
            c = {"clock_identity": m["clock_identity"], "version": m["version"], "domain": domain,
                 "source_ip": addr[0], "network": "dante" if m["version"] == 1 else "ravenna/aes67",
                 "grandmaster_identity": None, "is_grandmaster": False,
                 "priority1": None, "priority2": None, "clock_class": None,
                 "clock_accuracy": None, "offset_scaled_log_variance": None,
                 "steps_removed": None, "time_source": None,
                 "sync_count": 0, "follow_up_count": 0, "delay_req_count": 0,
                 "announce_count": 0, "other_count": 0, "last_message": None, "last_seen": now}
            _PTP_CLOCKS[key] = c
        c["source_ip"] = addr[0]
        c["last_seen"] = now
        c["last_message"] = m["message_name"]
        name = m["message_name"]
        if name == "Sync":
            c["sync_count"] += 1
        elif name == "Follow_Up":
            c["follow_up_count"] += 1
        elif name == "Delay_Req":
            c["delay_req_count"] += 1
        elif name == "Announce":
            c["announce_count"] += 1
        else:
            c["other_count"] += 1
        a = m.get("announce")
        if a:
            for f in ("priority1", "priority2", "clock_class", "clock_accuracy",
                      "offset_scaled_log_variance", "steps_removed", "time_source",
                      "grandmaster_identity"):
                c[f] = a[f]
            c["is_grandmaster"] = a["grandmaster_identity"] == m["clock_identity"]
        s = m.get("sync")
        if s and name == "Sync":
            c["grandmaster_identity"] = s["grandmaster_identity"]
            c["steps_removed"] = s["steps_removed"]
            c["clock_class"] = s["grandmaster_stratum"]
            c["clock_identifier"] = s["grandmaster_identifier"]
            c["grandmaster_preferred"] = s["grandmaster_preferred"]
            c["is_grandmaster"] = s["grandmaster_identity"] == m["clock_identity"]


# ---------------------------------------------------------------------------
# PTP, passive: read-only MQTT subscription to the apk-ptp discovery topic
# ---------------------------------------------------------------------------

PTP_MODE = os.environ.get("AOIP_PTP_MODE", "mqtt").strip().lower()
MQTT_HOST = os.environ.get("MQTT_HOST", "127.0.0.1")
MQTT_PORT = int(os.environ.get("MQTT_PORT", "1883"))
PTP_TOPIC = os.environ.get("AOIP_PTP_TOPIC", "APK.audio/System/Gui/Discovered/ptp")

_PTP_MQTT = {"connected": False, "error": None, "messages": 0, "updated": None}
_PTP_MQTT_ROWS = []


def _mqtt_str(s: str) -> bytes:
    b = s.encode("utf-8")
    return struct.pack("!H", len(b)) + b


def _mqtt_packet(ptype: int, body: bytes) -> bytes:
    n, rl = len(body), bytearray()
    while True:
        d, n = n % 128, n // 128
        rl.append(d | (0x80 if n else 0))
        if not n:
            break
    return bytes([ptype]) + bytes(rl) + body


def _mqtt_read(sock):
    """Read one MQTT packet -> (type byte, body). Raises on EOF."""
    def need(k):
        buf = b""
        while len(buf) < k:
            chunk = sock.recv(k - len(buf))
            if not chunk:
                raise ConnectionError("broker closed the connection")
            buf += chunk
        return buf
    head = need(1)[0]
    mult, length = 1, 0
    while True:
        d = need(1)[0]
        length += (d & 0x7F) * mult
        if not d & 0x80:
            break
        mult *= 128
    return head, need(length) if length else b""


def parse_ptp_discovery(rows) -> list:
    """Map apk-ptp discovery rows onto the clocks contract."""
    def num(v):
        try:
            return int(str(v))
        except (TypeError, ValueError):
            return None
    out = []
    for r in rows if isinstance(rows, list) else []:
        variant = str(r.get("variant", ""))
        vendor = str(r.get("vendor") or r.get("manufacturer") or "")
        v1 = "v1" in variant.lower()
        domain = r.get("subdomain") if v1 and r.get("subdomain") not in (None, "-") else num(r.get("domain"))
        vl = vendor.lower()
        if variant.lower() == "gptp":
            network = "avb (gPTP)"
        elif v1 or any(k in vl for k in ("presonus", "audinate", "focusrite", "yamaha")):
            network = "dante"
        elif any(k in vl for k in ("bridgeco", "archwave", "merging", "lawo", "alc networx", "digigram")):
            network = "ravenna/aes67"
        else:
            network = "aes67"
        msgs = {k: int(n) for k, n in
                ((m.split("\u00d7")[0].strip(), m.split("\u00d7")[1].strip())
                 for m in str(r.get("messages", "")).split(",") if "\u00d7" in m)
                if n.isdigit()}
        gm = r.get("grandmaster")
        gm = gm.replace(":", "-") if gm and gm != "-" else None
        cid = str(r.get("clock_id", "")).replace(":", "-")
        out.append({
            "clock_identity": cid, "version": 1 if v1 else 2, "variant": variant, "domain": domain,
            "source_ip": r.get("ip") or None, "network": network, "vendor": vendor or None,
            "grandmaster_identity": gm, "is_grandmaster": r.get("role") == "grandmaster",
            "priority1": num(r.get("priority1")), "priority2": num(r.get("priority2")),
            "clock_class": num(r.get("gm_class")), "clock_accuracy": None if r.get("gm_accuracy") in (None, "-") else r.get("gm_accuracy"),
            "steps_removed": num(r.get("steps_removed")), "time_source": None if r.get("time_source") in (None, "-") else r.get("time_source"),
            "sync_health": r.get("sync_health"), "online": r.get("_row_state") == "online" or r.get("_presence") == "online",
            "sync_count": msgs.get("Sync", 0), "follow_up_count": msgs.get("Follow_Up", 0),
            "delay_req_count": msgs.get("Delay_Req", 0) + msgs.get("Pdelay_Req", 0),
            "announce_count": msgs.get("Announce", 0), "last_seen_text": r.get("last_seen"),
        })
    return out


def _run_ptp_mqtt(stop):
    """Subscribe (QoS 0, read-only) and keep the latest retained discovery list."""
    import json as _json
    backoff = 1.0
    while not stop.is_set():
        sock = None
        try:
            sock = socket.create_connection((MQTT_HOST, MQTT_PORT), timeout=5)
            cid = f"wbs-aoip-ptp-{os.getpid()}"
            body = _mqtt_str("MQTT") + bytes([4, 0x02]) + struct.pack("!H", 60) + _mqtt_str(cid)
            sock.sendall(_mqtt_packet(0x10, body))                      # CONNECT, clean session
            head, ack = _mqtt_read(sock)
            if head >> 4 != 2 or len(ack) < 2 or ack[1] != 0:
                raise ConnectionError(f"CONNACK refused ({ack[1] if len(ack) > 1 else '?'})")
            sock.sendall(_mqtt_packet(0x82, struct.pack("!H", 1) + _mqtt_str(PTP_TOPIC) + b"\x00"))
            with _LOCK:
                _PTP_MQTT.update(connected=True, error=None)
            backoff, last_ping = 1.0, time.time()
            sock.settimeout(1.0)
            while not stop.is_set():
                if time.time() - last_ping > 30:
                    sock.sendall(b"\xc0\x00")                              # PINGREQ
                    last_ping = time.time()
                try:
                    head, body = _mqtt_read(sock)
                except socket.timeout:
                    continue
                if head >> 4 != 3:                                       # only PUBLISH matters
                    continue
                tlen = struct.unpack("!H", body[:2])[0]
                off = 2 + tlen + (2 if (head >> 1) & 3 else 0)
                try:
                    rows = parse_ptp_discovery(_json.loads(body[off:].decode("utf-8")))
                except Exception:
                    continue
                with _LOCK:
                    _PTP_MQTT_ROWS[:] = rows
                    _PTP_MQTT["messages"] += 1
                    _PTP_MQTT["updated"] = time.time()
        except Exception as exc:
            with _LOCK:
                _PTP_MQTT.update(connected=False,
                                 error=f"MQTT {MQTT_HOST}:{MQTT_PORT} {PTP_TOPIC}: {exc}")
        finally:
            if sock is not None:
                try:
                    sock.close()
                except Exception:
                    pass
        stop.wait(backoff)
        backoff = min(backoff * 2, 30.0)


def _ptp_mqtt_snapshot(now):
    online = [c for c in _PTP_MQTT_ROWS if c["online"]]
    gms = [{"version": c["version"], "domain": c["domain"], "network": c["network"],
            "identity": c["clock_identity"], "source_ip": c["source_ip"],
            "priority1": c["priority1"], "sync_health": c["sync_health"]}
           for c in online
           # PTPv1 (Dante) masters don't announce a GM role; the clock sending Sync is the master.
           if c["is_grandmaster"] or (c["version"] == 1 and c["sync_count"] > 0)]
    gms.sort(key=lambda g: (g["version"], str(g["domain"]), g["priority1"] if g["priority1"] is not None else 999))
    upd = _PTP_MQTT["updated"]
    return {
        "listening": _PTP_MQTT["connected"], "error": _PTP_MQTT["error"],
        "mode": "passive", "source": f"mqtt://{MQTT_HOST}:{MQTT_PORT}",
        "groups": [PTP_TOPIC], "packets": _PTP_MQTT["messages"],
        "joined_interfaces": [], "join_errors": [], "bound_ports": [],
        "updated_age_s": round(now - upd, 1) if upd else None,
        "clocks": [dict(c, age_s=None, last_seen=upd) for c in _PTP_MQTT_ROWS],
        "grandmasters": gms,
    }


# ---------------------------------------------------------------------------
# SIP
# ---------------------------------------------------------------------------

_SIP_COMPACT = {"f": "from", "t": "to", "i": "call-id", "m": "contact"}


def parse_sip(data: bytes) -> dict:
    text = data.decode("utf-8", "replace")
    head = text.split("\r\n\r\n", 1)[0].split("\n\n", 1)[0]
    lines = [l.rstrip("\r") for l in head.split("\n")]
    if not lines or "SIP/2.0" not in lines[0]:
        raise ValueError("not a SIP message")
    first = lines[0].strip()
    parts = first.split(" ", 2)
    if parts[0].upper().startswith("SIP/"):
        method = f"{parts[1]} {parts[2]}" if len(parts) > 2 else parts[1] if len(parts) > 1 else first
        is_request = False
    else:
        method = parts[0].upper()
        is_request = True
    hdrs = {}
    for l in lines[1:]:
        if ":" not in l:
            continue
        k, v = l.split(":", 1)
        k = k.strip().lower()
        k = _SIP_COMPACT.get(k, k)
        hdrs.setdefault(k, v.strip())
    return {"method": method, "is_request": is_request, "start_line": first,
            "from": hdrs.get("from"), "to": hdrs.get("to"), "call_id": hdrs.get("call-id"),
            "contact": hdrs.get("contact"), "user_agent": hdrs.get("user-agent") or hdrs.get("server"),
            "cseq": hdrs.get("cseq")}


def _handle_sip(data, addr, now):
    try:
        m = parse_sip(data)
    except Exception:
        return
    key = (m["method"], m["from"])
    with _LOCK:
        e = _SIP_MESSAGES.get(key)
        if e is None:
            e = {"method": m["method"], "from": m["from"], "count": 0}
            _SIP_MESSAGES[key] = e
        e.update({"to": m["to"], "call_id": m["call_id"], "contact": m["contact"],
                  "user_agent": m["user_agent"], "start_line": m["start_line"],
                  "source_ip": addr[0], "last_seen": now})
        e["count"] += 1
        if len(_SIP_MESSAGES) > SIP_MAX_ENTRIES:
            for k, _ in sorted(_SIP_MESSAGES.items(), key=lambda kv: kv[1]["last_seen"])[:len(_SIP_MESSAGES) - SIP_MAX_ENTRIES]:
                _SIP_MESSAGES.pop(k, None)


# ---------------------------------------------------------------------------
# Sockets & threads
# ---------------------------------------------------------------------------

def _describe_error(exc, port):
    if isinstance(exc, PermissionError) or getattr(exc, "errno", None) in (1, 13):
        return (f"bind UDP {port}: {exc}; needs CAP_NET_BIND_SERVICE "
                f"(sudo setcap cap_net_bind_service=+ep {os.path.realpath(sys.executable)}) or run as root")
    return f"UDP {port}: {exc.__class__.__name__}: {exc}"


def _open_socket(groups, port):
    """Bind UDP `port` and join each multicast group. Returns (sock, joined_ifaces)."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    try:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        if hasattr(socket, "SO_REUSEPORT"):
            try:
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
            except OSError:
                pass
        sock.bind(("", port))
        iface = _iface()
        joined, errors = [], []
        if iface != "0.0.0.0":
            for g in groups:
                mreq = socket.inet_aton(g) + socket.inet_aton(iface)
                sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
            joined.append(iface)
        else:
            ifaces = []
            try:
                ifaces = socket.if_nameindex()
            except (OSError, AttributeError):
                pass
            for idx, name in ifaces:
                ok = False
                for g in groups:
                    # struct ip_mreqn {multiaddr, address, ifindex} (Linux)
                    mreqn = socket.inet_aton(g) + socket.inet_aton("0.0.0.0") + struct.pack("@i", idx)
                    try:
                        sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreqn)
                        ok = True
                    except OSError as e:
                        errors.append(f"{name}: {e}")
                if ok:
                    joined.append(name)
            if not joined:
                for g in groups:
                    mreq = socket.inet_aton(g) + socket.inet_aton("0.0.0.0")
                    sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
                joined.append("INADDR_ANY")
        sock.settimeout(1.0)
        return sock, joined, errors
    except Exception:
        sock.close()
        raise


def _rx_loop(sock, handler, state, stop):
    while not stop.is_set():
        try:
            data, addr = sock.recvfrom(65535)
        except socket.timeout:
            continue
        except OSError:
            if stop.is_set():
                break
            time.sleep(0.5)
            continue
        with _LOCK:
            state["packets"] += 1
        try:
            handler(data, addr, time.time())
        except Exception:
            pass
    try:
        sock.close()
    except OSError:
        pass


def _run_listener(groups, port, handler, state, stop, ptp_port=None):
    try:
        sock, joined, join_errors = _open_socket(groups, port)
    except Exception as exc:
        with _LOCK:
            if ptp_port is not None:
                _PTP_ERRORS[ptp_port] = _describe_error(exc, port)
                state["error"] = "; ".join(_PTP_ERRORS[p] for p in sorted(_PTP_ERRORS))
            else:
                state["listening"] = False
                state["error"] = _describe_error(exc, port)
        return
    with _LOCK:
        state["listening"] = True
        for j in joined:
            if j not in state["joined_interfaces"]:
                state["joined_interfaces"].append(j)
        state["join_errors"].extend(join_errors[:20])
        if ptp_port is not None:
            _PTP_BOUND.add(ptp_port)
    _rx_loop(sock, handler, state, stop)


def start(stop_event=None):
    """Start SAP + SIP listeners and the PTP source (passive MQTT by default) (idempotent)."""
    global _STOP
    with _LOCK:
        if _THREADS:
            return
        _STOP = stop_event or threading.Event()
        specs = [
            ("aoip-sap", ([g for g, _ in SAP_GROUPS], 9875, _handle_sap, _SAP, _STOP, None)),
            ("aoip-sip", ([SIP_GROUP[0]], SIP_GROUP[1], _handle_sip, _SIP, _STOP, None)),
        ]
        if PTP_MODE == "sockets":
            specs += [
                ("aoip-ptp-319", ([PTP_GROUP], 319, _handle_ptp, _PTP, _STOP, 319)),
                ("aoip-ptp-320", ([PTP_GROUP], 320, _handle_ptp, _PTP, _STOP, 320)),
            ]
        for name, args in specs:
            t = threading.Thread(target=_run_listener, args=args, name=name, daemon=True)
            _THREADS.append(t)
            t.start()
        if PTP_MODE != "sockets":
            t = threading.Thread(target=_run_ptp_mqtt, args=(_STOP,), name="aoip-ptp-mqtt", daemon=True)
            _THREADS.append(t)
            t.start()


def stop():
    if _STOP is not None:
        _STOP.set()


# ---------------------------------------------------------------------------
# Snapshot
# ---------------------------------------------------------------------------

def _prune(now):
    for k in [k for k, s in _SAP_SESSIONS.items() if now - s["last_seen"] > SAP_EXPIRY_S]:
        _SAP_SESSIONS.pop(k, None)
    for k in [k for k, c in _PTP_CLOCKS.items() if now - c["last_seen"] > PTP_EXPIRY_S]:
        _PTP_CLOCKS.pop(k, None)


def _dante_ips():
    if _DANTE_IP_PROVIDER is None:
        return set()
    try:
        return {ip for ip in _DANTE_IP_PROVIDER() if ip}
    except Exception:
        return set()


def _pub(state):
    return {"listening": state["listening"], "error": state["error"],
            "groups": list(state["groups"]), "packets": state["packets"],
            "joined_interfaces": list(state["joined_interfaces"]),
            "join_errors": list(state["join_errors"])}


def snapshot() -> dict:
    """Thread-safe JSON-ready view of everything heard on the multicast groups."""
    now = time.time()
    dante = _dante_ips()
    with _LOCK:
        _prune(now)
        sap = _pub(_SAP)
        sap["sessions"] = sorted(
            ({**s, "age_s": round(now - s["last_seen"], 1)} for s in _SAP_SESSIONS.values()),
            key=lambda s: s["age_s"])

        ptp = _pub(_PTP)
        ptp["listening"] = bool(_PTP_BOUND)
        ptp["bound_ports"] = sorted(_PTP_BOUND)
        clocks = []
        for c in _PTP_CLOCKS.values():
            d = dict(c)
            if d["version"] == 2 and d["source_ip"] in dante:
                d["network"] = "dante (aes67 mode)"
            d["age_s"] = round(now - d["last_seen"], 1)
            clocks.append(d)
        clocks.sort(key=lambda c: (c["version"], str(c["domain"]), c["clock_identity"]))
        ptp["clocks"] = clocks

        by_id = {(c["version"], c["domain"], c["clock_identity"]): c for c in clocks}
        gms = {}
        for c in sorted(clocks, key=lambda c: c["last_seen"]):
            gid = c["grandmaster_identity"]
            if not gid:
                continue
            gkey = (c["version"], c["domain"])
            gm_clock = by_id.get((c["version"], c["domain"], gid))
            src = gm_clock or c
            gms[gkey] = {"version": c["version"], "domain": c["domain"], "network": src["network"],
                         "identity": gid, "source_ip": src["source_ip"] if gm_clock or c["is_grandmaster"] else None,
                         "announced_by": c["source_ip"]}
        ptp["grandmasters"] = [gms[k] for k in sorted(gms, key=lambda k: (k[0], str(k[1])))]
        ptp["mode"] = "sockets"
        if PTP_MODE != "sockets":
            ptp = _ptp_mqtt_snapshot(now)

        sip = _pub(_SIP)
        sip["messages"] = sorted(
            ({**e, "age_s": round(now - e["last_seen"], 1)} for e in _SIP_MESSAGES.values()),
            key=lambda e: e["age_s"])
    return {"iface": _iface(), "sap": sap, "ptp": ptp, "sip": sip}


if __name__ == "__main__":
    import json
    secs = float(sys.argv[1]) if len(sys.argv) > 1 else 10.0
    start()
    time.sleep(secs)
    print(json.dumps(snapshot(), indent=2))
    stop()
