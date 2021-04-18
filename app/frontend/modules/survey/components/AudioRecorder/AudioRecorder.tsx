import React, {
  useReducer, useEffect, useRef,
} from 'react'
import cs from 'classnames'
import { getMinutesAndSeconds } from 'utils/time'
import api from 'middleware/api'
import useAudioMetrics from 'hooks/useAudioMetrics'
import DynamicAudioIcon from 'components/DynamicAudioIcon'
import { MediaResponse } from 'modules/survey/core/preview/FlowProcessor/interfaces'
import { PreviewModel } from 'modules/survey/interfaces/questions/AudioResponse'
import styles from './AudioRecorderStyle.scss'
import {
  RECORDER_STATES, UPLOAD_STATES, PLAYER_STATE, DEFAULT_MAX_DURATION,
} from './constants'
import RecorderCore from './Recorder/Core'
import reducer, {
  initialState, setRecordingState, setUploadState, setFile, setPlayerState, removeFile,
  setRecordingTime, removeRecording,
} from './reducer'
import FileUploader from '../FileUpload/components/FileUploader'
import Permission from './Permission'
import AudioPlayer from './AudioPlayer/index'
import RecorderControl from './Recorder/RecorderControl'
import PlayerControl from './AudioPlayer/PlayerControl'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { $ } = window as any

interface Props {
  mediaUrl: string
  model: PreviewModel
  fakeUpload: boolean
  onSuccessUpload?(media: object): void
  onRecordingDiscard?(): void
  readOnly?: boolean
  markQuestionInProgress(questionId: number, progressState: string): void
  removeQuestionInProgress(questionId: number, progressState?: string): void
  mediaResponse?: MediaResponse
}

const AudioRecorder: React.FC<Props> = ({
  mediaUrl,
  model,
  fakeUpload,
  onSuccessUpload,
  onRecordingDiscard,
  readOnly,
  markQuestionInProgress,
  removeQuestionInProgress,
  mediaResponse,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const recorderRef = useRef<RecorderCore>()
  const maxDuration = model.props.duration || DEFAULT_MAX_DURATION
  const playerRef = useRef<HTMLAudioElement>()

  const [{ level, pulse }, { updatePulse, resetMetrics }] = useAudioMetrics(recorderRef)

  useEffect(() => {
    if (mediaResponse) {
      dispatch(setRecordingState(RECORDER_STATES.RECORDED))
      dispatch(setUploadState(UPLOAD_STATES.SAVED))
    } else {
      initRecorder()
    }
  }, [mediaResponse])


  const initRecorder = (): void => {
    recorderRef.current = new RecorderCore({ onUpdateRecordTime: updateRecordTime })
  }

  const startRecording = (): void => {
    dispatch(setRecordingState(RECORDER_STATES.RECORDING))
    markQuestionInProgress(model.id, RECORDER_STATES.RECORDING)
    setTimeout(() => {
      $(window).on(RECORDER_STATES.RECORDING, updatePulse)
      recorderRef.current?.start()
    }, 100)
  }

  const pauseRecording = (): void => {
    recorderRef.current?.stop()
    dispatch(setRecordingState(RECORDER_STATES.PAUSED))
    resetMetrics()
  }

  const stopRecording = (): void => {
    if (recorderRef.current) {
      recorderRef.current
        .getWavFile()
        .then((file: Blob) => {
          recorderRef.current?.releaseMic()
          markQuestionInProgress(model.id, RECORDER_STATES.RECORDED)
          dispatch(setRecordingState(RECORDER_STATES.RECORDED))
          resetMetrics()
          dispatch(setRecordingTime(initialState.recordingTime))
          dispatch(setFile(file))
        })
    }
  }

  const saveRecording = (): void => {
    dispatch(setRecordingState(RECORDER_STATES.RECORDED))
    dispatch(setUploadState(UPLOAD_STATES.SAVING))
    if (fakeUpload) {
      removeQuestionInProgress(model.id)
      return dispatch(setUploadState(UPLOAD_STATES.SAVED))
    }
    uploadFile(model.id)
  }

  const handleSuccessfulUpload = (media: object) => {
    removeQuestionInProgress(model.id)
    onSuccessUpload && onSuccessUpload(media)
  }

  const uploadFile = (id: number): void => {
    const { file } = state
    const urls = {
      mediaUploadUrl: `${mediaUrl}/upload_media_url?question_id=${id}`,
      callbackUrl: `${mediaUrl}/upload_callback`,
    }
    markQuestionInProgress(id, UPLOAD_STATES.SAVING)
    FileUploader.run({
      urls, file, fileName: 'audio.wav', dispatch, onSuccessUpload: handleSuccessfulUpload,
    })
  }

  const discardRecording = (): void => {
    dispatch(removeFile())
    if (mediaResponse) {
      const { id } = mediaResponse
      api()(dispatch)(removeRecording(`${mediaUrl}/remove_media`, id)).then(() => {
        onRecordingDiscard && onRecordingDiscard()
      })
    } else {
      removeQuestionInProgress(model.id)
    }
    initRecorder()
  }

  const fileUrl = (): string | void => {
    if (state.file) { return URL.createObjectURL(state.file) }
    if (mediaResponse) { return mediaResponse.url }
  }

  const updateRecordTime = (time: number): void => {
    if (time > maxDuration) {
      stopRecording()
      time = maxDuration
    }
    dispatch(setRecordingTime(time))
  }

  const playAudio = (): void => {
    dispatch(setPlayerState(PLAYER_STATE.PLAYING))
    playerRef.current?.play()
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
          playAudio={playAudio}
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
    recordingState, playerState,
  } = state

  if (state.recordingState === RECORDER_STATES.INIT) {
    return (
      <Permission onAllow={(): void => dispatch(setRecordingState(RECORDER_STATES.READY))} readOnly={readOnly} />
    )
  }

  return (
    <div className={cs(styles.recorderContainer, styles[recordingState])}>
      <DynamicAudioIcon level={level} pulse={pulse} />
      {recordingState === RECORDER_STATES.RECORDED && fileUrl()
        && (
        <AudioPlayer
          playerState={playerState}
          setPlayerElement={(playerElement): void => { playerRef.current = playerElement }}
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
