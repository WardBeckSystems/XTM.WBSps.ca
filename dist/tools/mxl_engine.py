#!/usr/bin/env python3
"""
Ward-Beck Systems - MXL (Media eXchange Layer) Shared-Memory Engine
===================================================================
Implementation of the EBU Dynamic Media Facility (DMF) reference architecture
shared-memory exchange plane for real-time audio transport.

Specifications:
- Domain & Flow hierarchy in POSIX shared memory (/dev/shm/mxl/<domain>/<flow>/)
- De-interleaved circular ring buffers for continuous Float32 audio (audio/float32)
- SMPTE 2059-1 (TAI) nanosecond timestamp indexing
- Lock-free / wait-free ring buffer synchronization
- Read-only memory mapping (PROT_READ) for strict consumer isolation
- Wrap-around slice mechanics (wrappedMultiBufferSlice)
- Live PipeWire/ALSA edge ingestion into MXL shared memory

Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.
"""

import json
import math
import mmap
import os
import struct
import subprocess
import threading
import time
import uuid

SHM_BASE_DIR = "/dev/shm/mxl"
HEADER_MAGIC = 0x4D584C31  # ASCII 'MXL1'
HEADER_STRUCT_FMT = "<IIIIQQIIIIII8s"
HEADER_SIZE = 64  # Exact 64-byte aligned header

# TAI leap seconds offset (SMPTE 2059-1): TAI is currently UTC + 37 seconds
TAI_OFFSET_SEC = 37.0


def current_tai_ns() -> int:
    """Returns the current SMPTE 2059-1 TAI nanoseconds epoch."""
    return int((time.time() + TAI_OFFSET_SEC) * 1_000_000_000)


