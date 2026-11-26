#!/usr/bin/env bash
# Ward-Beck Systems XTM Audio Bridge (Linux / PipeWire)
# Creates a zero-latency virtual audio source from active desktop audio/headphones
# so Chrome can capture system sound via getUserMedia with zero sharing banners.

set -euo pipefail

if ! command -v pw-loopback &> /dev/null; then
  echo "Error: pw-loopback (PipeWire) is not installed."
  exit 1
fi

echo "Starting XTM Virtual Audio Bridge..."
echo "Bridge source: 'XTM Audio Bridge (Banner-Free)'"
echo "Press Ctrl+C to stop."

exec /usr/bin/pw-loopback \
  --capture-props="node.name=XTM_Audio_Bridge node.description=\"XTM Desktop Loopback\" stream.capture.sink=true" \
  --playback-props="media.class=Audio/Source/Virtual node.name=XTM_Audio_Source node.description=\"XTM Audio Bridge (Banner-Free)\" priority.session=1 priority.driver=1"
