import { useState, useCallback, useRef } from 'react'
import * as t from 'io-ts'

import type { SpeedTestResult, SpeedTestProgress, LatencyResult } from '~/utils/speedTest'
import {
  SpeedTestResultTR,
  SpeedTestProgressTypeTR,
  testRailsDownloadSpeed,
  testRailsUploadSpeed,
  testRailsLatency,
  testS3DownloadSpeed,
  testS3UploadSpeed,
  testS3Latency,
  runComprehensiveSpeedTest,
  formatSpeed,
} from '~/utils/speedTest'

export const NetworkTestStatusTR = t.union([
  t.literal('idle'),
  t.literal('testing'),
  t.literal('completed'),
  t.literal('error'),
])

export const TestTypeTR = SpeedTestProgressTypeTR

export const NetworkTestStateTR = t.type({
  status: NetworkTestStatusTR,
  currentTest: t.union([TestTypeTR, t.null]),
  progress: t.number,
  currentSpeedMbps: t.union([t.number, t.null]),
  result: t.union([SpeedTestResultTR, t.null]),
  error: t.union([t.unknown, t.null]),
})

export const UseNetworkTestOptionsTR = t.partial({
  testFileSize: t.number,
  latencySamples: t.number,
})

export type NetworkTestStatus = t.TypeOf<typeof NetworkTestStatusTR>
export type TestType = t.TypeOf<typeof TestTypeTR>
export type NetworkTestState = t.TypeOf<typeof NetworkTestStateTR>
export type UseNetworkTestOptions = t.TypeOf<typeof UseNetworkTestOptionsTR>

const INITIAL_STATE: NetworkTestState = {
  status: 'idle',
  currentTest: null,
  progress: 0,
  currentSpeedMbps: null,
  result: null,
  error: null,
}

export function useNetworkTest (options: UseNetworkTestOptions = {}) {
  const { testFileSize = 5 * 1024 * 1024, latencySamples = 5 } = options

  const [state, setState] = useState<NetworkTestState>(INITIAL_STATE)
  const isTestingRef = useRef(false)

  const updateState = useCallback((updates: Partial<NetworkTestState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const handleProgress = useCallback((progress: SpeedTestProgress) => {
    updateState({
      currentTest: progress.type,
      progress: progress.progress,
      currentSpeedMbps: progress.currentSpeedMbps ?? null,
    })
  }, [updateState])

  const runSingleTest = useCallback(async <T extends number | LatencyResult>(
    testType: TestType,
  ): Promise<T | null> => {
    if (isTestingRef.current) return null

    const testFunctions: Record<TestType, () => Promise<number | LatencyResult>> = {
      rails_download: () => testRailsDownloadSpeed(testFileSize, handleProgress),
      rails_upload: () => testRailsUploadSpeed(testFileSize, handleProgress),
      rails_latency: () => testRailsLatency(latencySamples, handleProgress),
      s3_download: () => testS3DownloadSpeed(testFileSize, handleProgress),
      s3_upload: () => testS3UploadSpeed(testFileSize, handleProgress),
      s3_latency: () => testS3Latency(latencySamples, handleProgress),
    }

    isTestingRef.current = true
    updateState({ status: 'testing', currentTest: testType, error: null })

    try {
      const result = await testFunctions[testType]() as T
      updateState({ currentTest: null, progress: 100 })
      return result
    } catch (err) {
      updateState({ status: 'error', error: err as Error })
      return null
    } finally {
      isTestingRef.current = false
    }
  }, [testFileSize, latencySamples, handleProgress, updateState])

  const runRailsDownloadTest = useCallback(
    () => runSingleTest<number>('rails_download'),
    [runSingleTest],
  )

  const runRailsUploadTest = useCallback(
    () => runSingleTest<number>('rails_upload'),
    [runSingleTest],
  )

  const runRailsLatencyTest = useCallback(
    () => runSingleTest<LatencyResult>('rails_latency'),
    [runSingleTest],
  )

  const runS3DownloadTest = useCallback(
    () => runSingleTest<number>('s3_download'),
    [runSingleTest],
  )

  const runS3UploadTest = useCallback(
    () => runSingleTest<number>('s3_upload'),
    [runSingleTest],
  )

  const runS3LatencyTest = useCallback(
    () => runSingleTest<LatencyResult>('s3_latency'),
    [runSingleTest],
  )

  const runFullTest = useCallback(async (): Promise<SpeedTestResult | null> => {
    if (isTestingRef.current) return null

    isTestingRef.current = true
    updateState({ status: 'testing', error: null, result: null })

    try {
      const result = await runComprehensiveSpeedTest({
        testFileSize,
        latencySamples,
        onProgress: handleProgress,
      })

      updateState({
        status: 'completed', currentTest: null, progress: 100, result,
      })
      return result
    } catch (err) {
      updateState({ status: 'error', currentTest: null, error: err as Error })
      return null
    } finally {
      isTestingRef.current = false
    }
  }, [testFileSize, latencySamples, handleProgress, updateState])

  const reset = useCallback(() => {
    if (!isTestingRef.current) {
      setState(INITIAL_STATE)
    }
  }, [])

  return {
    state,
    isRunning: state.status === 'testing',
    runTest: runFullTest,
    runRailsDownloadTest,
    runRailsUploadTest,
    runRailsLatencyTest,
    runS3DownloadTest,
    runS3UploadTest,
    runS3LatencyTest,
    reset,
    formatSpeed,
  }
}
