import axios from 'axios'
import * as t from 'io-ts'

export const SpeedTestProgressTypeTR = t.union([
  t.literal('download'),
  t.literal('upload'),
  t.literal('latency'),
])

export const LatencyResultTR = t.type({
  latency: t.number,
  jitter: t.number,
  packetLoss: t.number,
})

export type SpeedTestProgressType = t.TypeOf<typeof SpeedTestProgressTypeTR>
export type LatencyResult = t.TypeOf<typeof LatencyResultTR>

interface SpeedTestProgress {
  type: SpeedTestProgressType
  progress: number
  currentSpeedMbps?: number
}

const DEFAULT_LATENCY_SAMPLES = 5
const DEFAULT_MIN_DURATION = 5_000
const DEFAULT_MAX_DURATION = 20_000
const DEFAULT_CHUNK_SIZE = 512 * 1024 // 512KB
const SAMPLE_INTERVAL_MS = 1_000

function calculateSpeedMbps (bytes: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  const bits = bytes * 8
  const seconds = durationMs / 1000
  return bits / seconds / 1_000_000
}

function calculateJitter (times: number[]): number {
  if (times.length <= 1) return 0

  let totalDiff = 0
  for (let i = 1; i < times.length; i += 1) {
    totalDiff += Math.abs(times[i] - times[i - 1])
  }
  return totalDiff / (times.length - 1)
}

interface MeasureLatencyOptions {
  samples: number
  progressType: SpeedTestProgressType
  pingFn: () => Promise<void>
  onProgress?: (progress: SpeedTestProgress) => void
}

async function measureLatency (options: MeasureLatencyOptions): Promise<LatencyResult> {
  const {
    samples, progressType, pingFn, onProgress,
  } = options
  const times: number[] = []
  let failures = 0

  for (let i = 0; i < samples; i += 1) {
    try {
      const start = performance.now()
      // eslint-disable-next-line no-await-in-loop
      await pingFn()
      times.push(performance.now() - start)
    } catch {
      failures += 1
    }

    onProgress?.({
      type: progressType,
      progress: ((i + 1) / samples) * 100,
    })
  }

  if (times.length === 0) {
    return { latency: Infinity, jitter: Infinity, packetLoss: 100 }
  }

  return {
    latency: times.reduce((a, b) => a + b, 0) / times.length,
    jitter: calculateJitter(times),
    packetLoss: (failures / samples) * 100,
  }
}

async function testLatency (
  samples: number = DEFAULT_LATENCY_SAMPLES,
  onProgress?: (progress: SpeedTestProgress) => void,
): Promise<LatencyResult> {
  const response = await axios.get<{ url: string }>(
    '/speed_test/ping_url',
    { withCredentials: true },
  )

  return measureLatency({
    samples,
    progressType: 'latency',
    onProgress,
    pingFn: async () => {
      await axios.head(response.data.url, {
        headers: { 'Cache-Control': 'no-store' },
      })
    },
  })
}

export function formatSpeed (speedMbps: number): string {
  if (speedMbps >= 1000) {
    return `${(speedMbps / 1000).toFixed(2)} Gbps`
  }
  return `${speedMbps.toFixed(2)} Mbps`
}

export const TimedTestProgressTR = t.intersection([
  t.type({
    type: SpeedTestProgressTypeTR,
    elapsedSeconds: t.number,
    currentSpeedMbps: t.number,
    averageSpeedMbps: t.number,
    isStable: t.boolean,
  }),
  t.partial({
    stableForSeconds: t.number,
  }),
])

export const TimedSpeedTestResultTR = t.type({
  downloadSpeedMbps: t.number,
  uploadSpeedMbps: t.number,
  latency: LatencyResultTR,
  stable: t.boolean,
  durationSeconds: t.number,
})

export type TimedTestProgress = t.TypeOf<typeof TimedTestProgressTR>
export type TimedSpeedTestResult = t.TypeOf<typeof TimedSpeedTestResultTR>

