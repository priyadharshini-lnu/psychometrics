import axios, { AxiosProgressEvent } from 'axios'
import * as t from 'io-ts'

export const SpeedTestProgressTypeTR = t.union([
  t.literal('download'),
  t.literal('upload'),
  t.literal('latency'),
])

export const SpeedTestProgressTR = t.intersection([
  t.type({
    type: SpeedTestProgressTypeTR,
    progress: t.number,
  }),
  t.partial({
    currentSpeedMbps: t.number,
  }),
])

export const LatencyResultTR = t.type({
  latency: t.number,
  jitter: t.number,
  packetLoss: t.number,
})

export const SpeedTestResultTR = t.type({
  downloadSpeedMbps: t.number,
  uploadSpeedMbps: t.number,
  latency: LatencyResultTR,
})

export type SpeedTestProgressType = t.TypeOf<typeof SpeedTestProgressTypeTR>
export type SpeedTestProgress = t.TypeOf<typeof SpeedTestProgressTR>
export type LatencyResult = t.TypeOf<typeof LatencyResultTR>
export type SpeedTestResult = t.TypeOf<typeof SpeedTestResultTR>

export interface SpeedTestOptions {
  testFileSize?: number
  latencySamples?: number
  timeout?: number
  onProgress?: (progress: SpeedTestProgress) => void
}

const DEFAULT_TEST_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_LATENCY_SAMPLES = 5
const DEFAULT_TIMEOUT = 120000 // 120 seconds

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

function handleProgress (
  event: AxiosProgressEvent,
  progressType: SpeedTestProgressType,
  startTime: number,
  onProgress?: (progress: SpeedTestProgress) => void,
): void {
  if (event.total) {
    onProgress?.({
      type: progressType,
      progress: (event.loaded / event.total) * 100,
      currentSpeedMbps: calculateSpeedMbps(event.loaded, performance.now() - startTime),
    })
  }
}

interface DownloadSpeedOptions {
  url: string
  expectedSize: number
  progressType: SpeedTestProgressType
  timeout: number
  withCredentials?: boolean
  onProgress?: (progress: SpeedTestProgress) => void
}

async function measureDownloadSpeed (options: DownloadSpeedOptions): Promise<number> {
  const {
    url, expectedSize, progressType, timeout, withCredentials = false, onProgress,
  } = options

  const startTime = performance.now()

  const response = await axios({
    method: 'GET',
    url,
    timeout,
    withCredentials,
    responseType: 'arraybuffer',
    onDownloadProgress: event => handleProgress(event, progressType, startTime, onProgress),
  })

  const receivedBytes = response.data.byteLength || expectedSize
  return calculateSpeedMbps(receivedBytes, performance.now() - startTime)
}

interface UploadSpeedOptions {
  url: string
  method: 'POST' | 'PUT'
  data: Blob
  progressType: SpeedTestProgressType
  timeout: number
  onProgress?: (progress: SpeedTestProgress) => void
}

async function measureUploadSpeed (options: UploadSpeedOptions): Promise<number> {
  const {
    url, method, data, progressType, timeout, onProgress,
  } = options

  const startTime = performance.now()

  await axios({
    method,
    url,
    data,
    timeout,
    headers: { 'Content-Type': 'application/octet-stream' },
    onUploadProgress: event => handleProgress(event, progressType, startTime, onProgress),
  })

  return calculateSpeedMbps(data.size, performance.now() - startTime)
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

export async function testDownloadSpeed (
  size: number = DEFAULT_TEST_SIZE,
  onProgress?: (progress: SpeedTestProgress) => void,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<number> {
  const response = await axios.get<{ url: string; size: number }>(
    `/speed_test/download_url?size=${size}`,
    { withCredentials: true },
  )

  return measureDownloadSpeed({
    url: response.data.url,
    expectedSize: response.data.size,
    progressType: 'download',
    timeout,
    onProgress,
  })
}

export async function testUploadSpeed (
  size: number = DEFAULT_TEST_SIZE,
  onProgress?: (progress: SpeedTestProgress) => void,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<number> {
  const response = await axios.get<{ url: string }>(
    '/speed_test/upload_url',
    { withCredentials: true },
  )

  return measureUploadSpeed({
    url: response.data.url,
    method: 'PUT',
    data: new Blob([new ArrayBuffer(size)]),
    progressType: 'upload',
    timeout,
    onProgress,
  })
}

export async function testLatency (
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

export async function runComprehensiveSpeedTest (
  options: SpeedTestOptions = {},
): Promise<SpeedTestResult> {
  const {
    testFileSize = DEFAULT_TEST_SIZE,
    latencySamples = DEFAULT_LATENCY_SAMPLES,
    onProgress,
  } = options

  const downloadSpeed = await testDownloadSpeed(testFileSize, onProgress)
  const uploadSpeed = await testUploadSpeed(testFileSize, onProgress)
  const latencyResult = await testLatency(latencySamples, onProgress)

  return {
    downloadSpeedMbps: downloadSpeed,
    uploadSpeedMbps: uploadSpeed,
    latency: latencyResult,
  }
}

export function formatSpeed (speedMbps: number): string {
  if (speedMbps >= 1000) {
    return `${(speedMbps / 1000).toFixed(2)} Gbps`
  }
  return `${speedMbps.toFixed(2)} Mbps`
}
