import React, {
  useRef, useEffect, useState, useCallback,
} from 'react'
import {
  Button, Flex, message,
} from 'antd'
import { AnimatePresence, motion } from 'motion/react'
import {
  DeleteOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import VideoRecorder from '~/components/MediaRecorder/components/VideoRecorder'
import FloatingControlBar from '~/components/MediaRecorder/components/FloatingControlBar'
import PlaybackControlBar from '~/components/MediaRecorder/components/PlaybackControlBar'
import CountdownOverlay from '~/components/MediaRecorder/components/CountdownOverlay'
import styles from './styles.less'
import { useReactMediaRecorder } from '~/components/MediaRecorder/components/MediaRecorder'
import { useMediaPreview, VIDEO_RESOLUTION } from '~/hooks/useMediaPreview'

interface Props {
  maxDuration: number
  questionId: string
  markQuestionInProgress: (id: string, progressState: string) => void;
  removeQuestionInProgress: (id: string) => void;
}

const { I18n } = window

export const VideoPreview: React.FC<Props> = ({
  maxDuration,
  markQuestionInProgress, removeQuestionInProgress,
  questionId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [visualizing, setVisualizing] = useState<boolean>(false)
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(maxDuration)
  const [error, setError] = useState<string>('')
  const [videoReady, setVideoReady] = useState<boolean>(false)

  const isRerunningRef = useRef<boolean>(false)

  const onStop = React.useCallback(() => {
    setVisualizing(false)
  }, [])

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

  const hasRecordedVideo = status === 'stopped' && !!mediaBlobUrl
  const isLoading = hasRecordedVideo && !videoReady
  const isPlaybackReady = hasRecordedVideo && videoReady


  let barKey = 'idle'
  if (status === 'recording') barKey = 'recording'
  else if (isLoading) barKey = 'loading'
  else if (isPlaybackReady) barKey = 'playback'

  const {
    previewStream,
    permissionGranted,
    devices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    setPreviewStream,
  } = useMediaPreview({
    shouldSkipPreview: !!mediaBlobUrl || isRerunningRef.current,
    isRecording: status === 'recording',
    requestMediaStream,
    onError: error => setError(error),
  })

  useEffect(() => {
    requestAccess()
  }, [
    selectedVideoDevice,
    selectedAudioDevice,
  ])

  useEffect(() => {
    if (!mediaBlobUrl || !videoRef.current) return
    setVideoReady(false)
    videoRef.current.srcObject = null
    videoRef.current.src = mediaBlobUrl
    videoRef.current.currentTime = 0
    videoRef.current.load()

    const video = videoRef.current

    const onCanPlay = () => {
      setVideoReady(true)
      video.removeEventListener('canplay', onCanPlay)
    }
    video.addEventListener('canplay', onCanPlay)
    return () => video.removeEventListener('canplay', onCanPlay)
  }, [mediaBlobUrl])


  const recordingStartedRef = useRef<boolean>(false)

  const requestAccess = async () => {
    if (!videoRef.current) return

    try {
      const audioConstraints = selectedAudioDevice
        ? { deviceId: { exact: selectedAudioDevice } }
        : true

      const videoConstraints = selectedVideoDevice
        ? { deviceId: { exact: selectedVideoDevice }, ...VIDEO_RESOLUTION }
        : VIDEO_RESOLUTION


      const mediaStream = await requestMediaStream({
        audio: audioConstraints,
        video: videoConstraints,
      })

      if (!mediaStream) {
        return
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }

      mediaStreamRef.current = mediaStream
      setPreviewStream(mediaStream)
    } catch (e) {
      message.error(I18n.t('assessments.video_response.failed_to_access_permission'))
    }
  }

  const handleStopRecording = React.useCallback(async (): Promise<void> => {
    try {
      stopRecording()
      setVisualizing(false)
      removeQuestionInProgress(questionId)

      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop())
        setPreviewStream(null)
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    } catch (e) {
      console.error('Error stopping recording:', e)
    }
  }, [stopRecording])

  const handleStartWithCountdown = useCallback(() => {
    setIsCountingDown(true)
  }, [])

  const handleCountdownComplete = useCallback(() => {
    setIsCountingDown(false)
    setRemainingSeconds(maxDuration)
    markQuestionInProgress(questionId, 'recording')
    startRecording()
    setVisualizing(true)
  }, [startRecording, maxDuration])

  const handleChangeVideoDevice = (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
  }

  const handleChangeAudioDevice = (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
  }

  useEffect(() => {
    let interval:ReturnType<typeof setInterval>
    if (status === 'recording') {
      if (!recordingStartedRef.current) {
        setRemainingSeconds(maxDuration)
        recordingStartedRef.current = true
      }
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            handleStopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      recordingStartedRef.current = false
    }
    return () => clearInterval(interval)
  }, [status, handleStopRecording])

  const rerun = async () => {
    isRerunningRef.current = true
    clearBlobUrl()
    setVideoReady(false)

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop())
      setPreviewStream(null)
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

  const handleDiscard = useCallback(async (): Promise<void> => {
    setVideoReady(false)
    barKey = 'idle'
    removeQuestionInProgress(questionId)

    clearBlobUrl()
    setVideoReady(false)

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop())
      setPreviewStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }
    requestAccess()
  }, [clearBlobUrl])

  const renderButtons = () => (
    <Button
      onClick={handleDiscard}
      type="primary"
      icon={<DeleteOutlined />}
      className="mt-4"
    >
      {I18n.t('assessments.video_response.discard_record_again')}
    </Button>
  )

  return (
    <Flex
      align="center"
      className={styles.videoPreviewContainer}
      vertical
      style={{ width: '100%', padding: '1rem' }}
    >
      <VideoRecorder
        videoRef={videoRef}
        mediaUrl={mediaBlobUrl}
        permissionGranted={permissionGranted}
        status={status}
        onPlay={handleVideoPlay}
        visualizing={visualizing}
        stream={previewStream || mediaStreamRef.current}
        permissionError={error}
        isTestMode={false}
        renderControlBar={(stream: MediaStream) => (
          stream
            ? (
              <>
                {isCountingDown && (
                  <CountdownOverlay onComplete={handleCountdownComplete} />
                )}
                <AnimatePresence mode="wait">
                  {barKey === 'loading' && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={styles.loadingBar}
                    >
                      <span className={styles.loadingSpinner} />
                      {I18n.t('enduser.preparing_preview')}
                    </motion.div>
                  )}
                  {(barKey === 'idle' || barKey === 'recording') && (
                    <motion.div
                      key="controls"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FloatingControlBar
                        status={status}
                        isRecording={status === 'recording'}
                        hasMedia={!!mediaBlobUrl}
                        onStartRecording={handleStartWithCountdown}
                        onStopRecording={handleStopRecording}
                        onDiscard={rerun}
                        remainingSeconds={remainingSeconds}
                        maxDuration={maxDuration}
                        stream={stream}
                        audioDevices={devices.audioDevices}
                        onChangeAudioDevice={handleChangeAudioDevice}
                        onChangeVideoDevice={handleChangeVideoDevice}
                        videoDevices={devices.videoDevices}
                        selectedVideoDeviceId={selectedVideoDevice}
                        selectedAudioDeviceId={selectedAudioDevice}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                {barKey === 'playback' && (
                  <motion.div
                    key="playback"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PlaybackControlBar videoRef={videoRef} />
                  </motion.div>
                )}
              </>
            )
        )}
        maxRecordingDuration={status === 'recording' ? maxDuration : undefined}
      />

      {
        status === 'stopped' && (
          <>
            {renderButtons()}
          </>
        )}
    </Flex>
  )
}