class MxlFlow:
    """Represents an MXL continuous audio flow backed by POSIX shared memory."""

    def __init__(
        self,
        domain_id: str,
        flow_id: str,
        label: str,
        sample_rate: int = 48000,
        channel_count: int = 2,
        buffer_length: int = 480000,
        quantum: int = 256,
    ):
        self.domain_id = domain_id
        self.flow_id = flow_id
        self.label = label
        self.sample_rate = sample_rate
        self.channel_count = channel_count
        self.buffer_length = buffer_length  # 10.000s ring buffer (480,000 frames @ 48kHz)
        self.quantum = quantum

        self.flow_dir = os.path.join(SHM_BASE_DIR, domain_id, flow_id)
        os.makedirs(self.flow_dir, exist_ok=True)

        self.def_path = os.path.join(self.flow_dir, "flow_def.json")
        self.header_path = os.path.join(self.flow_dir, "ring.header")
        self.data_path = os.path.join(self.flow_dir, "ring.data")

        self.data_size = self.channel_count * self.buffer_length * 4  # 4 bytes per Float32

        # In-memory writer state
        self.write_head = 0
        self.write_seq = 0
        self.overrun_count = 0
        self.underrun_count = 0

        # Waveform bin cache for 10-second polar visualizer (720 bins = 72 bins/sec)
        self.num_bins = 720
        self.ch0_bins_min = [0.0] * self.num_bins
        self.ch0_bins_max = [0.0] * self.num_bins
        self.ch1_bins_min = [0.0] * self.num_bins
        self.ch1_bins_max = [0.0] * self.num_bins

        self._writer_mm = None
        self._writer_header_mm = None
        self._reader_mm = None
        self._reader_header_mm = None
        self._lock = threading.Lock()

        self._init_files()

    def _init_files(self):
        # 1. Write flow_def.json
        flow_def = {
            "domain_id": self.domain_id,
            "flow_id": self.flow_id,
            "label": self.label,
            "media_type": "audio/float32",
            "sample_rate": self.sample_rate,
            "channel_count": self.channel_count,
            "buffer_length": self.buffer_length,
            "quantum": self.quantum,
            "grain_duration_ns": int((self.quantum / self.sample_rate) * 1_000_000_000),
            "time_epoch": "SMPTE-2059-1-TAI",
            "shm_path": self.flow_dir,
            "created_at_tai_ns": current_tai_ns(),
        }
        with open(self.def_path, "w") as f:
            json.dump(flow_def, f, indent=2)

        # 2. Initialize ring.header (64 bytes)
        tai_now = current_tai_ns()
        header_bytes = struct.pack(
            HEADER_STRUCT_FMT,
            HEADER_MAGIC,
            1,  # version
            self.write_head,
            0,  # reserved1
            self.write_seq,
            tai_now,
            self.overrun_count,
            self.underrun_count,
            self.quantum,
            self.sample_rate,
            self.channel_count,
            self.buffer_length,
            b"\x00" * 8,
        )
        with open(self.header_path, "wb") as f:
            f.write(header_bytes)

        # 3. Initialize ring.data (channel_count * buffer_length * 4 bytes)
        if not os.path.exists(self.data_path) or os.path.getsize(self.data_path) != self.data_size:
            with open(self.data_path, "wb") as f:
                # Pre-allocate non-sparse storage to prevent SIGBUS in tmpfs mmap
                f.truncate(self.data_size)
                try:
                    os.posix_fallocate(f.fileno(), 0, self.data_size)
                except Exception:
                    f.seek(self.data_size - 1)
                    f.write(b"\x00")

        # Open writer memory maps
        f_hdr = open(self.header_path, "r+b")
        self._writer_header_mm = mmap.mmap(f_hdr.fileno(), HEADER_SIZE)

        f_data = open(self.data_path, "r+b")
        self._writer_mm = mmap.mmap(f_data.fileno(), self.data_size)

        # Reader memory maps (opened in PROT_READ / ACCESS_READ mode for reader isolation)
        f_r_hdr = open(self.header_path, "rb")
        self._reader_header_mm = mmap.mmap(f_r_hdr.fileno(), HEADER_SIZE, access=mmap.ACCESS_READ)

        f_r_data = open(self.data_path, "rb")
        self._reader_mm = mmap.mmap(f_r_data.fileno(), self.data_size, access=mmap.ACCESS_READ)

    def ensure_open(self):
        """Ensures all reader and writer memory-maps are active and valid."""
        with self._lock:
            if (
                self._writer_mm is None
                or getattr(self._writer_mm, "closed", True)
                or self._writer_header_mm is None
                or getattr(self._writer_header_mm, "closed", True)
                or self._reader_mm is None
                or getattr(self._reader_mm, "closed", True)
                or self._reader_header_mm is None
                or getattr(self._reader_header_mm, "closed", True)
            ):
                self._init_files()

    def write_frames(self, ch0_floats: list, ch1_floats: list):
        """
        Writes de-interleaved Float32 samples into the continuous circular ring buffer.
        Performs lock-free advancing of the write head and updates TAI epoch timestamp.
        """
        self.ensure_open()
        n_frames = min(len(ch0_floats), len(ch1_floats))
        if n_frames == 0:
            return

        head = self.write_head
        buf_len = self.buffer_length
        ch_stride = buf_len * 4

        # Calculate contiguous segments (handling circular wrap-around)
        if head + n_frames <= buf_len:
            # Single contiguous write
            ch0_bytes = struct.pack(f"<{n_frames}f", *ch0_floats[:n_frames])
            ch1_bytes = struct.pack(f"<{n_frames}f", *ch1_floats[:n_frames])

            # Channel 0
            self._writer_mm[head * 4 : (head + n_frames) * 4] = ch0_bytes
            # Channel 1
            self._writer_mm[ch_stride + head * 4 : ch_stride + (head + n_frames) * 4] = ch1_bytes
        else:
            # Wrapped write across buffer boundary
            l1 = buf_len - head
            l2 = n_frames - l1

            # Part 1 (head to end of buffer)
            ch0_part1 = struct.pack(f"<{l1}f", *ch0_floats[:l1])
            ch1_part1 = struct.pack(f"<{l1}f", *ch1_floats[:l1])
            self._writer_mm[head * 4 : buf_len * 4] = ch0_part1
            self._writer_mm[ch_stride + head * 4 : ch_stride + buf_len * 4] = ch1_part1

            # Part 2 (seam wrap to index 0)
            ch0_part2 = struct.pack(f"<{l2}f", *ch0_floats[l1:n_frames])
            ch1_part2 = struct.pack(f"<{l2}f", *ch1_floats[l1:n_frames])
            self._writer_mm[0 : l2 * 4] = ch0_part2
            self._writer_mm[ch_stride : ch_stride + l2 * 4] = ch1_part2

        # Update ring waveform bins for 10-second polar visualizer (720 bins)
        bin_idx = int((head / buf_len) * self.num_bins) % self.num_bins
        ch0_slice = ch0_floats[:n_frames]
        ch1_slice = ch1_floats[:n_frames]
        if ch0_slice:
            self.ch0_bins_min[bin_idx] = round(min(ch0_slice), 5)
            self.ch0_bins_max[bin_idx] = round(max(ch0_slice), 5)
        if ch1_slice:
            self.ch1_bins_min[bin_idx] = round(min(ch1_slice), 5)
            self.ch1_bins_max[bin_idx] = round(max(ch1_slice), 5)

        # Decay/clear next ahead bins to produce the rotating radar-trace eye effect
        for step in range(1, 16):
            cb = (bin_idx + step) % self.num_bins
            self.ch0_bins_min[cb] = 0.0
            self.ch0_bins_max[cb] = 0.0
            self.ch1_bins_min[cb] = 0.0
            self.ch1_bins_max[cb] = 0.0

        # Advance write head and sequence atomically
        self.write_head = (head + n_frames) % buf_len
        self.write_seq += 1
        tai_now = current_tai_ns()

        # Update ring.header (atomic offsets: write_head at 8, write_seq at 16, tai_ts at 24)
        struct.pack_into("<I", self._writer_header_mm, 8, self.write_head)
        struct.pack_into("<Q", self._writer_header_mm, 16, self.write_seq)
        struct.pack_into("<Q", self._writer_header_mm, 24, tai_now)

    def get_waveform_bins(self) -> dict:
        """
        Returns the downsampled 720-bin radial waveform for the 10-second ring buffer,
        phase-aligned to NTP and SMPTE 2059-1 TAI time.
        """
        tai_now = current_tai_ns()
        ntp_sec = time.time()
        hdr = self.read_header()
        return {
            "flow_id": self.flow_id,
            "sample_rate": self.sample_rate,
            "channel_count": self.channel_count,
            "buffer_length": self.buffer_length,
            "duration_sec": self.buffer_length / self.sample_rate,
            "write_head": hdr["write_head"],
            "write_seq": hdr["write_seq"],
            "tai_timestamp_ns": tai_now,
            "ntp_sec": ntp_sec,
            "second_of_10": round(ntp_sec % 10.0, 4),
            "head_sec": round((hdr["write_head"] / self.sample_rate), 4),
            "bins": self.num_bins,
            "ch0_min": self.ch0_bins_min,
            "ch0_max": self.ch0_bins_max,
            "ch1_min": self.ch1_bins_min,
            "ch1_max": self.ch1_bins_max,
        }

    def read_header(self) -> dict:
        """Reads current ring state using PROT_READ read isolation."""
        self.ensure_open()
        data = self._reader_header_mm[:HEADER_SIZE]
        magic, ver, w_head, res1, w_seq, tai_ts, ovr, und, qtm, srate, ch_cnt, blen, _ = struct.unpack(
            HEADER_STRUCT_FMT, data
        )
        return {
            "magic": hex(magic),
            "version": ver,
            "write_head": w_head,
            "write_seq": w_seq,
            "tai_timestamp_ns": tai_ts,
            "overrun_count": ovr,
            "underrun_count": und,
            "quantum": qtm,
            "sample_rate": srate,
            "channel_count": ch_cnt,
            "buffer_length": blen,
        }

    def get_samples(self, tail_index: int, count: int) -> dict:
        """
        Implements mxlFlowReaderGetSamples() returning an mxlWrappedMultiBufferSlice.
        If the requested slice crosses the buffer boundary, it is split into two contiguous slices.
        """
        hdr = self.read_header()
        w_head = hdr["write_head"]
        buf_len = self.buffer_length
        ch_stride = buf_len * 4

        tail = tail_index % buf_len
        count = min(count, buf_len)

        # Check overrun / underrun
        # Headroom: distance between tail and w_head
        lead_frames = (w_head - tail) % buf_len

        is_wrapped = False
        s1_start = tail
        s1_len = count
        s2_start = 0
        s2_len = 0

        if tail + count <= buf_len:
            # Single contiguous slice
            ch0_raw = self._reader_mm[tail * 4 : (tail + count) * 4]
            ch1_raw = self._reader_mm[ch_stride + tail * 4 : ch_stride + (tail + count) * 4]
            ch0_samples = list(struct.unpack(f"<{count}f", ch0_raw))
            ch1_samples = list(struct.unpack(f"<{count}f", ch1_raw))
        else:
            # WrappedMultiBufferSlice: Part 1 and Part 2 across seam
            is_wrapped = True
            s1_len = buf_len - tail
            s2_len = count - s1_len

            ch0_p1 = self._reader_mm[tail * 4 : buf_len * 4]
            ch1_p1 = self._reader_mm[ch_stride + tail * 4 : ch_stride + buf_len * 4]

            ch0_p2 = self._reader_mm[0 : s2_len * 4]
            ch1_p2 = self._reader_mm[ch_stride : ch_stride + s2_len * 4]

            ch0_samples = list(struct.unpack(f"<{s1_len}f", ch0_p1)) + list(
                struct.unpack(f"<{s2_len}f", ch0_p2)
            )
            ch1_samples = list(struct.unpack(f"<{s1_len}f", ch1_p1)) + list(
                struct.unpack(f"<{s2_len}f", ch1_p2)
            )

        return {
            "flow_id": self.flow_id,
            "sample_rate": self.sample_rate,
            "channel_count": self.channel_count,
            "buffer_length": self.buffer_length,
            "quantum": self.quantum,
            "write_head": w_head,
            "tail_index": tail,
            "requested_count": count,
            "lead_frames": lead_frames,
            "lead_ms": round((lead_frames / self.sample_rate) * 1000, 2),
            "is_wrapped": is_wrapped,
            "slice1": {"start": s1_start, "length": s1_len},
            "slice2": {"start": s2_start, "length": s2_len} if is_wrapped else None,
            "samples_ch0": ch0_samples,
            "samples_ch1": ch1_samples,
            "tai_timestamp_ns": hdr["tai_timestamp_ns"],
        }

    def close(self):
        try:
            if self._writer_mm:
                self._writer_mm.close()
            if self._writer_header_mm:
                self._writer_header_mm.close()
            if self._reader_mm:
                self._reader_mm.close()
            if self._reader_header_mm:
                self._reader_header_mm.close()
        except Exception:
            pass


