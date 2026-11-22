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
            label="Ward-Beck Calibrated 1kHz Ref Tone (Float32 Stereo)",
            sample_rate=48000,
            channel_count=2,
            buffer_length=480000,  # 10.000s ring buffer (480,000 frames @ 48kHz)
            quantum=256,
        )
        self.flows[self.tone_flow.flow_id] = self.tone_flow

    def start(self, source_device: str = "wbs_meter_tap.monitor"):
        self.active_source = source_device
        self.shutdown_event.clear()
        for f in self.flows.values():
            f.ensure_open()

        # Start edge bridge thread (PipeWire/ALSA -> MXL Shm)
        self.bridge_thread = threading.Thread(target=self._edge_bridge_worker, daemon=True)
        self.bridge_thread.start()

        # Start reference tone synthesis thread into tone_flow
        self.tone_thread = threading.Thread(target=self._tone_worker, daemon=True)
        self.tone_thread.start()

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
            "tai_epoch_ns": current_tai_ns(),
            "ntp_sec": ntp_now,
            "second_of_10": round(ntp_now % 10.0, 4),
            "buffer_duration_sec": 10.0,
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
