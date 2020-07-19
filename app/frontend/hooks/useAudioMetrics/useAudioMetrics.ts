import React, { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import Core from 'modules/survey/components/AudioRecorder/Recorder/Core.ts'
import { RECORDER_STATES } from 'modules/survey/components/AudioRecorder/constants'
import { AudioLevel, State, StateFunctions } from './interfaces'

const DEFAULT_AUDIO_PULSE = 0.7

// Time in mile second after which pulse sample would be checked to turn audio level from high to low
export const AUDIO_LEVEL_CHANGE_TO_LOW_THRESHOLD = 500

// Pulse threshold which are considered high
export const HIGH_PULSE_THRESHOLD = 0.80

// Percent of pulse which are sampled, that should be higher then this threshold to consider audio level to change
export const PERCENT_OF_HIGH_PULSE_THRESHOLD = 80

export default function useAudioMetrics (recorder: React.MutableRefObject<Core | undefined>): [State, StateFunctions] {
  const [level, setLevel] = useState(AudioLevel.Low)
  const [pulse, setPulse] = useState(DEFAULT_AUDIO_PULSE)
  const lastAudiDetectorColorChangeRef = useRef<number>()
  const animationFrames: Array<number> = []
  const batchPulsesRef = useRef<Array<number>>([])

  useEffect(() => {
    changeAudioLevel()
  }, [pulse])


  const changeAudioLevel = () => {
    if (!lastAudiDetectorColorChangeRef.current) {
      lastAudiDetectorColorChangeRef.current = performance.now()
      return
    }

    // If audio is low it can immediately change to high.
    //  To change from high to low it will wait for time specified by AUDIO_LEVEL_CHANGE_TO_LOW_THRESHOLD
    if ((level === AudioLevel.Low && batchPulsesRef.current.length)
      || (performance.now() - lastAudiDetectorColorChangeRef.current) > AUDIO_LEVEL_CHANGE_TO_LOW_THRESHOLD) {
      const totalPulse = batchPulsesRef.current.length
      const pulseWithHighThreshold = _.filter(batchPulsesRef.current,
        (pulse: number) => pulse > HIGH_PULSE_THRESHOLD).length
      const percentOfHighPulse = (pulseWithHighThreshold / totalPulse) * 100
      setLevel(percentOfHighPulse > PERCENT_OF_HIGH_PULSE_THRESHOLD ? AudioLevel.High : AudioLevel.Low)
      lastAudiDetectorColorChangeRef.current = performance.now()
      batchPulsesRef.current = []
    } else {
      batchPulsesRef.current = batchPulsesRef.current.concat(pulse)
    }
  }

  const updatePulse = (): void => {
    if (recorder.current?.state !== RECORDER_STATES.RECORDING) {
      animationFrames.forEach(window.cancelAnimationFrame)

      return
    }

    if (recorder.current) {
      setPulse(recorder.current.getAudioPulse())
    }

    setTimeout(() => {
      animationFrames.push(window.requestAnimationFrame(updatePulse))
    }, 10)
  }

  const resetMetrics = (): void => {
    setLevel(AudioLevel.Low)
    setPulse(DEFAULT_AUDIO_PULSE)
  }

  return [{ level, pulse }, {
    setLevel, setPulse, updatePulse, resetMetrics,
  }]
}