export interface TimedTestOptions {
  minDuration?: number
  maxDuration?: number
  chunkSize?: number
  minimumDownloadSpeedMbps?: number
  minimumUploadSpeedMbps?: number
  stabilityDuration?: number
  onProgress?: (progress: TimedTestProgress) => void
  abortSignal?: AbortSignal
}

interface SpeedSample {
  timestamp: number
  bytesTransferred: number
}

// Calculates the overall average speed across the entire test duration.
// Uses cumulative bytes: samples are recorded every second with a running total,
// so last.bytesTransferred is always >= first.bytesTransferred.
// By dividing total bytes by total time, this gives a single smoothed average
// rather than the mean of individual per-second speeds.
function calculateAverageSpeed (samples: SpeedSample[]): number {
  if (samples.length < 2) return 0

  const first = samples[0]
  const last = samples[samples.length - 1]
  const totalBytes = last.bytesTransferred - first.bytesTransferred
  const totalMs = last.timestamp - first.timestamp

  return calculateSpeedMbps(totalBytes, totalMs)
}

// Calculates the speed over the most recent 1-second interval
// to give a responsive, real-time speed indicator.
function calculateRecentSpeed (samples: SpeedSample[]): number {
  if (samples.length < 2) return 0

  const recent = samples.slice(-2)
  const bytes = recent[1].bytesTransferred - recent[0].bytesTransferred
  const ms = recent[1].timestamp - recent[0].timestamp

  return calculateSpeedMbps(bytes, ms)
}

function checkStability (
  samples: SpeedSample[],
  minimumSpeedMbps: number,
  stabilityDuration: number,
): { isStable: boolean; stableForSeconds: number } {
  if (samples.length < stabilityDuration + 1) {
    return { isStable: false, stableForSeconds: 0 }
  }

  let stableCount = 0
  const recentSamples = samples.slice(-(stabilityDuration + 1))

  for (let i = 1; i < recentSamples.length; i += 1) {
    const bytes = recentSamples[i].bytesTransferred - recentSamples[i - 1].bytesTransferred
    const ms = recentSamples[i].timestamp - recentSamples[i - 1].timestamp
    const speedMbps = calculateSpeedMbps(bytes, ms)

    if (speedMbps >= minimumSpeedMbps) {
      stableCount += 1
    } else {
      stableCount = 0
    }
  }

  return {
    isStable: stableCount >= stabilityDuration,
    stableForSeconds: stableCount,
  }
}

export async function runTimedDownloadTest (options: TimedTestOptions = {}): Promise<{
  speedMbps: number
  stable: boolean
  durationSeconds: number
}> {
  const {
    minDuration = DEFAULT_MIN_DURATION,
    maxDuration = DEFAULT_MAX_DURATION,
    chunkSize = DEFAULT_CHUNK_SIZE,
    minimumDownloadSpeedMbps = 0,
    stabilityDuration = 5,
    onProgress,
    abortSignal,
  } = options

  const urlResponse = await axios.get<{ url: string; size: number }>(
    `/speed_test/download_url?size=${chunkSize}`,
    { withCredentials: true },
  )

  const samples: SpeedSample[] = []
  let totalBytes = 0
  const startTime = performance.now()

  samples.push({ timestamp: startTime, bytesTransferred: 0 })

  let lastSampleTime = startTime

  while (performance.now() - startTime < maxDuration) {
    if (abortSignal?.aborted) break

    // eslint-disable-next-line no-await-in-loop
    const response = await axios({
      method: 'GET',
      url: urlResponse.data.url,
      responseType: 'arraybuffer',
      timeout: maxDuration,
      adapter: 'fetch',
      fetchOptions: { cache: 'no-store' },
    })

    totalBytes += response.data.byteLength || chunkSize
    const now = performance.now()

    if (now - lastSampleTime >= SAMPLE_INTERVAL_MS) {
      samples.push({ timestamp: now, bytesTransferred: totalBytes })
      lastSampleTime = now

      const elapsedSeconds = Math.floor((now - startTime) / 1000)
      const currentSpeedMbps = calculateRecentSpeed(samples)
      const averageSpeedMbps = calculateAverageSpeed(samples)
      const stability = checkStability(samples, minimumDownloadSpeedMbps, stabilityDuration)

      onProgress?.({
        type: 'download',
        elapsedSeconds,
        currentSpeedMbps,
        averageSpeedMbps,
        isStable: stability.isStable,
        stableForSeconds: stability.stableForSeconds,
      })

      const pastMinDuration = now - startTime >= minDuration
      if (pastMinDuration && stability.isStable) break
    }
  }

  const totalDuration = performance.now() - startTime
  const averageSpeed = calculateAverageSpeed(samples)
  const stability = checkStability(samples, minimumDownloadSpeedMbps, stabilityDuration)

  return {
    speedMbps: averageSpeed,
    stable: stability.isStable,
    durationSeconds: totalDuration / 1000,
  }
}

