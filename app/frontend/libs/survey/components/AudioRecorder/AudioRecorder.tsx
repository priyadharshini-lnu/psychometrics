import React, { useReducer, useEffect, useRef } from 'react'
import cs from 'classnames'
import { getMinutesAndSeconds } from 'utils/time'
import api from 'middleware/api'
import styles from './AudioRecorderStyle.scss'
import {
  RECORDER_STATES, UPLOAD_STATES, PLAYER_STATE, DEFAULT_MAX_DURATION,
} from './constants'
import RecorderCore from './Recorder/Core'
import reducer, {
  initialState, setRecordingState, setUploadState, setFile, setAudioPulse, setPlayerState, removeFile,
  setRecordingTime, removeRecording,
} from './reducer'
import FileUploader from '../FileUpload/components/FileUploader'
import Permission from './Permission'
import AudioPlayer from './AudioPlayer/index'
import Microphone from './images/microphone.png'
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
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const updateAudioPulseRef = useRef<() => void>()
  const recorderRef = useRef<RecorderCore>()
  const maxDuration = model.props.duration || DEFAULT_MAX_DURATION

  useEffect(() => {
    updateAudioPulseRef.current = updateAudioPulse
  })

  useEffect(() => {
    if (result && result.answers.length) {
      dispatch(setRecordingState(RECORDER_STATES.RECORDED))
    } else {
      initRecorder()
    }
  }, [result])

  const animationFrames: Array<number> = []

  const initRecorder = (): void => {
    recorderRef.current = new RecorderCore({ onUpdateRecordTime: updateRecordTime })
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
      <Permission onAllow={(): void => dispatch(setRecordingState(RECORDER_STATES.READY))} />
    )
  }

  return (
    <div className={cs(styles.recorderContainer, styles[recordingState])}>
      <div>
        <div className={styles.recordingIndicatorContainer}>
          <div
            className={styles.pulsRing}
            style={{ transform: `scale(${audioPulse})` }}
          />
          <img
            src={Microphone}
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
