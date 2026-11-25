/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
// Pre-allocated static buffers in linear memory (shared with JS).
import { MAX_BUFFER_SIZE } from "./constants";

// Pre-allocated static input buffers in linear memory
export const inputBufferL: StaticArray<f32> = new StaticArray<f32>(MAX_BUFFER_SIZE);
export const inputBufferR: StaticArray<f32> = new StaticArray<f32>(MAX_BUFFER_SIZE);

// Pre-allocated output telemetry buffer (20 floats)
export const outputTelemetry: StaticArray<f32> = new StaticArray<f32>(20);
