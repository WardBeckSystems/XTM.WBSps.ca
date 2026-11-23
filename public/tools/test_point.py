# Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.
"""
Test point: meter any point of the layered audio pipeline.

One test point is active at a time, like the probe on a test-point jack. Whatever it
is clipped onto is brought into its own ring buffer sized to 10 x that point's packet
time (AES67 / RAVENNA / Dante-AES67 streams: a fixed 10 s ring), and metered per channel (peak / RMS) from the ring:

  hw       ALSA card            -> its PipeWire source (or sink monitor), parec
                                   packet = PipeWire graph quantum
  pw       PipeWire node/port   -> source, sink monitor, playback stream (monitor-stream)
                                   or, for a capture stream, the node feeding it
                                   packet = PipeWire graph quantum
  mxl      MXL flow             -> read behind the flow's write head (shared memory)
                                   packet = flow quantum (grain)
  aoip     AES67 / RAVENNA RTP  -> joins the SDP multicast group, decodes L24 / L16
                                   packet = measured RTP payload (ptime x rate)

Nothing is synthesized: a point that cannot be reached reports why.
"""

import json
import math
import socket
import struct
import subprocess
import sys
import threading
import time
from array import array

RING_PACKETS = 10
RING_SECONDS = 10.0   # every test point (ALSA, PipeWire, MXL, AoIP): 10 s ring
MAX_CHANNELS = 16
FLOW_ID = "wbs-test-point"

_LOCK = threading.RLock()
_ACTIVE = None  # TestPoint


def _run(cmd, timeout=3.0):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.stdout
    except Exception:
        return ""


def _pw_objects():
    try:
        return json.loads(_run(["pw-dump"], timeout=4.0) or "[]")
    except Exception:
        return []


def _ufw_enabled() -> bool:
    try:
        with open("/etc/ufw/ufw.conf") as f:
            return any(l.strip().upper() == "ENABLED=YES" for l in f)
    except OSError:
        return False


def _route_iface(group: str) -> str:
    out = _run(["ip", "-o", "route", "get", group]).split()
    return out[out.index("dev") + 1] if "dev" in out else ""


def _mcast_count(iface: str) -> int:
    try:
        with open(f"/sys/class/net/{iface}/statistics/multicast") as f:
            return int(f.read().strip())
    except (OSError, ValueError):
        return -1


def _graph_quantum(objs=None) -> int:
    """The PipeWire graph quantum in frames (the PipeWire 'packet')."""
    out = _run(["pw-metadata", "-n", "settings", "0"])
    vals = {}
    for key in ("clock.force-quantum", "clock.quantum"):
        i = out.find(f"'{key}'")
        if i >= 0:
            seg = out[i:].split("value:'", 1)
            if len(seg) == 2:
                try:
                    vals[key] = int(seg[1].split("'", 1)[0])
                except ValueError:
                    pass
    q = vals.get("clock.force-quantum") or 0
    if q <= 0:
        q = vals.get("clock.quantum") or 1024
    return max(32, min(q, 16384))


# ---------------------------------------------------------------------------
# Ring
# ---------------------------------------------------------------------------

