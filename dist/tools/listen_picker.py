# Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved.
"""
Simple "what should the meters hear?" picker for the TAP front page.

1. Windows making noise: every app with an uncorked playback stream, named by
   its desktop window title (X11 _NET_WM_PID walk-up) when one can be found.
   Picking one meters that app alone; the others go straight to the speakers.
   "Everything" meters all desktop audio (the default).
2. Sound card inputs: physical capture sources (alsa_input.*, bluez_input.*).
   Picking one meters that input; desktop audio goes straight to the speakers.

The daemon module is passed in as `tap` so this file never imports it.
"""

import os
import re
import subprocess

# Streams the TAP itself (or its helpers) owns: never listed, never moved.
OWN_BINARIES = {"pacat", "parec", "pw-cat", "pw-play", "pw-record", "pw-loopback", "paplay"}
MEDIA_HINTS = ("youtube", "spotify", "music", "netflix", "twitch", "soundcloud",
               "bandcamp", "vimeo", "podcast", "radio", "vlc", "player")

# None = everything, "<app key>" = that app alone, "input" = a sound card input
MODE = {"app": None, "input": None}


def _run(cmd, timeout=2.0):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.stdout if p.returncode == 0 else ""
    except Exception:
        return ""


def list_streams():
    """Parse `pactl list sink-inputs` into [{id, sink, corked, props}]."""
    out = _run(["pactl", "list", "sink-inputs"])
    streams, cur = [], None
    for line in out.splitlines():
        s = line.strip()
        m = re.match(r"Sink Input #(\d+)", s)
        if m:
            cur = {"id": m.group(1), "sink": "", "corked": False, "props": {}}
            streams.append(cur)
        elif cur is None:
            continue
        elif s.startswith("Sink: "):
            cur["sink"] = s[6:].strip()
        elif s.startswith("Corked: "):
            cur["corked"] = s[8:].strip() == "yes"
        elif " = " in s:
            k, v = s.split(" = ", 1)
            cur["props"][k.strip()] = v.strip().strip('"')
    own = os.getpid()
    keep = []
    for st in streams:
        p = st["props"]
        binary = p.get("application.process.binary", "")
        name = (p.get("application.name", "") + " " + p.get("media.name", "")).lower()
        if binary in OWN_BINARIES or "loopback" in name or p.get("application.process.id") == str(own):
            continue
        keep.append(st)
    return keep


def _windows():
    """[(pid, title)] for every top-level X11 window, [] when not on X11."""
    if not os.environ.get("DISPLAY"):
        return []
    root = _run(["xprop", "-root", "_NET_CLIENT_LIST"])
    wins = []
    for wid in re.findall(r"0x[0-9a-f]+", root):
        pid = re.search(r"= (\d+)", _run(["xprop", "-id", wid, "_NET_WM_PID"], 0.5))
        name = re.search(r'= "(.*)"', _run(["xprop", "-id", wid, "_NET_WM_NAME"], 0.5))
        if pid and name:
            wins.append((int(pid.group(1)), name.group(1)))
    return wins


def _ancestors(pid):
    chain = []
    for _ in range(12):
        if pid <= 1:
            break
        chain.append(pid)
        try:
            with open(f"/proc/{pid}/stat") as f:
                pid = int(f.read().rsplit(")", 1)[1].split()[1])
        except Exception:
            break
    return chain


def _window_title(pid, wins):
    for anc in _ancestors(pid):
        titles = [t for p, t in wins if p == anc]
        if titles:
            media = [t for t in titles if any(h in t.lower() for h in MEDIA_HINTS)]
            return (media or titles)[0]
    return ""


def apps():
    """One entry per app that is making noise (has an uncorked stream)."""
    wins = _windows()
    by_key = {}
    for st in list_streams():
        p = st["props"]
        key = p.get("application.name") or p.get("application.process.binary") or "Unknown"
        app = by_key.setdefault(key, {"key": key, "name": key, "title": "", "playing": False, "streams": []})
        app["streams"].append(st["id"])
        if not st["corked"]:
            app["playing"] = True
        if not app["title"]:
            try:
                app["title"] = _window_title(int(p.get("application.process.id", "0")), wins)
            except ValueError:
                pass
    for a in by_key.values():  # "Song | YouTube Music - Google Chrome" -> "Song | YouTube Music"
        suffix = " - " + a["name"]
        if a["title"].endswith(suffix):
            a["title"] = a["title"][: -len(suffix)]
    return [a for a in by_key.values() if a["playing"]]


def inputs(tap):
    """Physical sound card capture sources with their live level."""
    out = []
    for s in tap.AVAILABLE_SOURCES:
        n = s["name"]
        real = n.startswith("alsa_input.") or n.startswith("bluez_input.")
        if real and not n.endswith(".monitor") and not tap.is_virtual_sink(n):
            m = tap.SOURCE_METERS.get(n, {})
            out.append({"name": n, "label": s.get("description") or n, "db": m.get("db", -60.0)})
    return out


def enforce(tap):
    """Keep every app stream on the right sink for the current pick (new apps included)."""
    meter_bus, speakers = "wbs_input_bus", tap.PHYSICAL_SINK
    if not speakers:
        return
    sinks = {}
    for line in _run(["pactl", "list", "short", "sinks"]).splitlines():
        parts = line.split("\t")
        if len(parts) >= 2:
            sinks[parts[0]] = parts[1]
    for st in list_streams():
        key = st["props"].get("application.name") or st["props"].get("application.process.binary") or "Unknown"
        if MODE["input"]:
            want = speakers
        elif MODE["app"] is None or MODE["app"] == key:
            want = meter_bus
        else:
            want = speakers
        if sinks.get(st["sink"], st["sink"]) != want:
            _run(["pactl", "move-sink-input", st["id"], want])


def state(tap):
    return {
        "apps": apps(),
        "inputs": inputs(tap),
        "pick": {"app": MODE["app"], "input": MODE["input"]},
    }


def listen(tap, data):
    """POST /api/listen: {app: key|null} meters desktop audio, {input: source} meters a sound card input."""
    if data.get("input"):
        valid = {s["name"] for s in tap.AVAILABLE_SOURCES}
        if data["input"] not in valid:
            return False
        MODE["app"], MODE["input"] = None, data["input"]
        tap.SELECTED_SOURCE = data["input"]
    else:
        MODE["app"], MODE["input"] = data.get("app"), None
        tap.SELECTED_SOURCE = "wbs_input_bus.monitor"
    tap.apply_routes()
    enforce(tap)
    return True
