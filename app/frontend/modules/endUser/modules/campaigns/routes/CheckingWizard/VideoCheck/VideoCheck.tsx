import React, {
  useReducer, useRef, useEffect, useState,
} from 'react'
import {
  Button, Flex, Space,
} from 'antd'
import { DirectUpload } from '@rails/activestorage'
import axios from 'axios'
import * as faceapi from 'face-api.js'
import { StopOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import VideoPlayer from '~/components/MediaRecorder/components/VideoPlayer'
import { RightOutlined, RedoOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { CheckList } from '../CheckList'
import reducer, {
  initialState, updateAccess, updateUploading, updateSpeechTestText,
} from './reducer'
import { CheckListStatus } from '../interfaces'
import styles from './styles.less'
import { useReactMediaRecorder } from '~/components/MediaRecorder/components/MediaRecorder'
import { RANDOM_CONSTS_ARRAY } from '../services/consts'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { preSignUrl } from '~/modules/endUser/modules/campaigns/core/checkingWizard'
import { getRandomVideoTestPhrase } from '../services/service'


const { I18n, $ } = window

export const MAX_DURATION = 30

const connector = connect(({ checkingWizard }: RootState) => ({
  preSignedUrl: checkingWizard.preSignedUrl,
  transcribeSupportedLocales: checkingWizard.transcribeSupportedLocales,
}), {
  preSignUrl,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  nextStep: () => void
}


const VideoCheckComponent: React.FC<Props> = ({ nextStep, preSignUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const [state, dispatch] = useReducer(reducer, initialState)
  const [img, setImg] = useState<Blob | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [visualizing, setVisualizing] = useState<boolean>(false)

  const onStop = React.useCallback(() => {
    setVisualizing(false)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }, [])

  const isAccessDone = state.access === CheckListStatus.Done
  const isUploadingInProgress = state.uploading === CheckListStatus.InProgress


  const {
    status,
    mediaBlobUrl,
    startRecording,
    stopRecording,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    onStop,
  })


  const getMediaStream = React.useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      return stream
    } catch (error) {
      console.error('Error accessing media stream:', error)
      return null
    }
  }, [])

  useEffect(() => {
    faceapi.nets.tinyFaceDetector.loadFromUri('/face-api/models')
    if ((mediaBlobUrl) && videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = mediaBlobUrl
    }
    preSignUrl()
    const random = getRandomVideoTestPhrase(RANDOM_CONSTS_ARRAY)
    dispatch(updateSpeechTestText(random))
  }, [mediaBlobUrl])


  const requestAccess = async () => {
    if (!videoRef.current) return

    try {
      const mediaStream = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
      setStream(mediaStream)
      mediaStreamRef.current = mediaStream


      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      dispatch(updateAccess(CheckListStatus.Done))
      setVisualizing(true)
      startRecording()
      setTimeout(() => track(), 1000)
    } catch (e) {
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }


  const track = async () => {
    if (!videoRef.current) return

    try {
      const canvas = document.createElement('canvas')
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      ctx?.translate(canvas.width, 0)
      ctx?.scale(-1, 1)
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(async (blob) => {
        setImg(blob)
      }, 'image/jpeg', 0.95)
    } catch (err) {
      handleStopRecording()
    }
  }


  const imageUpload = async () => {
    const upload = new DirectUpload(
      img,
      `${location.pathname}/upload_user_verification_image_url`,
      {
        directUploadWillStoreFileWithXHR: (xhr: XMLHttpRequest) => {
          xhr.upload.addEventListener('progress', () => {
            dispatch(updateUploading(CheckListStatus.InProgress))
          })
        },
      },
    )

    upload.create((error, blob) => {
      if (error) {
        dispatch(updateUploading(CheckListStatus.Failed))
      } else {
        onUploadDone(blob)
      }
    })

    dispatch(updateUploading(CheckListStatus.InProgress))
  }

  const onUploadDone = (blob) => {
    axios.put(`${location.pathname}/user_verification_image_upload_callback`, {
      media_id: blob.media_id,
      asset_key: blob.signed_id,
    }, {
      headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
    }).then(() => {
      dispatch(updateUploading(CheckListStatus.Done))
    }).catch(() => {
      dispatch(updateUploading(CheckListStatus.Failed))
    })
  }


  const handleStopRecording = React.useCallback((): void => {
    stopRecording()
    // stopTranscription()
    setVisualizing(false)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    imageUpload()
  }, [stopRecording])


  const renderActionButton = () => {
    if (status === 'recording') {
      return (
        <Flex vertical align="center" gap={8}>
          <Button onClick={handleStopRecording} type="primary" danger icon={<StopOutlined />}>
            {I18n.t('assessments.video_response.stop_recording')}
          </Button>
        </Flex>
      )
    }

    return (
      <Button
        onClick={() => requestAccess()}
        type="primary"
        icon={<VideoCameraOutlined />}
      >
        {I18n.t('assessments.video_response.start_recording')}
      </Button>
    )
  }

  const Controls:React.FC = () => (
    <Flex className="m-16" gap={8}>
      {!mediaBlobUrl && renderActionButton()}
    </Flex>
  )

  const rerun = async () => {
    clearBlobUrl()
    setImg(null)
    dispatch(updateUploading(CheckListStatus.Pending))
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }
    requestAccess()
  }

  const handleVideoPlay = (): void => {
    setVisualizing(true)
  }

  const renderProgressAndChecklist = () => (
    <div className="mt-6" style={{ alignSelf: 'stretch' }}>
      <CheckList
        className="mt14"
        dataSource={[
          { name: I18n.t('checking_wizard.video_check.access'), status: state.access },
          { name: I18n.t('checking_wizard.video_check.uploading'), status: state.uploading },
        ]}
      />
    </div>
  )

  const renderButtons = () => {
    if (state.access !== CheckListStatus.Failed) {
      return (
        <Space className="m-12">
          {isAccessDone && (
            <Button
              className={styles.continueButton}
              onClick={rerun}
              icon={<RedoOutlined />}
              disabled={isUploadingInProgress}
            >
              {I18n.t('checking_wizard.video_check.retake')}
            </Button>
          )}
          <Button
            size="middle"
            type="primary"
            className={styles.continueButton}
            onClick={nextStep}
            disabled={isUploadingInProgress}
          >
            {I18n.t('checking_wizard.video_check.continue')}
            <RightOutlined />
          </Button>
        </Space>
      )
    }
    if (state.uploading === CheckListStatus.Failed) {
      return (
        <Button
          type="primary"
          className="m-12"
          onClick={imageUpload}
          icon={<RedoOutlined />}
          loading={isUploadingInProgress}
        >
          {I18n.t('checking_wizard.video_check.upload_again')}
        </Button>
      )
    }
    return (
      <Button
        type="primary"
        className="m-12"
        onClick={rerun}
        icon={<RedoOutlined />}
      >
        {I18n.t('checking_wizard.video_check.run_again')}
      </Button>
    )
  }


  return (
    <Flex align="center" vertical>
      <h3>{I18n.t('checking_wizard.video_check.title')}</h3>
      <p>{I18n.t('checking_wizard.video_check.description')}</p>
      {
         ['idle', 'recording'].includes(status)
        && (
          <>
            <h3 className={styles.testMessage}>
              &#8220;
              {state.speechTestText}
              &#8221;
            </h3>
          </>
        )
      }
      <VideoPlayer
        videoRef={videoRef}
        mediaUrl={mediaBlobUrl}
        permissionGranted={state.access === CheckListStatus.Done}
        status={status}
        showCountdownTimer
        duration={MAX_DURATION}
        onFinish={handleStopRecording}
        onPlay={handleVideoPlay}
        visualizing={visualizing}
        getMediaStream={getMediaStream}
      />

      <Controls />

      {
        status === 'stopped' && (
          <>
            {renderProgressAndChecklist()}
            {renderButtons()}
          </>
        )}


    </Flex>
  )
}

export const VideoCheck = connector(VideoCheckComponent)
