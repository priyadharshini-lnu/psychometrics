import {
  useState, useCallback, useRef, useEffect,
} from 'react'
import * as t from 'io-ts'

import type { TimedTestProgress, TimedSpeedTestResult } from '~/utils/speedTest'
import { SpeedTestProgressTypeTR, runTimedSpeedTest, formatSpeed } from '~/utils/speedTest'

export const NetworkTestStatusTR = t.union([
  t.literal('idle'),
  t.literal('testing'),
  t.literal('completed'),
  t.literal('error'),
])

export const TestTypeTR = SpeedTestProgressTypeTR

export type NetworkTestStatus = t.TypeOf<typeof NetworkTestStatusTR>
export type TestType = t.TypeOf<typeof TestTypeTR>

export interface TimedTestThresholds {
  minimumDownloadSpeedMbps: number
  minimumUploadSpeedMbps: number
  stabilityDuration?: number
  minDuration?: number
  maxDuration?: number
}

export interface TimedNetworkTestState {
  status: NetworkTestStatus
  currentTest: TestType | null
  progress: number
  currentSpeedMbps: number | null
  error: unknown | null
  averageSpeedMbps: number | null
  isStable: boolean
  elapsedSeconds: number
  timedResult: TimedSpeedTestResult | null
}

const INITIAL_STATE: TimedNetworkTestState = {
  status: 'idle',
  currentTest: null,
  progress: 0,
  currentSpeedMbps: null,
  error: null,
  averageSpeedMbps: null,
  isStable: false,
  elapsedSeconds: 0,
  timedResult: null,
}

export function useNetworkTest () {
  const [state, setState] = useState<TimedNetworkTestState>(INITIAL_STATE)
  const isTestingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const testStartTimeRef = useRef<number | null>(null)
  const currentPhaseRef = useRef<TestType | null>(null)

  const updateState = useCallback((updates: Partial<TimedNetworkTestState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    testStartTimeRef.current = null
    currentPhaseRef.current = null
  }, [])

  const startTimer = useCallback(() => {
    testStartTimeRef.current = Date.now()
    updateState({ elapsedSeconds: 0 })
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        if (testStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - testStartTimeRef.current) / 1000)
          updateState({ elapsedSeconds: elapsed })
        }
      }, 1000)
    }
  }, [updateState])

  useEffect(() => stopTimer, [stopTimer])

  const cleanupAndResetState = useCallback(() => {
    stopTimer()
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setState(INITIAL_STATE)
  }, [stopTimer])

  const reset = useCallback(() => {
    if (!isTestingRef.current) {
      cleanupAndResetState()
    }
  }, [cleanupAndResetState])

  const abort = useCallback(() => {
    cleanupAndResetState()
  }, [cleanupAndResetState])

  const runTimedTest = useCallback(async ({
    minimumDownloadSpeedMbps,
    minimumUploadSpeedMbps,
    stabilityDuration = 5,
    minDuration,
    maxDuration,
  }: TimedTestThresholds): Promise<TimedSpeedTestResult | null> => {
    if (isTestingRef.current) return null

    isTestingRef.current = true
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    updateState({
      status: 'testing', error: null, timedResult: null,
    })

    const handleTimedProgress = ({
      type, currentSpeedMbps, averageSpeedMbps, isStable,
    }: TimedTestProgress) => {
      if (type !== currentPhaseRef.current) {
        currentPhaseRef.current = type
        startTimer()
      }
      updateState({
        currentTest: type,
        currentSpeedMbps,
        averageSpeedMbps,
        isStable,
      })
    }

    try {
      const result = await runTimedSpeedTest({
        minimumDownloadSpeedMbps,
        minimumUploadSpeedMbps,
        stabilityDuration,
        minDuration,
        maxDuration,
        onProgress: handleTimedProgress,
        abortSignal: abortController.signal,
      })

      updateState({
        status: 'completed',
        currentTest: null,
        progress: 100,
        timedResult: result,
        isStable: result.stable,
      })
      return result
    } catch (err) {
      if (!abortController.signal.aborted) {
        updateState({ status: 'error', currentTest: null, error: err as Error })
      }
      return null
    } finally {
      stopTimer()
      isTestingRef.current = false
      abortControllerRef.current = null
    }
  }, [updateState, startTimer, stopTimer])

  return {
    state,
    isRunning: state.status === 'testing',
    runTimedTest,
    reset,
    formatSpeed,
    abort,
  }
}
