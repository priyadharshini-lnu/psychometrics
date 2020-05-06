import React, {
  useReducer, useEffect, useRef, useState,
} from 'react'
import cs from 'classnames'
import _ from 'lodash'
import { getMinutesAndSeconds } from 'utils/time'
import api from 'middleware/api'
import styles from './AudioRecorderStyle.scss'
import {
  RECORDER_STATES, UPLOAD_STATES, PLAYER_STATE, DEFAULT_MAX_DURATION, AUDIO_LEVEL_CHANGE_TO_LOW_THRESOLD,
  AUDIO_LEVEL, HIGH_PULSE_THRESOLD, PERCENT_OF_HIGH_PULSE_THRESOLD,
} from './constants'
import RecorderCore from './Recorder/Core'
import reducer, {
  initialState, setRecordingState, setUploadState, setFile, setAudioPulse, setPlayerState, removeFile,
  setRecordingTime, removeRecording,
} from './reducer'
import FileUploader from '../FileUpload/components/FileUploader'
import Permission from './Permission'
import AudioPlayer from './AudioPlayer/index'
import RedMicrophone from './images/red-microphone.png'
import GreenMicrophone from './images/green-microphone.png'
import RecorderControl from './Recorder/RecorderControl'
import PlayerControl from './AudioPlayer/PlayerControl'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { $ } = window as any

interface Props {
  mediaUrl: string
  model: Model
  fakeUpload: boolean
  onSuccessUpload(): void
  onRecordingDiscard(): void
  readOnly?: boolean
}

interface Model {
  id: number
  props: ModelProp
  result: ModelResult
}

interface ModelProp {
  duration: number | null
}

interface ModelResult {
  answers: Array<Answer>
}

interface Answer {
  media_id: number
  value: string
}