export async function runTimedUploadTest (options: TimedTestOptions = {}): Promise<{
  speedMbps: number
  stable: boolean
  durationSeconds: number
}> {
  const {
    minDuration = DEFAULT_MIN_DURATION,
    maxDuration = DEFAULT_MAX_DURATION,
    chunkSize = DEFAULT_CHUNK_SIZE,
    minimumUploadSpeedMbps = 0,
    stabilityDuration = 5,
    onProgress,
    abortSignal,
  } = options

  const urlResponse = await axios.get<{ url: string }>(
    '/speed_test/upload_url',
    { withCredentials: true },
  )

  const uploadData = new Blob([new ArrayBuffer(chunkSize)])
  const samples: SpeedSample[] = []
  let totalBytes = 0
  const startTime = performance.now()

  samples.push({ timestamp: startTime, bytesTransferred: 0 })

  let lastSampleTime = startTime

  while (performance.now() - startTime < maxDuration) {
    if (abortSignal?.aborted) break

    // eslint-disable-next-line no-await-in-loop
    await axios({
      method: 'PUT',
      url: urlResponse.data.url,
      data: uploadData,
      headers: { 'Content-Type': 'application/octet-stream' },
      timeout: maxDuration,
    })

    totalBytes += chunkSize
    const now = performance.now()

    if (now - lastSampleTime >= SAMPLE_INTERVAL_MS) {
      samples.push({ timestamp: now, bytesTransferred: totalBytes })
      lastSampleTime = now

      const elapsedSeconds = Math.floor((now - startTime) / 1000)
      const currentSpeedMbps = calculateRecentSpeed(samples)
      const averageSpeedMbps = calculateAverageSpeed(samples)
      const stability = checkStability(samples, minimumUploadSpeedMbps, stabilityDuration)

      onProgress?.({
        type: 'upload',
        elapsedSeconds,
        currentSpeedMbps,
        averageSpeedMbps,
        isStable: stability.isStable,
        stableForSeconds: stability.stableForSeconds,
      })

      const pastMinDuration = now - startTime >= minDuration
      if (pastMinDuration && stability.isStable) break
    }
  }

  const totalDuration = performance.now() - startTime
  const averageSpeed = calculateAverageSpeed(samples)
  const stability = checkStability(samples, minimumUploadSpeedMbps, stabilityDuration)

  return {
    speedMbps: averageSpeed,
    stable: stability.isStable,
    durationSeconds: totalDuration / 1000,
  }
}

export async function runTimedSpeedTest (options: TimedTestOptions = {}): Promise<TimedSpeedTestResult> {
  const latencyResult = await testLatency(DEFAULT_LATENCY_SAMPLES, (progress) => {
    options.onProgress?.({
      elapsedSeconds: 0,
      currentSpeedMbps: 0,
      averageSpeedMbps: 0,
      isStable: true,
      ...progress,
    })
  })

  const downloadResult = await runTimedDownloadTest(options)

  const uploadResult = await runTimedUploadTest(options)

  const totalDuration = downloadResult.durationSeconds + uploadResult.durationSeconds

  return {
    downloadSpeedMbps: downloadResult.speedMbps,
    uploadSpeedMbps: uploadResult.speedMbps,
    latency: latencyResult,
    stable: downloadResult.stable && uploadResult.stable,
    durationSeconds: totalDuration,
  }
}