class TapRing:
    """
    Planar Float32 ring per channel: RING_PACKETS x packet_frames frames, or a fixed
    duration (AoIP: 10 s). Waveform min/max bins and peak/RMS meters are maintained
    as each packet is written, so a 480,000-frame x 8ch ring snapshots in O(bins).
    """

    NUM_BINS = 720

    def __init__(self, channels: int, packet_frames: int, sample_rate: int, seconds: float = 0.0):
        self.channels = channels
        self.packet_frames = packet_frames
        self.sample_rate = sample_rate
        self.length = int(seconds * sample_rate) if seconds > 0 else RING_PACKETS * packet_frames
        self.data = [array("f", bytes(4 * self.length)) for _ in range(channels)]
        self.head = 0
        self.frames = 0
        self.packets = 0
        self.nb = min(self.NUM_BINS, self.length)
        self.bmin = [[0.0] * self.nb for _ in range(channels)]
        self.bmax = [[0.0] * self.nb for _ in range(channels)]
        self._last_bin = -1
        self.peak = [0.0] * channels
        self.rms = [0.0] * channels
        # ballistics: peak falls back over ~1.5 s, RMS integrates over ~300 ms
        pkt_s = max(1, packet_frames) / sample_rate
        self._peak_fall = 0.92 ** (pkt_s / 0.1)
        self._rms_k = 1.0 - math.exp(-pkt_s / 0.3)

    def _bin_of(self, pos: int) -> int:
        return (pos * self.nb) // self.length

    def write(self, planar):
        n = len(planar[0])
        if n == 0:
            return
        if n > self.length:
            planar = [p[-self.length:] for p in planar]
            n = self.length
        h, L = self.head, self.length
        first = min(n, L - h)
        for c in range(self.channels):
            src = planar[c]
            self.data[c][h:h + first] = src[:first]
            if first < n:
                self.data[c][0:n - first] = src[first:n]
            # meters from this packet
            pk = max(max(src), -min(src))
            ms = sum(v * v for v in src) / n
            self.peak[c] = max(pk, self.peak[c] * self._peak_fall)
            self.rms[c] += (math.sqrt(ms) - self.rms[c]) * self._rms_k
        # bins: a bin is reset the first time the write head enters it
        i = 0
        while i < n:
            pos = (h + i) % L
            b = self._bin_of(pos)
            bin_end = min(L, -(-((b + 1) * L) // self.nb))
            run = min(n - i, max(1, bin_end - pos))
            fresh = b != self._last_bin
            self._last_bin = b
            for c in range(self.channels):
                seg = planar[c][i:i + run]
                lo, hi = min(seg), max(seg)
                if fresh:
                    self.bmin[c][b], self.bmax[c][b] = lo, hi
                else:
                    if lo < self.bmin[c][b]:
                        self.bmin[c][b] = lo
                    if hi > self.bmax[c][b]:
                        self.bmax[c][b] = hi
            i += run
        self.head = (h + n) % L
        self.frames += n
        self.packets += 1

    def snapshot(self, bins: int) -> list:
        step = max(1, self.nb // max(1, bins))
        db = lambda v: round(20.0 * math.log10(v), 2) if v > 1e-6 else -120.0
        out = []
        for c in range(self.channels):
            mins, maxs = self.bmin[c], self.bmax[c]
            lo = [round(min(mins[i:i + step]), 5) for i in range(0, self.nb, step)]
            hi = [round(max(maxs[i:i + step]), 5) for i in range(0, self.nb, step)]
            out.append({"min": lo, "max": hi, "peak_db": db(self.peak[c]), "rms_db": db(self.rms[c])})
        return out


# ---------------------------------------------------------------------------
# Test point
# ---------------------------------------------------------------------------

class TestPoint:
    def __init__(self, kind: str, ref: str, label: str):
        self.kind, self.ref, self.label = kind, str(ref), label or str(ref)
        self.source = ""          # resolved description of what is tapped
        self.status = "starting"
        self.error = None
        self.hint = None
        self.fix = None           # {title, why, options:[{label, note, command}]}: only the user can run it
        self.ring = None
        self.sample_rate = 48000
        self.channels = 2
        self.packet_frames = 0
        self.lost = 0
        self.started = time.time()
        self.stop_event = threading.Event()
        self.proc = None
        self.thread = threading.Thread(target=self._run, daemon=True, name=f"test-point-{kind}")

    # -- lifecycle --
    def start(self):
        self.thread.start()

    def stop(self):
        self.stop_event.set()
        if self.proc:
            try:
                self.proc.terminate()
            except Exception:
                pass
        self.thread.join(timeout=1.5)

    def _fail(self, msg, hint=None):
        self.status, self.error, self.hint = "error", msg, hint

    def _run(self):
        try:
            if self.kind in ("hw", "pw"):
                self._run_pipewire()
            elif self.kind == "mxl":
                self._run_mxl()
            elif self.kind == "aoip":
                self._run_rtp()
            else:
                self._fail(f"'{self.kind}' points cannot be metered")
        except Exception as e:
            self._fail(f"{e.__class__.__name__}: {e}")

    # -- PipeWire / ALSA --
    def _resolve_pipewire(self):
        objs = _pw_objects()
        by_id = {o.get("id"): o for o in objs}
        props = lambda o: (o or {}).get("info", {}).get("props", {}) or {}

        def node_target(nid, depth=0):
            o = by_id.get(nid)
            if not o or not o.get("type", "").endswith("Node"):
                return None
            p = props(o)
            mc = p.get("media.class", "")
            name = p.get("node.name", "")
            ch = int(p.get("audio.channels") or 2)
            if mc.startswith("Audio/Source"):
                return (["--device=" + name], f"{name} (source)", ch)
            if mc.startswith("Audio/Sink"):
                return (["--device=" + name + ".monitor"], f"{name} (sink monitor)", ch)
            if mc == "Stream/Output/Audio":
                serial = p.get("object.serial")
                return (["--monitor-stream=" + str(serial)], f"{p.get('application.name') or name} (playback stream)", ch)
            if mc == "Stream/Input/Audio" and depth == 0:
                for l in objs:
                    if l.get("type", "").endswith("Link"):
                        li = l.get("info", {})
                        if li.get("input-node-id") == nid:
                            t = node_target(li.get("output-node-id"), 1)
                            if t:
                                return (t[0], f"{t[1]} -> {name or 'capture stream'}", t[2])
                return None
            return None

        if self.kind == "hw":
            card = str(self.ref).replace("card", "").strip()
            cands = [o for o in objs if o.get("type", "").endswith("Node")
                     and str(props(o).get("alsa.card", "")) == card
                     and props(o).get("media.class", "").startswith(("Audio/Source", "Audio/Sink"))]
            cands.sort(key=lambda o: 0 if props(o).get("media.class", "").startswith("Audio/Source") else 1)
            for o in cands:
                t = node_target(o["id"])
                if t:
                    return t, objs
            raise LookupError(f"ALSA card {card} has no PipeWire node (profile off or card busy)")

        try:
            oid = int(str(self.ref).split(".")[0])
        except ValueError:
            raise LookupError(f"not a PipeWire object id: {self.ref}")
        o = by_id.get(oid)
        if not o:
            raise LookupError(f"PipeWire object {oid} is gone")
        if o.get("type", "").endswith("Port"):
            oid = int(props(o).get("node.id", -1))
        t = node_target(oid)
        if not t:
            raise LookupError(f"PipeWire object {self.ref} carries no tappable audio")
        return t, objs

    def _run_pipewire(self):
        (dev_args, desc, ch), objs = self._resolve_pipewire()
        self.channels = max(1, min(ch, MAX_CHANNELS))
        self.packet_frames = _graph_quantum(objs)
        self.source = desc
        self.ring = TapRing(self.channels, self.packet_frames, self.sample_rate, RING_SECONDS)
        lat_ms = max(1, int(1000 * self.packet_frames / self.sample_rate))
        self.proc = subprocess.Popen(
            ["parec", *dev_args, "--format=float32le", f"--rate={self.sample_rate}",
             f"--channels={self.channels}", "--raw", f"--latency-msec={lat_ms}"],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.status = "running"
        chunk = self.packet_frames * self.channels * 4
        N = self.channels
        while not self.stop_event.is_set():
            raw = self.proc.stdout.read(chunk)
            if not raw or len(raw) < 4 * N:
                if not self.stop_event.is_set():
                    self._fail(f"parec ended ({desc})")
                break
            raw = raw[: len(raw) - len(raw) % (4 * N)]
            a = array("f", raw)
            with _LOCK:
                self.ring.write([a[c::N] for c in range(N)])

    # -- MXL --
    def _run_mxl(self):
        from mxl_engine import MXL_ENGINE
        flow = MXL_ENGINE.flows.get(self.ref)
        if flow is None:
            raise LookupError(f"MXL flow {self.ref} is not in this domain")
        self.sample_rate = flow.sample_rate
        self.channels = flow.channel_count
        self.packet_frames = flow.quantum
        self.source = f"{flow.flow_id} · {flow.domain_id} (shared memory)"
        self.ring = TapRing(self.channels, self.packet_frames, self.sample_rate, RING_SECONDS)
        self.status = "running"
        cursor = flow.write_head
        L = flow.buffer_length
        interval = flow.quantum / flow.sample_rate
        while not self.stop_event.is_set():
            time.sleep(interval)
            w = flow.write_head
            avail = (w - cursor) % L
            if avail == 0:
                continue
            avail = min(avail, self.ring.length)
            start = (w - avail) % L
            flow.ensure_open()
            planar = []
            for c in range(self.channels):
                base = c * L * 4
                if start + avail <= L:
                    raw = flow._reader_mm[base + start * 4: base + (start + avail) * 4]
                else:
                    l1 = L - start
                    raw = flow._reader_mm[base + start * 4: base + L * 4] + flow._reader_mm[base: base + (avail - l1) * 4]
                planar.append(array("f", raw))
            with _LOCK:
                self.ring.write(planar)
            cursor = w

    # -- AES67 / RAVENNA RTP --
    def _resolve_sdp(self):
        import aoip_listener
        snap = aoip_listener.snapshot()
        sessions = (snap.get("sap") or {}).get("sessions", [])
        ref = self.ref
        for s in sessions:
            if ref in (s.get("id"), s.get("session_name")):
                return s
        for s in sessions:  # a device (RAVENNA / NMOS / Dante IP): its first announced stream
            if ref in (s.get("origin_ip"), s.get("source_ip")):
                return s
        return None

    def _run_rtp(self):
        s = self._resolve_sdp()
        deadline = time.time() + 40.0  # SAP re-announces every ~30 s: wait for one before giving up
        while not s and time.time() < deadline and not self.stop_event.is_set():
            self.status, self.hint = "waiting", "waiting for a SAP announcement of this stream"
            self.stop_event.wait(1.0)
            s = self._resolve_sdp()
        self.hint = None
        if not s or not s.get("multicast_ip") or not s.get("port"):
            raise LookupError(f"no SDP heard for {self.label}: Dante-native audio cannot be received "
                              "(enable AES67 on the device) and RAVENNA/NMOS streams need a SAP announcement")
        enc = (s.get("encoding") or "L24").upper()
        if enc not in ("L24", "L16"):
            raise LookupError(f"{enc} RTP payload is not decoded (L24 / L16 only)")
        bps = 3 if enc == "L24" else 2
        self.channels = max(1, min(int(s.get("channels") or 2), MAX_CHANNELS))
        self.sample_rate = int(s.get("sample_rate") or 48000)
        grp, port = s["multicast_ip"], int(s["port"])
        ptime = s.get("ptime") or 1.0
        self.source = f"{s.get('session_name')} · {grp}:{port} · {self.channels}ch {enc} @ {self.sample_rate / 1000:g}k · ptime {ptime} ms"
        self.packet_frames = max(1, int(round(self.sample_rate * ptime / 1000.0)))
        self.ring = TapRing(self.channels, self.packet_frames, self.sample_rate, RING_SECONDS)

        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
        except OSError:
            pass
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 1 << 20)
        iface = _route_iface(grp)
        mc0, t0 = _mcast_count(iface), time.time()  # NIC multicast rate before the join
        time.sleep(1.0)
        base_rate = (_mcast_count(iface) - mc0) / max(0.1, time.time() - t0) if mc0 >= 0 else -1
        mc1, t1 = _mcast_count(iface), time.time()
        sock.bind((grp, port))  # bound to the group: only this stream, not every group on :port
        joined = 0
        for idx, _name in socket.if_nameindex():
            try:
                sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP,
                                socket.inet_aton(grp) + socket.inet_aton("0.0.0.0") + struct.pack("@i", idx))
                joined += 1
            except OSError:
                pass
        if not joined:
            sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, socket.inet_aton(grp) + socket.inet_aton("0.0.0.0"))
        sock.settimeout(0.5)
        self.status = "waiting"
        N = self.channels
        scale = 1.0 / 2147483648.0 if bps == 3 else 1.0 / 32768.0
        little = sys.byteorder == "little"
        last_seq = None
        sized = False
        try:
            while not self.stop_event.is_set():
                try:
                    pkt = sock.recv(9000)
                except socket.timeout:
                    if self.ring.packets == 0 and time.time() - t1 > 2.0 and self.fix is None:
                        self._diagnose_rtp(grp, port, iface, base_rate, mc1, t1)
                    continue
                if len(pkt) < 12 or (pkt[0] >> 6) != 2:
                    continue
                cc = pkt[0] & 0x0F
                off = 12 + 4 * cc
                if pkt[0] & 0x10 and len(pkt) >= off + 4:
                    off += 4 + 4 * struct.unpack("!H", pkt[off + 2:off + 4])[0]
                end = len(pkt) - (pkt[-1] if pkt[0] & 0x20 else 0)
                payload = pkt[off:end]
                frames = len(payload) // (bps * N)
                if frames == 0:
                    continue
                seq = struct.unpack("!H", pkt[2:4])[0]
                if last_seq is not None:
                    gap = (seq - last_seq - 1) & 0xFFFF
                    if gap and gap < 1000:
                        self.lost += gap
                last_seq = seq
                if not sized and frames != self.packet_frames:  # measured packet beats SDP ptime
                    with _LOCK:
                        self.packet_frames = frames
                        self.ring = TapRing(N, frames, self.sample_rate, RING_SECONDS)
                sized = True
                payload = payload[: frames * bps * N]
                if bps == 3:
                    buf = bytearray(4 * frames * N)
                    buf[0::4], buf[1::4], buf[2::4] = payload[0::3], payload[1::3], payload[2::3]
                    ints = array("i", bytes(buf))
                else:
                    ints = array("h", payload)
                if little:
                    ints.byteswap()
                f = array("f", [v * scale for v in ints])
                with _LOCK:
                    self.ring.write([f[c::N] for c in range(N)])
                    self.status = "running"
                    self.hint = None
                    self.fix = None
        finally:
            sock.close()

    def _diagnose_rtp(self, grp, port, iface, base_rate, mc1, t1):
        """Joined but silent: tell the user why, and the one command that fixes it if there is one."""
        rate = (_mcast_count(iface) - mc1) / max(0.1, time.time() - t1) if mc1 >= 0 and base_rate >= 0 else -1
        arriving = rate >= 0 and rate - base_rate > 50
        nic = (f"{iface} is receiving {rate:.0f} multicast frames/s since the join (was {base_rate:.0f}/s), "
               "so the stream reaches this machine" if arriving else
               f"{iface} shows no extra multicast traffic since the join" if rate >= 0 else "")
        if _ufw_enabled():
            self.hint = f"{grp}:{port} is blocked by the UFW firewall"
            self.fix = {
                "title": "Allow AES67 / RAVENNA audio through the firewall",
                "why": (f"{nic}, but UFW (incoming policy DROP) discards it before the socket. "
                        "Opening it needs your password, so run one of these in a terminal."),
                "options": [
                    {"label": "This session only", "note": "the rule is gone at the next reboot",
                     "command": (f"sudo iptables -I INPUT{' -i ' + iface if iface else ''} -p udp "
                                 f"-d 239.0.0.0/8 --dport {port} -j ACCEPT")},
                    {"label": "Permanently", "note": "saved as a UFW rule",
                     "command": f"sudo ufw allow in on {iface or 'any'} proto udp to 239.0.0.0/8 port {port}"},
                ],
            }
        elif arriving:
            self.hint = f"{grp}:{port} reaches {iface} but not the socket"
            self.fix = {
                "title": "Check the host firewall",
                "why": f"{nic}, but nothing reaches the socket; a firewall rule is dropping it. List the rules:",
                "options": [{"label": "List firewall rules", "note": "read-only", "command": "sudo nft list ruleset"}],
            }
        else:
            self.hint = (f"no RTP for {grp}:{port} on {iface or 'any interface'}: the sender may be stopped, "
                         "or the switch is not forwarding this group (IGMP)")

    # -- views --
    def info(self) -> dict:
        sr = self.sample_rate
        return {
            "kind": self.kind, "ref": self.ref, "label": self.label, "source": self.source,
            "status": self.status, "error": self.error, "hint": self.hint, "fix": self.fix,
            "sample_rate": sr, "channel_count": self.channels,
            "packet_frames": self.packet_frames,
            "packet_ms": round(1000.0 * self.packet_frames / sr, 3) if self.packet_frames else None,
            "ring_frames": self.ring.length if self.ring else 0,
            "ring_ms": round(1000.0 * self.ring.length / sr, 3) if self.ring else None,
            "packets": self.ring.packets if self.ring else 0,
            "lost_packets": self.lost,
        }

    def ring_snapshot(self, bins: int = 360):
        if not self.ring:
            return None
        with _LOCK:
            r = self.ring
            chans = r.snapshot(bins)
            head = r.head
        d = self.info()
        d.update({
            "flow_id": FLOW_ID,
            "label": f"TEST POINT · {self.label}",
            "kind": "testpoint",
            "buffer_length": r.length,
            "write_head": head,
            "meter_head": (head - r.packet_frames) % r.length,  # meters read one packet behind the writer
            "write_seq": r.packets,
            "channels": chans,
        })
        return d


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------

def set_point(kind: str, ref: str, label: str = "") -> dict:
    global _ACTIVE
    stop_point()
    tp = TestPoint(kind, ref, label)
    with _LOCK:
        _ACTIVE = tp
    tp.start()
    time.sleep(0.15)
    return tp.info()


def stop_point() -> bool:
    global _ACTIVE
    with _LOCK:
        tp, _ACTIVE = _ACTIVE, None
    if tp:
        tp.stop()
        return True
    return False


def status() -> dict:
    tp = _ACTIVE
    return {"active": bool(tp), "point": tp.info() if tp else None}


def ring_snapshot(bins: int = 360):
    tp = _ACTIVE
    return tp.ring_snapshot(bins) if tp else None