const AudioRecorder: React.FC<Props> = ({
  mediaUrl,
  model,
  model: { result },
  fakeUpload,
  onSuccessUpload,
  onRecordingDiscard,
  readOnly,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [audioLevel, setAudioLevel] = useState(AUDIO_LEVEL.LOW)
  const updateAudioPulseRef = useRef<() => void>()
  const recorderRef = useRef<RecorderCore>()
  const lastAudiDetectorColorChangeRef = useRef<number>()
  const batchPulsesRef = useRef<Array<number>>([])
  const maxDuration = model.props.duration || DEFAULT_MAX_DURATION

  useEffect(() => {
    updateAudioPulseRef.current = updateAudioPulse
  })

  useEffect(() => {
    if (result && result.answers.length) {
      dispatch(setRecordingState(RECORDER_STATES.RECORDED))
      dispatch(setUploadState(UPLOAD_STATES.SAVED))
    } else {
      initRecorder()
    }
  }, [result])

  useEffect(() => {
    changeAudioLevel()
  }, [state.audioPulse])

  const animationFrames: Array<number> = []

  const initRecorder = (): void => {
    recorderRef.current = new RecorderCore({ onUpdateRecordTime: updateRecordTime })
  }

  const changeAudioLevel = () => {
    if (!lastAudiDetectorColorChangeRef.current) {
      lastAudiDetectorColorChangeRef.current = performance.now()
      return
    }

    // If audio is low it can immediately change to high.
    //  To change from high to low it will wait for time specified by AUDIO_LEVEL_CHANGE_TO_LOW_THRESOLD
    if ((audioLevel === AUDIO_LEVEL.LOW && batchPulsesRef.current.length)
      || (performance.now() - lastAudiDetectorColorChangeRef.current) > AUDIO_LEVEL_CHANGE_TO_LOW_THRESOLD) {
      const totalPulse = batchPulsesRef.current.length
      const pulseWithHighThresold = _.filter(batchPulsesRef.current,
        (pulse: number) => pulse > HIGH_PULSE_THRESOLD).length
      const percentOfHighPulse = (pulseWithHighThresold / totalPulse) * 100
      setAudioLevel(percentOfHighPulse > PERCENT_OF_HIGH_PULSE_THRESOLD ? AUDIO_LEVEL.HIGH : AUDIO_LEVEL.LOW)
      lastAudiDetectorColorChangeRef.current = performance.now()
      batchPulsesRef.current = []
    } else {
      batchPulsesRef.current = batchPulsesRef.current.concat(state.audioPulse)
    }
  }

  const startRecording = (): void => {
    dispatch(setRecordingState(RECORDER_STATES.RECORDING))
    setTimeout(() => {
      $(window).on(RECORDER_STATES.RECORDING, () => {
        if (updateAudioPulseRef.current) { updateAudioPulseRef.current() }
      })
      recorderRef.current?.start()
    }, 100)
  }

  const pauseRecording = (): void => {
    recorderRef.current?.stop()
    dispatch(setRecordingState(RECORDER_STATES.PAUSED))
    setAudioLevel(AUDIO_LEVEL.LOW)
    setTimeout(() => {
      dispatch(setAudioPulse(initialState.audioPulse))
    }, 100)
  }

  const stopRecording = (): void => {
    if (recorderRef.current) {
      recorderRef.current
        .getWavFile()
        .then((file: Blob) => {
          recorderRef.current?.releaseMic()
          dispatch(setRecordingState(RECORDER_STATES.RECORDED))
          dispatch(setAudioPulse(initialState.audioPulse))
          dispatch(setRecordingTime(initialState.recordingTime))
          dispatch(setFile(file))
          setAudioLevel(AUDIO_LEVEL.LOW)
        })
    }
  }

  const saveRecording = (): void => {
    dispatch(setRecordingState(RECORDER_STATES.RECORDED))
    dispatch(setUploadState(UPLOAD_STATES.SAVING))
    if (fakeUpload) {
      return dispatch(setUploadState(UPLOAD_STATES.SAVED))
    }
    uploadFile(model.id)
  }

  const uploadFile = (id: number): void => {
    const { file } = state
    const urls = {
      mediaUploadUrl: `${mediaUrl}/upload_media_url?question_id=${id}`,
      callbackUrl: `${mediaUrl}/upload_callback`,
    }
    FileUploader.run({
      urls, file, fileName: 'audio.wav', dispatch, onSuccessUpload,
    })
  }

  const discardRecording = (): void => {
    dispatch(removeFile())
    if (result && result.answers.length > 0) {
      const mediaId = result.answers[0].media_id
      if (mediaId) {
        api()(dispatch)(removeRecording(`${mediaUrl}/remove_media`, mediaId)).then(() => {
          onRecordingDiscard && onRecordingDiscard()
        })
      }
    }
    initRecorder()
  }

  const updateAudioPulse = (): void => {
    if (state.recordingState !== RECORDER_STATES.RECORDING) {
      animationFrames.forEach(window.cancelAnimationFrame)

      return
    }

    if (recorderRef.current) {
      dispatch(setAudioPulse(recorderRef.current.getAudioPulse()))
    }

    setTimeout(() => {
      animationFrames.push(
        window.requestAnimationFrame(() => {
          if (updateAudioPulseRef.current) { updateAudioPulseRef.current() }
        }),
      )
    }, 10)
  }

  const fileUrl = (): string | void => {
    if (state.file) { return URL.createObjectURL(state.file) }
    if (result && result.answers.length) { return result.answers[0].value }
  }

  const updateRecordTime = (time: number): void => {
    if (time > maxDuration) {
      stopRecording()
      time = maxDuration
    }
    dispatch(setRecordingTime(time))
  }

  const renderControls = (): JSX.Element => {
    const {
      recordingState, playerState, uploadState, percent,
    } = state

    if (recordingState === RECORDER_STATES.RECORDED) {
      return (
        <PlayerControl
          percent={percent}
          playerState={playerState}
          uploadState={uploadState}
          playAudio={(): void => dispatch(setPlayerState(PLAYER_STATE.PLAYING))}
          pauseAudio={(): void => dispatch(setPlayerState(PLAYER_STATE.PAUSED))}
          saveRecording={saveRecording}
          discardRecording={discardRecording}
          readOnly={readOnly}
        />
      )
    }
    return (
      <RecorderControl
        recordingState={recordingState}
        startRecording={startRecording}
        pauseRecording={pauseRecording}
        stopRecording={stopRecording}
      />
    )
  }

  const {
    recordingState, audioPulse, playerState,
  } = state

  if (state.recordingState === RECORDER_STATES.INIT) {
    return (
      <Permission onAllow={(): void => dispatch(setRecordingState(RECORDER_STATES.READY))} readOnly={readOnly} />
    )
  }

  return (
    <div className={cs(styles.recorderContainer, styles[recordingState])}>
      <div>
        <div className={styles.recordingIndicatorContainer}>
          <div
            className={cs(styles.pulsRing, styles[`${audioLevel}Audio`])}
            style={{ transform: `scale(${audioPulse})` }}
          />
          <img
            src={audioLevel === AUDIO_LEVEL.LOW ? RedMicrophone : GreenMicrophone}
            className={styles.microphoneImg}
          />
        </div>
      </div>
      {recordingState === RECORDER_STATES.RECORDED && fileUrl()
        && (
        <AudioPlayer
          playerState={playerState}
          onComplete={
          (): void => dispatch(setPlayerState(PLAYER_STATE.PAUSED))}
          audioFileUrl={fileUrl() as string}
        />
        )
          }
      {recordingState !== RECORDER_STATES.RECORDED
        && (
        <div className={styles.recordingTime}>
          {getMinutesAndSeconds(state.recordingTime)}
          /
          {getMinutesAndSeconds(maxDuration)}
        </div>
        )}
      {renderControls()}
    </div>
  )
}

export default AudioRecorder
