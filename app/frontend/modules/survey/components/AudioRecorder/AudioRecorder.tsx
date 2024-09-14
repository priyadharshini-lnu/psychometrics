import React, { useReducer, useEffect, useRef } from 'react'
import {
  Card, Row, Col, Space, Typography,
} from 'antd'

import { PreviewModel } from '~/modules/survey/interfaces/questions/AudioResponse'
import { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { RecorderCore } from '~/modules/survey/utils/RecorderCore'
import {
  RECORDER_STATES,
  UPLOAD_STATES,
  PLAYER_STATE,
  DEFAULT_MAX_DURATION,
} from '~/modules/survey/constants/media'


import api from '~/middleware/api'
import useAudioMetrics from '~/hooks/useAudioMetrics'

import FileUploader from '~/modules/survey/components/FileUpload/components/FileUploader'
import { getMinutesAndSeconds } from '~/utils/time'
import DynamicAudioIcon from '~/components/DynamicAudioIcon'
import reducer, {
  initialState,
  setRecordingState,
  setUploadState,
  setFile,
  setPlayerState,
  removeFile,
  setRecordingTime,
  removeRecording,
} from './reducer'
import { Permission } from './Permission'
import { AudioPlayer } from './AudioPlayer'
import { RecorderControl } from './RecorderControl'
import { PlayerControl } from './PlayerControl'

const { $ } = window

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
  disableRecording?: boolean
}

export const AudioRecorder: React.FC<Props> = ({
  mediaUrl,
  model,
  fakeUpload,
  disableRecording,
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
      mediaUploadUrl: `${mediaUrl}/upload_media_url?question_id=${id}&file_name=audio.wav`,
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
    if (state.file) {
      return URL.createObjectURL(state.file)
    }
    if (mediaResponse) {
      return mediaResponse.url
    }
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

  const pauseAudioPlay = (): void => {
    dispatch(setPlayerState(PLAYER_STATE.PAUSED))
    playerRef.current?.pause()
  }

  const {
    recordingState, playerState, uploadState, percent,
  } = state

  if (state.recordingState === RECORDER_STATES.INIT) {
    return (
      <Card>
        <Permission
          onAllow={(): void => dispatch(setRecordingState(RECORDER_STATES.READY))
            }
          readOnly={readOnly}
        />
      </Card>
    )
  }

  return (
    <Card>
      <Row justify="center" align="middle" gutter={[16, 16]} className="ta-c">
        <Col span="24">
          <DynamicAudioIcon level={level} pulse={pulse} />
        </Col>
        <>
          {recordingState === RECORDER_STATES.RECORDED && fileUrl() && (
            <Col span="24" className="mb-6">
              <AudioPlayer
                playerState={playerState}
                playAudio={playAudio}
                pauseAudioPlay={pauseAudioPlay}
                setPlayerElement={(playerElement): void => {
                  playerRef.current = playerElement
                }}
                onComplete={(): void => dispatch(setPlayerState(PLAYER_STATE.PAUSED))
                }
                audioFileUrl={fileUrl() as string}
              />
            </Col>
          )}
        </>
        {recordingState !== RECORDER_STATES.RECORDED && (
          <Col span="24" className="mb-6">
            <Space>
              <Typography.Text strong>
                {getMinutesAndSeconds(state.recordingTime)}
              </Typography.Text>
              <span>/</span>
              <Typography.Text strong>
                {getMinutesAndSeconds(maxDuration)}
              </Typography.Text>
            </Space>
          </Col>
        )}
        <Col span="24" className="mb-6">
          {recordingState === RECORDER_STATES.RECORDED ? (
            <PlayerControl
              percent={percent}
              uploadState={uploadState}
              saveRecording={saveRecording}
              discardRecording={discardRecording}
              readOnly={readOnly}
            />
          ) : (
            <RecorderControl
              disableRecording={disableRecording}
              recordingState={recordingState}
              startRecording={startRecording}
              pauseRecording={pauseRecording}
              stopRecording={stopRecording}
            />
          )}
        </Col>
      </Row>
    </Card>
  )
}