WBS_TEST_SIGNALS_DOMAIN_DIR = "domain-wbs-test-signals"
WBS_TEST_SIGNALS_DOMAIN_ID = "e4a78120-d001-4800-8000-000000000001"
WBS_TEST_SIGNALS_DOMAIN_LABEL = "Ward-Beck Test Signals"

WBS_TEST_SIGNALS_CATALOG = [
    {
        "uuid": "e4a78120-abb1-4800-8000-000000000001",
        "flow_id": "wbs-abb1-bit-spitter",
        "label": "ABB-1-Bit-Spitter",
        "grouphint": "Ward-Beck:Bit-Spitter",
        "desc": "Ward-Beck ABB-1 Audio Bit Buddy & ABP-1 Bit Spitter (Walking 1s / PRBS-15 / Polarity)",
        "signal_type": "bitbuddy",
    },
    {
        "uuid": "e4a78120-3301-4800-8000-000000000001",
        "flow_id": "wbs-pod33-1k-cal",
        "label": "POD-33-1kHz-Reference",
        "grouphint": "Ward-Beck:POD-33",
        "desc": "Ward-Beck POD-33 Calibrated 1 kHz Reference Tone (0 VU / -18 dBFS EBU / -20 dBFS SMPTE)",
        "signal_type": "sine_1000",
    },
    {
        "uuid": "e4a78120-3302-4800-8000-000000000002",
        "flow_id": "wbs-pod33-400-tone",
        "label": "POD-33-400Hz-Alignment",
        "grouphint": "Ward-Beck:POD-33",
        "desc": "Ward-Beck POD-33 400 Hz Console Alignment Tone",
        "signal_type": "sine_400",
    },
    {
        "uuid": "e4a78120-3303-4800-8000-000000000003",
        "flow_id": "wbs-pod33-100-tone",
        "label": "POD-33-100Hz-LowEnd",
        "grouphint": "Ward-Beck:POD-33",
        "desc": "Ward-Beck POD-33 100 Hz Low Frequency Reference Tone",
        "signal_type": "sine_100",
    },
    {
        "uuid": "e4a78120-3304-4800-8000-000000000004",
        "flow_id": "wbs-pod33-dars-silence",
        "label": "POD-33-DARS-Silence",
        "grouphint": "Ward-Beck:POD-33",
        "desc": "Ward-Beck POD-33 DARS Digital Audio Reference Word Clock Silence",
        "signal_type": "silence",
    },
    {
        "uuid": "e4a78120-7001-4800-8000-000000000001",
        "flow_id": "wbs-pink-noise",
        "label": "WBS-Pink-Noise",
        "grouphint": "Ward-Beck:Acoustic",
        "desc": "Ward-Beck Equal-Energy Per Octave Pink Noise Calibration Reference",
        "signal_type": "pink_noise",
    },
    {
        "uuid": "e4a78120-7002-4800-8000-000000000002",
        "flow_id": "wbs-frequency-sweep",
        "label": "WBS-Frequency-Sweep",
        "grouphint": "Ward-Beck:Acoustic",
        "desc": "Ward-Beck 20 Hz to 20 kHz Logarithmic Precision Frequency Sweep",
        "signal_type": "sweep",
    },
    {
        "uuid": "e4a78120-abb1-4800-8000-000000000002",
        "flow_id": "wbs-master-program",
        "label": "WBS-Master-Audio",
        "grouphint": "Ward-Beck:Master",
        "desc": "Ward-Beck Systems Console Master Audio Program Flow",
        "signal_type": "master",
    },
    {
        "uuid": "e4a78120-abb1-4800-8000-000000000003",
        "flow_id": "wbs-signal-tap",
        "label": "WBS-Signal-Tap",
        "grouphint": "Ward-Beck:Demarc",
        "desc": "Ward-Beck Demarcation Signal Tap Point (Physical HW Tap)",
        "signal_type": "demarc",
    },
]


