import React, {
  useReducer, useRef, useEffect, useState,
} from 'react'
import {
  Button, Flex, Space,
} from 'antd'
import { DirectUpload } from '@rails/activestorage'
import axios from 'axios'
import { connect, ConnectedProps } from 'react-redux'
import {
  StopOutlined, VideoCameraOutlined, RightOutlined, RedoOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import VideoPlayer from '~/components/MediaRecorder/components/VideoPlayer'

import { CheckList } from '../CheckList'
import reducer, {
  initialState, updateAccess, updateUploading, updateSpeechTestText,
} from './reducer'
import { CheckListStatus } from '../interfaces'
import styles from './styles.less'
import { useReactMediaRecorder } from '~/components/MediaRecorder/components/MediaRecorder'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { preSignUrl } from '~/modules/endUser/modules/campaigns/core/checkingWizard'
import { getRandomVideoTestPhrase } from '../services/service'


const { I18n } = window

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
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [visualizing, setVisualizing] = useState<boolean>(false)
  const [devices, setDevices] = useState<{ videoDevices: MediaDeviceInfo[]; audioDevices: MediaDeviceInfo[] }>(
    { videoDevices: [], audioDevices: [] },
  )
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')

  const getDevices = React.useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    const audioDevices = devices.filter(device => device.kind === 'audioinput')

    setDevices({ videoDevices, audioDevices })

    // Set default devices on first enumeration
    if (videoDevices.length > 0 && !selectedVideoDevice) {
      setSelectedVideoDevice(videoDevices[0].deviceId)
    }

    if (audioDevices.length > 0 && !selectedAudioDevice) {
      setSelectedAudioDevice(audioDevices[0].deviceId)
    }
  }, [selectedVideoDevice, selectedAudioDevice])

  const onStop = React.useCallback((blobUrl: string, lastBlob: Blob, completeBlob: Blob) => {
    setVisualizing(false)
    setVideoBlob(completeBlob)
  }, [])

  const isAccessDone = state.access === CheckListStatus.Done
  const isUploadingInProgress = state.uploading === CheckListStatus.InProgress

  const {
    status,
    mediaBlobUrl,
    startRecording,
    stopRecording,
    clearBlobUrl,
    requestMediaStream,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    onStop,
    stopStreamsOnStop: false,
  })

  useEffect(() => {
    getDevices()
  }, [getDevices])

  useEffect(() => {
    if ((mediaBlobUrl) && videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = mediaBlobUrl
      videoRef.current.currentTime = 0
      videoRef.current.load()
    }
    preSignUrl()
    const random = getRandomVideoTestPhrase()
    dispatch(updateSpeechTestText(random))
  }, [mediaBlobUrl])

  useEffect(() => {
    if (videoBlob && status === 'stopped') {
      videoUpload()
    }
  }, [videoBlob, status])

  const requestAccess = async () => {
    if (!videoRef.current) return

    try {
      const audioConstraints = selectedAudioDevice
        ? { deviceId: { exact: selectedAudioDevice } }
        : true
      const videoConstraints = selectedVideoDevice
        ? { deviceId: { exact: selectedVideoDevice } }
        : true

      const mediaStream = await requestMediaStream({
        audio: audioConstraints,
        video: videoConstraints,
      })

      if (!mediaStream) {
        dispatch(updateAccess(CheckListStatus.Failed))
        return
      }
      mediaStreamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      dispatch(updateAccess(CheckListStatus.Done))
      startRecording()
      setVisualizing(true)
    } catch (e) {
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }

  const videoUpload = async () => {
    if (!videoBlob) {
      dispatch(updateUploading(CheckListStatus.Failed))
      return
    }
    const upload = new DirectUpload(
      videoBlob,
      `${location.pathname}/upload_user_verification_media_url?media_type=video`,
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
    axios.put(`${location.pathname}/user_verification_media_upload_callback`, {
      media_id: blob.media_id,
      asset_key: blob.signed_id,
      media_type: 'video',
    }, {
      headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
    }).then(() => {
      dispatch(updateUploading(CheckListStatus.Done))
    }).catch(() => {
      dispatch(updateUploading(CheckListStatus.Failed))
    })
  }

  const handleStopRecording = React.useCallback(async (): Promise<void> => {
    try {
      stopRecording()
      setVisualizing(false)

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
    } catch (e) {
      console.error('Error stopping recording:', e)
    }
  }, [stopRecording])

  const renderActionButton = () => {
    if (status === 'recording') {
      return (
        <Flex vertical align="center" gap={8}>
          <Button onClick={handleStopRecording} type="primary" danger icon={<StopOutlined />}>
            {I18n.t('enduser.system_check_stop_recording')}
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
        {I18n.t('enduser.system_check_start_recording')}
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
    setVideoBlob(null)
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

  const handleChangeVideoDevice = (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
  }

  const handleChangeAudioDevice = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
  }

  const renderProgressAndChecklist = () => (
    <div className="mt-6" style={{ alignSelf: 'stretch' }}>
      <CheckList
        className="mt14"
        dataSource={[
          { name: I18n.t('enduser.system_check_access'), status: state.access },
          { name: I18n.t('enduser.system_check_uploading'), status: state.uploading },
        ]}
      />
    </div>
  )

  const renderButtons = () => {
    if (state.uploading !== CheckListStatus.Failed) {
      return (
        <Space className="m-12">
          {isAccessDone && (
            <Button
              className={styles.continueButton}
              onClick={rerun}
              icon={<RedoOutlined />}
              disabled={isUploadingInProgress}
            >
              {I18n.t('enduser.system_check_retake')}
            </Button>
          )}
          <Button
            size="middle"
            type="primary"
            className={styles.continueButton}
            onClick={nextStep}
            disabled={isUploadingInProgress}
          >
            {I18n.t('enduser.system_check_proceed')}
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
          onClick={videoUpload}
          icon={<RedoOutlined />}
          loading={isUploadingInProgress}
        >
          {I18n.t('enduser.system_check_upload_again')}
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
        {I18n.t('enduser.system_check_run_again')}
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
        stream={mediaStreamRef.current}
        videoDevices={devices.videoDevices}
        audioDevices={devices.audioDevices}
        onChangeVideoDevice={handleChangeVideoDevice}
        onChangeAudioDevice={handleChangeAudioDevice}
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
