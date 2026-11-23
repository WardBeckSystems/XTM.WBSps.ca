# Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.
"""
Setup & deployment guide served by the TAP at /setup.

Everything needed to run the WARD BECK TAP as a Docker container and to
bring up the pieces around it: the CBC / Radio-Canada MXL test set, the
passive PTP source, SAP / SIP multicast, Avahi discovery and XTM.
The "Live checks" panel probes the running services from the browser.
"""

SETUP_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WARD BECK TAP Setup</title>
<style>
  :root { --bg:#07111b; --panel:#0b1826; --line:#1a3654; --text:#e2e8f0; --sub:#8aa0b8; --accent:#38bdf8; --orange:#f97316; --ok:#22c55e; --bad:#ef4444; --warn:#f59e0b; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 24px 16px 64px; }
  header { display:flex; align-items:center; gap:14px; flex-wrap:wrap; border-bottom:2px solid var(--line); padding-bottom:14px; margin-bottom:18px; }
  .badge { border:2px solid var(--orange); color:var(--orange); font:800 13px monospace; padding:4px 8px; border-radius:4px; }
  h1 { font:800 20px monospace; letter-spacing:1px; margin:0; }
  header a { margin-left:auto; color:var(--accent); text-decoration:none; font:600 13px monospace; }
  nav { display:flex; flex-wrap:wrap; gap:6px; margin:0 0 20px; }
  nav a { color:var(--sub); border:1px solid var(--line); border-radius:999px; padding:4px 10px; font:600 12px monospace; text-decoration:none; }
  nav a:hover { color:var(--text); border-color:var(--accent); }
  section { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:16px 18px; margin:0 0 16px; }
  h2 { font:800 14px monospace; letter-spacing:1px; color:var(--accent); margin:0 0 10px; text-transform:uppercase; }
  h3 { font:700 14px monospace; margin:16px 0 6px; color:var(--text); }
  p, li { color:#cbd5e1; }
  code { font:13px ui-monospace,SFMono-Regular,Menlo,monospace; background:#06101a; border:1px solid var(--line); border-radius:3px; padding:0 4px; }
  pre { position:relative; background:#040b12; border:1px solid var(--line); border-radius:6px; padding:12px 14px; overflow-x:auto; margin:8px 0 12px; }
  pre code { border:0; padding:0; background:none; color:#d1fae5; white-space:pre; }
  .copy { position:absolute; top:6px; right:6px; font:600 11px monospace; color:var(--sub); background:#0b1826; border:1px solid var(--line); border-radius:4px; padding:2px 8px; cursor:pointer; }
  .copy:hover { color:var(--text); }
  table { width:100%; border-collapse:collapse; margin:6px 0 10px; font-size:14px; }
  th, td { text-align:left; border-bottom:1px solid var(--line); padding:6px 8px; vertical-align:top; }
  th { color:var(--sub); font:700 12px monospace; text-transform:uppercase; }
  td code { white-space:nowrap; }
  .note { border-left:3px solid var(--warn); padding:6px 10px; background:#14120a; color:#fde68a; border-radius:0 4px 4px 0; margin:8px 0; }
  .checks { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:8px; }
  .check { display:flex; gap:8px; align-items:flex-start; border:1px solid var(--line); border-radius:6px; padding:8px 10px; background:#06101a; }
  .check i { flex:none; width:10px; height:10px; border-radius:50%; margin-top:5px; background:#475569; }
  .check.ok i { background:var(--ok); box-shadow:0 0 6px var(--ok); }
  .check.bad i { background:var(--bad); }
  .check.warn i { background:var(--warn); }
  .check b { display:block; font:700 13px monospace; }
  .check span { color:var(--sub); font-size:12px; }
  footer { color:var(--sub); font-size:12px; margin-top:24px; }
  footer a { color:var(--accent); }
  @media (max-width: 640px) { td code { white-space:normal; word-break:break-all; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <span class="badge">WBS</span>
    <h1>WARD BECK TAP: SETUP &amp; DEPLOYMENT</h1>
    <a href="/">← Dashboard</a>
  </header>

  <nav>
    <a href="#live">Live checks</a>
    <a href="#docker">1 · Run the TAP in Docker</a>
    <a href="#host">2 · Host requirements</a>
    <a href="#cbc">3 · CBC MXL test set</a>
    <a href="#ptp">4 · PTP (passive)</a>
    <a href="#multicast">5 · SAP &amp; SIP</a>
    <a href="#discovery">6 · Dante / RAVENNA / NMOS</a>
    <a href="#xtm">7 · XTM</a>
    <a href="#verify">8 · Verify &amp; troubleshoot</a>
    <a href="#manage">9 · Update / stop / native</a>
  </nav>

  <section id="live">
    <h2>Live checks</h2>
    <p>Probed from this browser right now. Green means the service answered.</p>
    <div class="checks" id="checks"></div>
  </section>

  <section id="docker">
    <h2>1 · Run the TAP in Docker</h2>
    <p>The TAP drives the <em>host's</em> audio server, so the container shares the host network, your PipeWire / PulseAudio sockets, <code>/dev/shm/mxl</code>, the D-Bus system socket and <code>/dev/snd</code>. It runs as your desktop user, not root.</p>
    <h3>Build and start (Docker Compose)</h3>
<pre><code>git clone https://github.com/WardBeckSystems/Ward-Beck-Audio-Tap.git
cd Ward-Beck-Audio-Tap
mkdir -p /dev/shm/mxl
export UID GID=$(id -g)
docker compose up -d --build</code></pre>
    <p>Then open <a href="http://127.0.0.1:8467" style="color:var(--accent)">http://127.0.0.1:8467</a> (dashboard) and this page at <code>/setup</code>.</p>
    <p>Stop any natively installed copy first, because only one TAP can own port 8467: <code>systemctl --user disable --now ward-beck-audio-tab</code>.</p>

    <h3>Same thing with plain <code>docker run</code></h3>
<pre><code>docker build -t ward-beck-audio-tab:latest .
U=$(id -u); G=$(id -g)
docker run -d --name wbs-tap --restart unless-stopped \
  --network host --user $U:$G --group-add audio \
  --security-opt apparmor=unconfined \
  -e XDG_RUNTIME_DIR=/run/user/$U \
  -e PULSE_SERVER=unix:/run/user/$U/pulse/native \
  -e PIPEWIRE_RUNTIME_DIR=/run/user/$U \
  -e MQTT_HOST=127.0.0.1 -e MQTT_PORT=1883 -e AOIP_PTP_MODE=mqtt \
  -v /run/user/$U/pulse:/run/user/$U/pulse \
  -v /run/user/$U/pipewire-0:/run/user/$U/pipewire-0 \
  -v /dev/shm/mxl:/dev/shm/mxl \
  -v /run/dbus/system_bus_socket:/run/dbus/system_bus_socket \
  --device /dev/snd \
  ward-beck-audio-tab:latest</code></pre>

    <h3>Why each setting is there</h3>
    <table>
      <tr><th>Setting</th><th>Needed for</th></tr>
      <tr><td><code>--network host</code></td><td>The dashboard binds <code>127.0.0.1:8467</code>; SAP / SIP multicast joins; MQTT on <code>127.0.0.1:1883</code>; the CBC test set on <code>:9600</code>.</td></tr>
      <tr><td><code>--user $UID:$GID</code></td><td>PipeWire / Pulse only accept their owner. The TAP creates <code>wbs_input_bus</code>, <code>wbs_meter_tap</code>, etc. in <em>your</em> session.</td></tr>
      <tr><td><code>/run/user/$UID/pulse</code>, <code>pipewire-0</code></td><td><code>pactl</code>, <code>parec</code>, <code>pw-dump</code>, <code>pw-metadata</code>, <code>wpctl</code>.</td></tr>
      <tr><td><code>/dev/shm/mxl</code></td><td>EBU DMF / MXL ring-buffer domains, shared with the CBC containers.</td></tr>
      <tr><td><code>/run/dbus/system_bus_socket</code> + <code>apparmor=unconfined</code></td><td><code>avahi-browse</code> (Dante, RAVENNA, NMOS). Docker's default AppArmor profile blocks D-Bus.</td></tr>
      <tr><td><code>--device /dev/snd</code>, <code>--group-add audio</code></td><td><code>aplay -l</code> and <code>amixer</code> for the ALSA layer of the pipeline view.</td></tr>
      <tr><td><code>WBS_NO_BROWSER=1</code> (baked in)</td><td>Keeps the TAP from trying to open a browser inside the container.</td></tr>
    </table>
  </section>

  <section id="host">
    <h2>2 · Host requirements</h2>
    <ul>
      <li>Linux x86-64 with <strong>Docker 24+</strong> and the Compose plugin; your user in the <code>docker</code> group.</li>
      <li>A desktop session running <strong>PipeWire</strong> (with <code>pipewire-pulse</code>) or <strong>PulseAudio</strong>. Check with <code>pactl info</code>.</li>
      <li><strong>avahi-daemon</strong> running, for Dante / RAVENNA / NMOS discovery: <code>systemctl status avahi-daemon</code>.</li>
      <li>The audio network on a wired interface, with multicast allowed (IGMP snooping with a querier, or flooding).</li>
      <li><code>/dev/shm/mxl</code> created: <code>mkdir -p /dev/shm/mxl</code>. <code>/dev/shm</code> is cleared on reboot, so run it again after a reboot, before starting the TAP.</li>
    </ul>
  </section>

  <section id="cbc">
    <h2>3 · CBC / Radio-Canada MXL test set</h2>
    <p>The CBC containers publish video and audio test flows into the shared MXL domain <code>/dev/shm/mxl/domain_1</code>. The TAP reads them, and its own Ward-Beck test-signal domain is cross-published there. They ship in the same repository.</p>
    <h3>Start</h3>
<pre><code>cd Ward-Beck-Audio-Tap
./start-mxl-demo.sh</code></pre>
    <p>That script creates <code>/dev/shm/mxl/domain_1</code>, copies in <code>domain_def.json</code> and the demo clip <code>sizzle.ts</code>, and runs <code>docker compose -f docker-compose.mxl-demo.yml up -d</code>. The images are pulled from <code>ghcr.io/cbcrc/*</code> and are <code>linux/amd64</code> only.</p>
    <table>
      <tr><th>Service</th><th>URL</th><th>What it does</th></tr>
      <tr><td>Test Generator</td><td><a href="http://localhost:9600" target="_blank" style="color:var(--accent)">:9600</a></td><td>25 video patterns and 13 audio waveforms (1 kHz, 400 Hz, pink, sweep, EBU GLITS). The XTM generators panel drives it through the TAP.</td></tr>
      <tr><td>WebRTC Player</td><td><a href="http://localhost:9601" target="_blank" style="color:var(--accent)">:9601</a></td><td>Watch and hear the MXL flows in the browser (mxl2webrtc via MediaMTX).</td></tr>
      <tr><td>File / Clip Player</td><td><a href="http://localhost:9602" target="_blank" style="color:var(--accent)">:9602</a></td><td>Loops clips from <code>mxl-hands-on/docker/exercise-4/data/Clips</code> into MXL.</td></tr>
      <tr><td>MXL Info GUI</td><td><a href="http://localhost:9699" target="_blank" style="color:var(--accent)">:9699</a></td><td>Domain / flow inspector: headers, rates, heads.</td></tr>
      <tr><td>MediaMTX</td><td><code>:8889</code></td><td>WebRTC (WHIP / WHEP) relay used by the player.</td></tr>
    </table>
    <p>Typical first run: open <code>:9600</code> and start a 1 kHz tone, then open <code>:9601</code> to hear it, then check the TAP dashboard or XTM's <strong>data</strong> tab to see the flow's ring buffer.</p>
    <h3>Stop</h3>
<pre><code>./stop-mxl-demo.sh</code></pre>
  </section>

  <section id="ptp">
    <h2>4 · PTP: the passive way</h2>
    <p>By default the TAP <strong>does not touch the PTP network at all</strong>. It does not bind ports 319 / 320, join 224.0.1.129, or send any packets. It reads the clocks your <code>apk-ptp</code> / <code>apk-clock-ptp-*</code> containers already decode, from the retained MQTT topic <code>APK.audio/System/Gui/Discovered/ptp</code>, read-only. That way it reports Dante (PTPv1), RAVENNA / AES67 (PTPv2) and gPTP clocks, grandmasters and priority1, and flags <em>contested</em> domains, without needing root or capabilities.</p>
    <table>
      <tr><th>Variable</th><th>Default</th><th>Meaning</th></tr>
      <tr><td><code>AOIP_PTP_MODE</code></td><td><code>mqtt</code></td><td><code>mqtt</code> = passive; <code>sockets</code> = bind 319/320 and decode on the wire.</td></tr>
      <tr><td><code>MQTT_HOST</code> / <code>MQTT_PORT</code></td><td><code>127.0.0.1</code> / <code>1883</code></td><td>The APK broker.</td></tr>
      <tr><td><code>AOIP_PTP_TOPIC</code></td><td><code>APK.audio/System/Gui/Discovered/ptp</code></td><td>Retained discovery list to read.</td></tr>
    </table>
    <p>Check the source is there:</p>
<pre><code>mosquitto_sub -h 127.0.0.1 -t 'APK.audio/System/Gui/Discovered/ptp' -C 1 | python3 -m json.tool | head -40</code></pre>
    <div class="note"><code>AOIP_PTP_MODE=sockets</code> needs ports 319 / 320, which are privileged and usually already owned by the PTP containers. In Docker that means running the TAP as root (<code>user: "0:0"</code>). It isn't recommended. Prefer the passive default.</div>
  </section>

  <section id="multicast">
    <h2>5 · SAP &amp; SIP (multicast)</h2>
    <p>These listen on the wire. They are receive-only joins on unprivileged ports, and need nothing beyond host networking.</p>
    <table>
      <tr><th>Protocol</th><th>Group</th><th>What you'll see</th></tr>
      <tr><td>SAP / SDP</td><td><code>239.255.255.255:9875</code>, <code>224.2.127.254:9875</code></td><td>AES67 / RAVENNA / Dante-AES67 sessions: name, multicast address, channels, encoding, PTP grandmaster and domain.</td></tr>
      <tr><td>SIP</td><td><code>224.0.1.75:5060</code></td><td>Multicast SIP (REGISTER / OPTIONS / responses), aggregated by method and sender.</td></tr>
    </table>
    <p><code>AOIP_IFACE=&lt;ip&gt;</code> joins on a single interface. Set it if you have many Docker / veth interfaces, because Linux allows only 20 group joins per socket (<code>net.ipv4.igmp_max_memberships</code>).</p>
  </section>

  <section id="discovery">
    <h2>6 · Dante / RAVENNA / NMOS discovery (mDNS)</h2>
    <p>The TAP asks the host's Avahi over D-Bus for <code>_netaudio-arc._udp</code> / <code>_netaudio-chan._udp</code> (Dante), <code>_rtsp._tcp</code> (RAVENNA) and <code>_nmos-node._tcp</code> (NMOS IS-04). It needs <code>avahi-daemon</code> on the host, the D-Bus socket mount and <code>apparmor=unconfined</code> (see step 1).</p>
<pre><code>avahi-browse -rtp _netaudio-arc._udp   # Dante devices
avahi-browse -rtp _rtsp._tcp           # RAVENNA streams</code></pre>
  </section>

  <section id="xtm">
    <h2>7 · XTM (the meter in the browser)</h2>
    <ul>
      <li>Open <a href="https://xtm.wbsps.ca" target="_blank" style="color:var(--accent)">xtm.wbsps.ca</a>, or run it locally from the XTM repo with <code>npm install &amp;&amp; npm run dev</code>.</li>
      <li>Settings drawer (gear) → input: <code>🎛️ [WBS Router Active] Monitor of WBS Meter Tap</code>.</li>
      <li>Footer tabs: <strong>loudness</strong> (dBFS / LUFS scope; the default), <strong>data</strong> (Scanalyzer eye, MXL rings, live pipeline graph with SAP / PTP / SIP) and <strong>routing</strong> (Web Router crosspoint matrix and the generators).</li>
      <li>XTM talks to the TAP at <code>http://localhost:8467</code>. If the data tab says "daemon offline", the TAP isn't running.</li>
    </ul>
  </section>

  <section id="verify">
    <h2>8 · Verify &amp; troubleshoot</h2>
<pre><code>docker compose ps                         # tap should be "healthy"
docker compose logs -f tap
curl -s http://127.0.0.1:8467/api/status | head -c 400
curl -s http://127.0.0.1:8467/api/aoip/multicast | python3 -m json.tool | head -60
curl -s http://127.0.0.1:8467/api/pipeline | python3 -m json.tool | head -40
docker exec wbs-tap pactl info            # audio server reachable from the container?</code></pre>
    <table>
      <tr><th>Symptom</th><th>Fix</th></tr>
      <tr><td><code>Connection refused</code> from <code>pactl</code></td><td>Wrong UID or socket path: <code>export UID GID=$(id -g)</code> before <code>docker compose up</code>; you must be logged in to the desktop session.</td></tr>
      <tr><td>Port 8467 already in use</td><td>A native TAP is running: <code>systemctl --user disable --now ward-beck-audio-tab</code>.</td></tr>
      <tr><td><code>Failed to create client object: Access denied</code></td><td>Avahi over D-Bus blocked: add <code>security_opt: [apparmor:unconfined]</code>.</td></tr>
      <tr><td>SAP shows 0 sessions</td><td>Not on the audio VLAN, or IGMP snooping without a querier. Set <code>AOIP_IFACE</code> to the audio NIC.</td></tr>
      <tr><td>PTP "broker down"</td><td>No MQTT broker on <code>MQTT_HOST:MQTT_PORT</code>, or the APK PTP containers aren't running.</td></tr>
      <tr><td>No MXL flows / CBC test set missing</td><td><code>mkdir -p /dev/shm/mxl</code> (after every reboot), then <code>./start-mxl-demo.sh</code>.</td></tr>
    </table>
  </section>

  <section id="manage">
    <h2>9 · Update, stop, or run without Docker</h2>
<pre><code>git pull && docker compose up -d --build   # update
docker compose down                         # stop and remove the container
./install.sh                                # native install (systemd user service) instead of Docker</code></pre>
  </section>

  <footer>Copyright &copy; 2026 Ward-Beck Systems (<a href="https://ward-beck.ca">Ward-Beck.ca</a>). All rights reserved.</footer>
</div>

<script>
(function () {
  // Copy buttons on every code block.
  document.querySelectorAll('pre').forEach(function (pre) {
    var b = document.createElement('button');
    b.className = 'copy'; b.type = 'button'; b.textContent = 'copy';
    b.onclick = function () {
      navigator.clipboard.writeText(pre.querySelector('code').innerText).then(function () { b.textContent = 'copied'; setTimeout(function () { b.textContent = 'copy'; }, 1200); });
    };
    pre.appendChild(b);
  });

  var host = location.hostname || '127.0.0.1';
  var box = document.getElementById('checks');
  function card(name) {
    var el = document.createElement('div');
    el.className = 'check';
    el.innerHTML = '<i></i><div><b></b><span>checking…</span></div>';
    el.querySelector('b').textContent = name;
    box.appendChild(el);
    return function (state, text) { el.className = 'check ' + state; el.querySelector('span').textContent = text; };
  }
  function timed(url, opts) {
    var c = new AbortController(); var t = setTimeout(function () { c.abort(); }, 2500);
    return fetch(url, Object.assign({ signal: c.signal }, opts || {})).finally(function () { clearTimeout(t); });
  }

  var tap = card('TAP API :8467');
  timed('/api/status').then(function (r) { return r.json(); }).then(function (d) {
    tap('ok', 'source: ' + (d.selected_source || 'online') + ' · ' + ((d.sources || []).length) + ' sources');
  }).catch(function () { tap('bad', 'no answer'); });

  var sap = card('SAP multicast'), ptp = card('PTP (passive)'), sip = card('SIP multicast');
  timed('/api/aoip/multicast').then(function (r) { return r.json(); }).then(function (m) {
    sap(m.sap.listening ? (m.sap.sessions.length ? 'ok' : 'warn') : 'bad',
        m.sap.listening ? m.sap.sessions.length + ' session(s) heard' : (m.sap.error || 'not listening'));
    var gms = (m.ptp.grandmasters || []).length;
    ptp(m.ptp.listening ? (m.ptp.clocks.length ? 'ok' : 'warn') : 'bad',
        m.ptp.listening ? (m.ptp.mode || '') + ' · ' + m.ptp.clocks.length + ' clock(s), ' + gms + ' master(s)' : (m.ptp.error || 'not listening'));
    sip(m.sip.listening ? 'ok' : 'bad', m.sip.listening ? (m.sip.messages.length + ' sender(s)') : (m.sip.error || 'not listening'));
  }).catch(function () { [sap, ptp, sip].forEach(function (f) { f('bad', 'TAP not answering'); }); });

  var mxl = card('MXL /dev/shm/mxl');
  timed('/api/mxl').then(function (r) { return r.json(); }).then(function (d) {
    var n = Object.keys(d.domains || {}).length, f = (d.flows || []).length;
    mxl(n ? 'ok' : 'warn', n + ' domain(s), ' + f + ' TAP flow(s)');
  }).catch(function () { mxl('bad', 'no answer'); });

  [['CBC Test Generator', 9600], ['CBC WebRTC Player', 9601], ['CBC File Player', 9602], ['CBC MXL Info GUI', 9699]].forEach(function (s) {
    var set = card(s[0] + ' :' + s[1]);
    timed('http://' + host + ':' + s[1] + '/', { mode: 'no-cors' }).then(function () { set('ok', 'answering'); })
      .catch(function () { set('bad', 'not running (./start-mxl-demo.sh)'); });
  });
})();
</script>
</body>
</html>
"""