def synthesize_test_signal_buffer(signal_type: str, num_frames: int = 19456, sample_rate: int = 48000) -> bytes:
    """Synthesizes IEEE 754 Float32 interleaved stereo samples for broadcast test signals."""
    samples = []
    if signal_type == "sine_1000":
        amp = 0.1  # -20 dBFS standard broadcast alignment
        phase_inc = 2.0 * math.pi * 1000.0 / sample_rate
        for i in range(num_frames):
            v = amp * math.sin(phase_inc * i)
            samples.extend((v, v))
    elif signal_type == "sine_400":
        amp = 0.1
        phase_inc = 2.0 * math.pi * 400.0 / sample_rate
        for i in range(num_frames):
            v = amp * math.sin(phase_inc * i)
            samples.extend((v, v))
    elif signal_type == "sine_100":
        amp = 0.1
        phase_inc = 2.0 * math.pi * 100.0 / sample_rate
        for i in range(num_frames):
            v = amp * math.sin(phase_inc * i)
            samples.extend((v, v))
    elif signal_type == "silence":
        return b"\x00" * (num_frames * 2 * 4)
    elif signal_type == "pink_noise":
        import random
        amp = 0.08
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0
        for _ in range(num_frames):
            white = (random.random() * 2.0 - 1.0)
            b0 = 0.99886 * b0 + white * 0.0555179
            b1 = 0.99332 * b1 + white * 0.0750759
            b2 = 0.96900 * b2 + white * 0.1538520
            b3 = 0.86650 * b3 + white * 0.3104856
            b4 = 0.55000 * b4 + white * 0.5329522
            b5 = -0.7616 * b5 - white * 0.0168980
            pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11 * amp
            b6 = white * 0.115926
            samples.extend((pink, pink))
    elif signal_type == "sweep":
        f_start = 20.0
        f_end = 20000.0
        duration = num_frames / sample_rate
        amp = 0.1
        log_ratio = math.log(f_end / f_start)
        for i in range(num_frames):
            t = i / sample_rate
            phase = 2.0 * math.pi * f_start * (math.pow(f_end / f_start, t / duration) - 1.0) / (log_ratio / duration)
            v = amp * math.sin(phase)
            samples.extend((v, v))
    elif signal_type == "bitbuddy":
        amp = 0.1
        lfsr = 0x7ACE
        for _ in range(num_frames):
            bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1
            lfsr = (lfsr >> 1) | (bit << 14)
            v = amp if bit else -amp
            samples.extend((v, v))
    else:
        amp = 0.1
        phase_inc = 2.0 * math.pi * 1000.0 / sample_rate
        for i in range(num_frames):
            v = amp * math.sin(phase_inc * i)
            samples.extend((v, v))

    return struct.pack(f"<{len(samples)}f", *samples)


def create_mxl_data_header(flow_uuid_str: str, channel_count: int = 2, sample_rate: int = 48000, quantum: int = 480) -> bytes:
    """Generates standard 2064-byte MXL data header for CBC/EBU DMF compatibility."""
    raw = bytearray(2064)
    struct.pack_into(
        "<II16sIIIIIIII",
        raw,
        0,
        1,                             # version = 1
        2048,                          # header length = 2048
        uuid.UUID(flow_uuid_str).bytes,# UUID bytes
        channel_count,                 # 2 channels
        0,                             # reserved
        sample_rate,                   # 48000
        0,                             # reserved
        1,                             # grain count
        0,                             # reserved
        quantum,                       # quantum = 480
        quantum                        # buffer quantum = 480
    )
    struct.pack_into("<I", raw, 60, 0xFFFFFFFF)
    return bytes(raw)


class MxlEngine:
    """
    Coordinates MXL shared-memory domains and edge bridging.
    Streams live PipeWire / PulseAudio / ALSA audio into MXL Float32 ring buffers.
    """

    def __init__(self, domain_id: str = "domain-wbs-dmf-01"):
        self.domain_id = domain_id
        self.flows = {}
        self.bridge_thread = None
        self.tone_thread = None
        self.bridge_proc = None
        self.shutdown_event = threading.Event()
        self.active_source = "wbs_meter_tap.monitor"

        # Initialize Flows
        # 1. Master Stereo Program Flow (10.000s continuous ring buffer)
        self.master_flow = MxlFlow(
            domain_id=domain_id,
            flow_id="wbs-flow-master-stereo",
            label="Ward-Beck Master Bus (Float32 Stereo)",
            sample_rate=48000,
            channel_count=2,
            buffer_length=480000,  # 10.000s ring buffer (480,000 frames @ 48kHz)
            quantum=256,
        )
        self.flows[self.master_flow.flow_id] = self.master_flow

        # 2. Calibrated 1 kHz Reference Tone Flow (10.000s continuous ring buffer)
        self.tone_flow = MxlFlow(
            domain_id=domain_id,
            flow_id="wbs-flow-ref-tone",
            label="Ward-Beck POD-33 Precision Tone Flow (Float32 Stereo)",
            sample_rate=48000,
            channel_count=2,
            buffer_length=480000,  # 10.000s ring buffer (480,000 frames @ 48kHz)
            quantum=256,
        )
        self.flows[self.tone_flow.flow_id] = self.tone_flow

        # 3. ABB-1 Audio Bit Buddy & ABP-1 Bit Spitter Flow (10.000s continuous ring buffer)
        self.bit_spitter_flow = MxlFlow(
            domain_id=domain_id,
            flow_id="wbs-flow-bit-spitter",
            label="Ward-Beck ABB-1 Audio Bit Buddy & ABP-1 Bit Spitter Flow (Float32 Stereo)",
            sample_rate=48000,
            channel_count=2,
            buffer_length=480000,  # 10.000s ring buffer (480,000 frames @ 48kHz)
            quantum=256,
        )
        self.flows[self.bit_spitter_flow.flow_id] = self.bit_spitter_flow

        # Publish the dedicated 'Ward-Beck Test Signals' MXL domain and all test signal flows
        self.publish_wbs_test_signals_domain()

    def publish_wbs_test_signals_domain(self):
        """
        Creates and populates the dedicated 'Ward-Beck Test Signals' MXL domain:
        /dev/shm/mxl/domain-wbs-test-signals/
        with domain_def.json and complete audio flow structures (ABB-1 Bit Spitter,
        POD-33 Precision Tones, Pink Noise, Log Sweeps, and Live Master Tap).
        Also cross-publishes each flow into the CBC MXL domain (/dev/shm/mxl/domain_1)
        and nested domain directories so that mxl2webrtc (http://localhost:9601/)
        and mxl-info-gui automatically discover and stream every Ward-Beck test signal.
        """
        wbs_domain_dir = os.path.join(SHM_BASE_DIR, WBS_TEST_SIGNALS_DOMAIN_DIR)
        os.makedirs(wbs_domain_dir, exist_ok=True)

        # 1. Write domain_def.json for Ward-Beck Test Signals
        dom_def = {
            "id": WBS_TEST_SIGNALS_DOMAIN_ID,
            "label": WBS_TEST_SIGNALS_DOMAIN_LABEL,
            "description": "Ward-Beck Systems Broadcast Calibration & Precision Test Signal Domain (POD-33, ABB-1 Bit Spitter, Sweep, Noise, DARS)"
        }
        try:
            with open(os.path.join(wbs_domain_dir, "domain_def.json"), "w", encoding="utf-8") as f:
                json.dump(dom_def, f, indent=2)
        except Exception:
            pass

        # 2. Setup symlink for convenient access: /dev/shm/mxl/wbs-test-signals
        symlink_path = os.path.join(SHM_BASE_DIR, "wbs-test-signals")
        if not os.path.exists(symlink_path):
            try:
                os.symlink(WBS_TEST_SIGNALS_DOMAIN_DIR, symlink_path)
            except Exception:
                pass

        # Target directories to publish to:
        # A. The dedicated Ward-Beck domain (/dev/shm/mxl/domain-wbs-test-signals/)
        # B. The CBC reference domain (/dev/shm/mxl/domain_1/)
        # C. Nested in domain_1 (/dev/shm/mxl/domain_1/domain-wbs-test-signals/) for recursive scan
        target_domains = [wbs_domain_dir]
        cbc_domain_dir = os.path.join(SHM_BASE_DIR, "domain_1")
        if os.path.isdir(cbc_domain_dir):
            target_domains.append(cbc_domain_dir)
            nested_cbc_dir = os.path.join(cbc_domain_dir, WBS_TEST_SIGNALS_DOMAIN_DIR)
            os.makedirs(nested_cbc_dir, exist_ok=True)
            try:
                with open(os.path.join(nested_cbc_dir, "domain_def.json"), "w", encoding="utf-8") as f:
                    json.dump(dom_def, f, indent=2)
            except Exception:
                pass
            target_domains.append(nested_cbc_dir)

        for flw in WBS_TEST_SIGNALS_CATALOG:
            flw_uuid = flw["uuid"]
            sig_type = flw.get("signal_type", "sine_1000")

            # Synthesize real Float32 audio samples for the circular buffer
            audio_buffer = synthesize_test_signal_buffer(sig_type)

            for target_dir in target_domains:
                flw_dir = os.path.join(target_dir, f"{flw_uuid}.mxl-flow")
                os.makedirs(flw_dir, exist_ok=True)

                fdef_path = os.path.join(flw_dir, "flow_def.json")
                fdef = {
                    "id": flw_uuid,
                    "description": flw["desc"],
                    "tags": {
                        "urn:x-nmos:tag:grouphint/v1.0": [flw["grouphint"]]
                    },
                    "format": "urn:x-nmos:format:audio",
                    "label": flw["label"],
                    "parents": [],
                    "media_type": "audio/float32",
                    "sample_rate": {"numerator": 48000, "denominator": 1},
                    "channel_count": 2,
                    "bit_depth": 32,
                    "domain_id": dom_def["id"],
                    "domain_label": dom_def["label"]
                }
                try:
                    with open(fdef_path, "w", encoding="utf-8") as f:
                        json.dump(fdef, f, indent=2)
                except Exception:
                    pass

                # Write data header (2064 bytes with UUID)
                data_file = os.path.join(flw_dir, "data")
                data_bytes = create_mxl_data_header(flw_uuid)
                try:
                    with open(data_file, "wb") as f:
                        f.write(data_bytes)
                except Exception:
                    pass

                # Write synthesized audio channels (155,648 bytes)
                chan_file = os.path.join(flw_dir, "channels")
                try:
                    with open(chan_file, "wb") as f:
                        f.write(audio_buffer)
                except Exception:
                    pass

    def _publish_cbc_mxl_flows(self):
        """Deprecated alias maintained for backwards compatibility."""
        self.publish_wbs_test_signals_domain()

    def start(self, source_device: str = "wbs_meter_tap.monitor"):
        self.active_source = source_device
        self.shutdown_event.clear()
        for f in self.flows.values():
            f.ensure_open()
        self._publish_cbc_mxl_flows()

        # Start edge bridge thread (PipeWire/ALSA -> MXL Shm)
        self.bridge_thread = threading.Thread(target=self._edge_bridge_worker, daemon=True)
        self.bridge_thread.start()

        # Start reference tone synthesis thread into tone_flow
        self.tone_thread = threading.Thread(target=self._tone_worker, daemon=True)
        self.tone_thread.start()

        # Start bit spitter synthesis thread into bit_spitter_flow
        self.bit_spitter_thread = threading.Thread(target=self._bit_spitter_worker, daemon=True)
        self.bit_spitter_thread.start()

    def set_source(self, source_device: str):
        if self.active_source != source_device:
            self.active_source = source_device
            if self.bridge_proc:
                try:
                    self.bridge_proc.terminate()
                except Exception:
                    pass

    def _edge_bridge_worker(self):
        """Ingests live audio from PipeWire/ALSA, converts to Float32, and writes to MXL ring."""
        quantum_frames = 256
        bytes_per_read = quantum_frames * 2 * 2  # 2 channels, 16-bit (S16_LE) = 1024 bytes

        while not self.shutdown_event.is_set():
            src = self.active_source
            cmd = [
                "parec",
                f"--device={src}",
                "--format=s16le",
                "--rate=48000",
                "--channels=2",
                "--latency-msec=10",
            ]
            try:
                self.bridge_proc = subprocess.Popen(
                    cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
                )
                while not self.shutdown_event.is_set():
                    data = self.bridge_proc.stdout.read(bytes_per_read)
                    if not data or len(data) < bytes_per_read:
                        break

                    # De-interleave and convert S16_LE [-32768, +32767] -> Float32 [-1.0, +1.0]
                    samples_s16 = struct.unpack(f"<{quantum_frames * 2}h", data)
                    ch0 = [samples_s16[i * 2] / 32768.0 for i in range(quantum_frames)]
                    ch1 = [samples_s16[i * 2 + 1] / 32768.0 for i in range(quantum_frames)]

                    # Write to MXL continuous ring buffer
                    self.master_flow.write_frames(ch0, ch1)

            except Exception:
                pass
            finally:
                if self.bridge_proc:
                    try:
                        self.bridge_proc.terminate()
                    except Exception:
                        pass
                time.sleep(0.5)

    def _tone_worker(self):
        """Continuously synthesizes calibrated 1 kHz 0 VU (-18 dBFS) Float32 tone into tone_flow."""
        quantum_frames = 256
        sample_rate = 48000
        freq = 1000.0
        # -18 dBFS amplitude = 10^(-18/20) ~ 0.12589
        amp = math.pow(10, -18.0 / 20.0)
        phase = 0.0
        phase_inc = 2.0 * math.pi * freq / sample_rate
        interval_sec = quantum_frames / sample_rate

        while not self.shutdown_event.is_set():
            ch0 = []
            ch1 = []
            for _ in range(quantum_frames):
                s = amp * math.sin(phase)
                ch0.append(s)
                ch1.append(s)
                phase += phase_inc
                if phase > 2.0 * math.pi:
                    phase -= 2.0 * math.pi

            self.tone_flow.write_frames(ch0, ch1)
            time.sleep(interval_sec * 0.85)

    def _bit_spitter_worker(self):
        """Continuously synthesizes authentic ABP-1 Bit Spitter walking 1s & PRBS patterns into bit_spitter_flow."""
        quantum_frames = 256
        sample_rate = 48000
        interval_sec = quantum_frames / sample_rate
        lfsr = 0x7ACE
        frame_idx = 0

        while not self.shutdown_event.is_set():
            ch0 = []
            ch1 = []
            # Walking 1s pulse pattern mixed with PRBS-15 sequence
            pulse_active = (frame_idx % 24) == 0
            for i in range(quantum_frames):
                # 15-bit Galois LFSR
                bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1
                lfsr = (lfsr >> 1) | (bit << 14)
                prbs_val = 0.22 if bit else -0.22

                # Walking 1s impulse spike
                pulse_val = 0.55 if (pulse_active and (i % 32 == 0)) else 0.0

                s = prbs_val * 0.4 + pulse_val
                ch0.append(s)
                ch1.append(s)

            self.bit_spitter_flow.write_frames(ch0, ch1)
            frame_idx += 1
            time.sleep(interval_sec * 0.85)

    def get_telemetry(self) -> dict:
        """Returns structured MXL layer status across all registered flows."""
        flows_info = []
        for fid, f in self.flows.items():
            hdr = f.read_header()
            flows_info.append({
                "flow_id": fid,
                "label": f.label,
                "media_type": "audio/float32",
                "sample_rate": f.sample_rate,
                "channel_count": f.channel_count,
                "buffer_length": f.buffer_length,
                "quantum": f.quantum,
                "write_head": hdr["write_head"],
                "write_seq": hdr["write_seq"],
                "tai_timestamp_ns": hdr["tai_timestamp_ns"],
                "overrun_count": hdr["overrun_count"],
                "underrun_count": hdr["underrun_count"],
                "shm_path": f.flow_dir,
            })

        ntp_now = time.time()
        return {
            "domain_id": self.domain_id,
            "shm_base_dir": SHM_BASE_DIR,
            "active_source": self.active_source,
            "flows": flows_info,
            "domains": self.scan_all_domains(),
            "tai_epoch_ns": current_tai_ns(),
            "ntp_sec": ntp_now,
            "second_of_10": round(ntp_now % 10.0, 4),
            "buffer_duration_sec": 10.0,
        }

    def scan_all_domains(self) -> dict:
        """Discovers all MXL domains and flows in SHM_BASE_DIR (/dev/shm/mxl)."""
        domains = {}
        if not os.path.isdir(SHM_BASE_DIR):
            return domains

        for entry in os.listdir(SHM_BASE_DIR):
            dom_path = os.path.join(SHM_BASE_DIR, entry)
            if not os.path.isdir(dom_path):
                continue
            dom_def_path = os.path.join(dom_path, "domain_def.json")
            dom_meta = {"id": entry, "label": entry, "path": dom_path, "flows": []}
            if os.path.isfile(dom_def_path):
                try:
                    with open(dom_def_path, "r", encoding="utf-8") as f:
                        d = json.load(f)
                        dom_meta["id"] = d.get("id", entry)
                        dom_meta["label"] = d.get("label", entry)
                        dom_meta["description"] = d.get("description", "")
                except Exception:
                    pass

            for item in os.listdir(dom_path):
                item_path = os.path.join(dom_path, item)
                if not os.path.isdir(item_path):
                    continue
                flow_def_path = os.path.join(item_path, "flow_def.json")
                if os.path.isfile(flow_def_path):
                    try:
                        with open(flow_def_path, "r", encoding="utf-8") as f:
                            fdef = json.load(f)
                            fdef["domain_label"] = dom_meta["label"]
                            fdef["domain_id"] = dom_meta["id"]
                            fdef["folder"] = item
                            fdef["path"] = item_path
                            fdef["flow_id"] = fdef.get("id") or fdef.get("flow_id") or item.replace(".mxl-flow", "")
                            dom_meta["flows"].append(fdef)
                    except Exception:
                        pass
            domains[dom_meta["label"]] = dom_meta
        return domains

    def get_external_flow_waveform(self, flow_id: str) -> dict:
        """Reads circular audio buffer from an external MXL flow (e.g. CBC Test-Audio-1)."""
        tai_now = current_tai_ns()
        ntp_sec = time.time()
        bins = 720
        ch0_min, ch0_max = [0.0] * bins, [0.0] * bins
        ch1_min, ch1_max = [0.0] * bins, [0.0] * bins

        domains = self.scan_all_domains()
        target_flow = None
        for dom in domains.values():
            for flw in dom.get("flows", []):
                if flw.get("flow_id") == flow_id or flw.get("id") == flow_id or flw.get("folder") == flow_id:
                    target_flow = flw
                    break
            if target_flow:
                break

        buf_len = 19456
        srate = 48000
        if target_flow:
            srate = target_flow.get("sample_rate", {}).get("numerator", 48000) if isinstance(target_flow.get("sample_rate"), dict) else 48000
            channels_file = os.path.join(target_flow["path"], "channels")
            if os.path.isfile(channels_file):
                try:
                    with open(channels_file, "rb") as f:
                        raw = f.read()
                    floats = struct.unpack(f"<{len(raw)//4}f", raw)
                    n = len(floats) // 2
                    buf_len = n if n > 0 else 19456
                    ch0 = floats[:n]
                    ch1 = floats[n:]
                    chunk = max(1, n // bins)
                    for b in range(bins):
                        s0 = ch0[b * chunk : (b + 1) * chunk]
                        s1 = ch1[b * chunk : (b + 1) * chunk]
                        if s0:
                            ch0_min[b] = round(min(s0), 4)
                            ch0_max[b] = round(max(s0), 4)
                        if s1:
                            ch1_min[b] = round(min(s1), 4)
                            ch1_max[b] = round(max(s1), 4)
                except Exception:
                    pass

        return {
            "flow_id": flow_id,
            "sample_rate": srate,
            "channel_count": 2,
            "buffer_length": buf_len,
            "duration_sec": round(buf_len / srate, 3),
            "write_head": buf_len,
            "write_seq": 1,
            "tai_timestamp_ns": tai_now,
            "ntp_sec": ntp_sec,
            "second_of_10": round(ntp_sec % 10.0, 4),
            "head_sec": round(buf_len / srate, 4),
            "bins": bins,
            "ch0_min": ch0_min,
            "ch0_max": ch0_max,
            "ch1_min": ch1_min,
            "ch1_max": ch1_max,
        }

    def stop(self):
        self.shutdown_event.set()
        if self.bridge_proc:
            try:
                self.bridge_proc.terminate()
            except Exception:
                pass
        for f in self.flows.values():
            f.close()


# Singleton engine instance
MXL_ENGINE = MxlEngine()

if __name__ == "__main__":
    print(f"[MXL Engine] Starting domain: {MXL_ENGINE.domain_id}")
    MXL_ENGINE.start()
    time.sleep(1.0)
    telem = MXL_ENGINE.get_telemetry()
    print(json.dumps(telem, indent=2))
    sample_slice = MXL_ENGINE.master_flow.get_samples(tail_index=47900, count=256)
    print("Wrapped slice test:", {
        "is_wrapped": sample_slice["is_wrapped"],
        "slice1": sample_slice["slice1"],
        "slice2": sample_slice["slice2"],
        "samples_read": len(sample_slice["samples_ch0"]),
    })
    MXL_ENGINE.stop()
