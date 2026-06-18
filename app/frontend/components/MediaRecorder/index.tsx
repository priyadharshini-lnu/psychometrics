// Refer to the below gist for code which has a buffer time logic before recording starts
// https://gist.github.com/ruthvik-mandapati/ac0a60719554b8cd08e57fbe2488dac3

import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import { AxiosResponse } from 'axios'
import _ from 'lodash'
import { Button, Flex, Alert } from 'antd'
import humps from 'humps'
import SparkMD5 from 'spark-md5'
import * as Sentry from '@sentry/react'
import { AnimatePresence, motion } from 'motion/react'
import {
  DeleteOutlined, LoadingOutlined,
  CheckCircleFilled,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { axiosWithRetry } from '~/utils/axiosWithRetry'
import { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { useReactMediaRecorder } from './components/MediaRecorder'
import VideoRecorder from '~/components/MediaRecorder/components/VideoRecorder'
import FloatingControlBar from '~/components/MediaRecorder/components/FloatingControlBar'
import PlaybackControlBar from '~/components/MediaRecorder/components/PlaybackControlBar'
import { useMediaPreview, VIDEO_RESOLUTION } from '~/hooks/useMediaPreview'
import styles from './styles.less'


const { I18n } = window

const axiosInstance = axiosWithRetry()

interface MimeType {
  mimeType: string;
  extension: string;
}

const VIDEO_BACKGROUND_COLOR = '#E9F7F6'


const getMediaRecorderMimeType = (): MimeType | undefined => {
  const types: MimeType[] = [
    { mimeType: 'video/webm', extension: 'webm' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=h264', extension: 'webm' },
    { mimeType: 'video/webm;codecs=vp8', extension: 'webm' },
  ]
  return types.find(type => MediaRecorder.isTypeSupported(type.mimeType))
}

const supportedMimeType = getMediaRecorderMimeType()

interface Props {
  mediaUrl: string;
  questionId: string;
  maxDuration: number;
  onSuccessUpload: (media: MediaResponse) => void;
  onDeleteMedia: () => void;
  mediaResponse: {
    url: string;
    id: number;
  };
  markQuestionInProgress: (questionId: string, progressState: string) => void;
  removeQuestionInProgress: (questionId: string) => void;
  isAssessmentTimedOut: boolean;
}

const UPLOAD_CHUNK_SIZE = 5.5 * 1024 * 1024 // 5.5MB in bytes

interface UrlDetails {
  media_id: string;
  asset_key: string;
  upload_id: string;
  urls: string[];
  checksum: string;
}

const calculateMD5Checksum = async (blob: Blob): Promise<string> => {
  const fileReader = new FileReader()
  const spark = new SparkMD5.ArrayBuffer()

  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result as ArrayBuffer)
    fileReader.onerror = () => reject(new Error('Failed to read file'))
    fileReader.readAsArrayBuffer(blob)
  })

  spark.append(arrayBuffer)
  const base64 = btoa(spark.end(true))
  return base64
}

const MediaRecorderComponent: React.FC<Props> = ({
  mediaUrl, questionId, maxDuration, mediaResponse, onSuccessUpload, onDeleteMedia, markQuestionInProgress,
  removeQuestionInProgress, isAssessmentTimedOut,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [showMessage, setShowMessage] = useState<boolean>(false)
  const [videoReady, setVideoReady] = useState<boolean>(false)
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)


  const videoRef = useRef<HTMLVideoElement>(null)
  const promisesArrayRef = useRef<Promise<AxiosResponse<unknown> | undefined>[]>([])
  const urlDetailsRef = useRef<UrlDetails | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const isRerunningRef = useRef<boolean>(false)
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false)
  const isDiscardedAfterRecordingRef = useRef<boolean>(false)

  const [recStopCountdownRemainingDuration, setRecStopCountdownRemainingDuration] = useState<number>(
    maxDuration,
  )
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(mediaResponse?.url || null)
  const [existingMedia, setExistingMedia] = useState<Props['mediaResponse']>(mediaResponse)


  const [totalSize, setTotalSize] = useState<number>(0)
  const chunksRef = useRef<{ size: number }[]>([])

  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false)

  const setError = (key: string) => (message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }))
  }

  const removeError = (key: string) => {
    setErrors((prev) => {
      if (key in prev) {
        delete prev[key]
      }
      return { ...prev }
    })
  }


  const getUploadUrl = useCallback(async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<UrlDetails>(
        `${mediaUrl}/upload_media_url.json?question_id=${questionId}&file_name=video.${supportedMimeType?.extension}`,
      )
      urlDetailsRef.current = response.data
      removeError('uploadUrl')
    } catch (error) {
      console.error('Error getting upload URL:', error)
      setError('uploadUrl')(_.get(error, ['response', 'data', 'error'], 'Failed to get upload URL'))
    }
  }, [mediaUrl, questionId, supportedMimeType])

  useEffect(() => {
    if (!existingMedia?.id) {
      getUploadUrl()
    }
  }, [getUploadUrl, existingMedia?.id])

  const chunkCounterRef = useRef<number>(0)

  const uploadChunk = async (chunk: Blob): Promise<AxiosResponse<unknown> | undefined> => {
    if (!urlDetailsRef.current) {
      await getUploadUrl()
      if (!urlDetailsRef.current) {
        console.error('Failed to get upload URL')
        return
      }
    }

    const chunkNumber = chunkCounterRef.current

    if (chunkNumber >= urlDetailsRef.current.urls.length) {
      console.error('No more upload URLs available')
      return
    }

    const uploadUrl = urlDetailsRef.current.urls[chunkNumber]
    chunkCounterRef.current += 1
    try {
      const uploadResp = await axiosInstance.put(uploadUrl, chunk, {
        headers: { 'Content-Type': supportedMimeType?.mimeType },
      })

      removeError('upload')
      return uploadResp
    } catch (err) {
      console.error('Error uploading chunk:', err)
      setError('upload')((err as Error).message)
      throw err
    }
  }

  const completeMediaUpload = async (completeBlob: Blob): Promise<void> => {
    if (!urlDetailsRef.current) {
      console.error('No URL details available for completing upload')
      setError('complete')(I18n.t('assessments.video_response.failed_to_complete_upload'))
      return
    }

    try {
      const resolvedArray = await Promise.all(promisesArrayRef.current)
      const uploadPartsArray = resolvedArray.map((resolvedPromise, index) => ({
        etag: resolvedPromise?.headers.etag,
        part_number: index + 1,
      }))
      const checksum = await calculateMD5Checksum(completeBlob)
      const { data } = await axiosInstance.put(
        `${mediaUrl}/complete_multipart_upload`,
        {
          parts: uploadPartsArray,
          media_id: urlDetailsRef.current.media_id,
          asset_key: urlDetailsRef.current.asset_key,
          upload_id: urlDetailsRef.current.upload_id,
          file_size: totalSize,
          checksum,
          content_type: supportedMimeType,
        },
        {
          headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') },
        },
      )
      const camelizedData = humps.camelizeKeys(data)
      handleRecordingSaved(camelizedData)
    } catch (error) {
      console.error('Error completing media upload:', error)
      Sentry.captureException(error)
      setError('complete')(I18n.t('assessments.video_response.error_while_uploading'))
    }
  }

  const resetMultipartUpload = (): void => {
    chunksRef.current = []
    setTotalSize(0)
    promisesArrayRef.current = []
  }

  const handleRecordingSaved = (data: MediaResponse): void => {
    setIsRecording(false)
    removeQuestionInProgress(questionId)
    onSuccessUpload(data)
    setExistingMedia(data)
    resetMultipartUpload()
    successMessage()
    isRerunningRef.current = false
  }

  const handleChunkAvailable = useCallback((chunk: Blob): void => {
    const chunkSize = chunk.size
    setTotalSize(prevSize => prevSize + chunkSize)
    chunksRef.current.push({ size: chunkSize })
    const uploadPromise = uploadChunk(chunk)
    promisesArrayRef.current.push(uploadPromise)
  }, [])

  const onStop = useCallback(async (blobUrl: string, lastBlob: Blob, completeBlob: Blob) => {
    setIsUploading(true)

    try {
      const finalUploadPromise = uploadChunk(lastBlob)
      promisesArrayRef.current.push(finalUploadPromise)

      await finalUploadPromise
      await completeMediaUpload(completeBlob)
    } catch (error) {
      setError('upload')(I18n.t('assessments.video_response.error_while_uploading'))
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleRecorderStarted = useCallback((): void => {
    setRecordingStartedAt(Date.now())
    setRecStopCountdownRemainingDuration(maxDuration)
  }, [maxDuration])

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    requestMediaStream,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    onStart: handleRecorderStarted,
    onChunkAvailable: handleChunkAvailable,
    onStop,
    chunkSize: UPLOAD_CHUNK_SIZE,
    stopStreamsOnStop: false,
  })

  const {
    previewStream,
    permissionGranted,
    devices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    setPermissionGranted,
    setPreviewStream,
  } = useMediaPreview({
    shouldSkipPreview: !!existingVideoUrl,
    isRecording: status === 'recording',
    requestMediaStream,
    onError: error => setError('permission')(error),
  })

  const playbackSource = mediaBlobUrl || existingVideoUrl || existingMedia?.url
  const hasPlayableVideo = !!playbackSource
  const isPlaybackReady = status !== 'recording' && hasPlayableVideo && videoReady

  let barKey = 'idle'
  if (status === 'recording') barKey = 'recording'
  else if (isPlaybackReady) barKey = 'playback'

  const handleStartRecording = useCallback((): void => {
    if (!isRecording) {
      startRecording()
    }
    setVideoReady(false)
    setRecStopCountdownRemainingDuration(maxDuration)
  }, [isRecording, startRecording, maxDuration])

  const handleRequestPermission = useCallback(async () => {
    setIsRequestingPermission(true)
    try {
      if (!selectedAudioDevice && !selectedVideoDevice) {
        setError('permission')(I18n.t('checking_wizard.system_check.failure.title'))
        return
      }

      const videoConstraints = selectedVideoDevice
        ? { deviceId: { exact: selectedVideoDevice }, ...VIDEO_RESOLUTION }
        : VIDEO_RESOLUTION
      const audioConstraints = selectedAudioDevice
        ? { deviceId: { exact: selectedAudioDevice } }
        : true

      const mediaStream = await requestMediaStream({
        audio: audioConstraints,
        video: videoConstraints,
      })

      mediaStreamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setPermissionGranted(true)
      setPreviewStream(mediaStream)

      if (isDiscardedAfterRecordingRef.current) {
        isDiscardedAfterRecordingRef.current = false
        return
      }

      setIsRecording(true)
      markQuestionInProgress(questionId, 'recording')
      handleStartRecording()
    } catch (error) {
      console.error('Permission denied:', error)
      setError('permission')(I18n.t('assessments.video_response.failed_to_access_permission'))
    } finally {
      setIsRequestingPermission(false)
    }
  }, [
    selectedAudioDevice,
    selectedVideoDevice,
    requestMediaStream,
    questionId,
    handleStartRecording,
  ])

  const handleChangeVideoDevice = (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
  }

  const handleChangeAudioDevice = (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || !playbackSource) return

    const markVideoReady = () => {
      video.removeEventListener('canplay', markVideoReady)
      video.removeEventListener('loadedmetadata', markVideoReady)
    }

    if (isDiscardedAfterRecordingRef.current) {
      setVideoReady(false)
      return
    }
    setVideoReady(true)
    video.addEventListener('canplay', markVideoReady)
    video.addEventListener('loadedmetadata', markVideoReady)
    video.srcObject = null
    video.src = playbackSource

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markVideoReady()
    }

    return () => {
      video.removeEventListener('canplay', markVideoReady)
      video.removeEventListener('loadedmetadata', markVideoReady)
    }
  }, [playbackSource])


  const resetRecorder = useCallback(async (): Promise<void> => {
    isRerunningRef.current = true
    setErrors({})
    setIsUploading(false)
    setRecordingStartedAt(null)
    setRecStopCountdownRemainingDuration(maxDuration)

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }

    resetMultipartUpload()
    chunkCounterRef.current = 0
    urlDetailsRef.current = null

    await getUploadUrl()
    await handleRequestPermission()
  }, [maxDuration, handleRequestPermission, getUploadUrl])

  const handleDiscard = useCallback(async (): Promise<void> => {
    if (isDiscarding) return
    setIsDiscarding(true)
    setVideoReady(false)
    barKey = 'idle'
    isDiscardedAfterRecordingRef.current = true
    try {
      if (existingMedia) {
        try {
          await axiosInstance.delete(`${mediaUrl}/remove_media`, {
            headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') },
            data: { media_id: existingMedia.id },
          })
          setExistingVideoUrl(null)
          clearBlobUrl()
          onDeleteMedia()
        } catch (error) {
          console.error('Error discarding existing video:', error)
          setError('discard')(I18n.t('assessments.video_response.error_while_discarding'))
          return
        }
      } else {
        clearBlobUrl()
      }
      await resetRecorder()
    } finally {
      setIsDiscarding(false)
    }
  }, [mediaUrl, existingMedia, isDiscarding, clearBlobUrl, resetRecorder])

  const handleStopRecording = useCallback((): void => {
    setRecordingStartedAt(null)
    setIsRecording(false)
    stopRecording()

    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop())
      setPreviewStream(null)
    }
    setVideoReady(true)
  }, [stopRecording, previewStream, setPreviewStream])

  const handleVideoPlay = (): void => {}

  const showActionButton = !mediaBlobUrl && !existingVideoUrl

  const renderActionButton = () => {
    if (isRequestingPermission) {
      return (
        <Button type="primary" icon={<LoadingOutlined />} disabled>
          {I18n.t('assessments.video_response.requesting_permission')}
        </Button>
      )
    }

    return (
      <></>
    )
  }

  const renderDiscardButton = () => (
    <Button
      disabled={isRecording || isDiscarding}
      loading={isDiscarding}
      onClick={handleDiscard}
      type="primary"
      icon={<DeleteOutlined />}
    >
      {I18n.t('assessments.video_response.discard_record_again')}
    </Button>
  )

  const renderSuccessText = () => (
    <>
      <CheckCircleFilled style={{ color: 'var(--ant-primary-color)' }} />
      <span>{I18n.t('assessments.video_response.response_recorded')}</span>
    </>
  )

  const controls = (

    <Flex style={{ paddingBottom: '16px' }} gap={8}>
      {showActionButton && renderActionButton()}

      {showMessage && renderSuccessText()}
      {isUploading && (
        <>
          <LoadingOutlined />
          <span>{I18n.t('shared.system_check_uploading')}</span>
        </>
      )}
      {(mediaBlobUrl || existingVideoUrl) && !isUploading && !showMessage && renderDiscardButton()}
    </Flex>
  )

  const successMessage = () => {
    setShowMessage(true)

    setTimeout(() => {
      setShowMessage(false)
    }, 3000)
  }

  // Effect to handle assessment timeout
  useEffect(() => {
    if (isAssessmentTimedOut && status === 'recording') {
      handleStopRecording()
    }
  }, [isAssessmentTimedOut, status])

  // Effect to handle countdown for starting recording
  useEffect(() => {
    if (status !== 'recording' || recordingStartedAt == null) return undefined

    const stopAt = recordingStartedAt + (maxDuration * 1000)
    let hasStopped = false

    const updateRemainingTime = () => {
      const remainingMs = Math.max(stopAt - Date.now(), 0)
      const remainingSeconds = Math.ceil(remainingMs / 1000)
      setRecStopCountdownRemainingDuration(remainingSeconds)

      if (remainingMs === 0 && !hasStopped) {
        hasStopped = true
        handleStopRecording()
      }
    }

    updateRemainingTime()
    const countdownInterval = setInterval(updateRemainingTime, 250)

    return () => {
      clearInterval(countdownInterval)
    }
  }, [status, recordingStartedAt])
  return (
    <Flex
      style={{ background: VIDEO_BACKGROUND_COLOR }}
      vertical
      justify="center"
      align="center"
      gap={4}
    >
      <div className={styles.videoPlayerWrapper}>
        <VideoRecorder
          videoRef={videoRef}
          mediaUrl={existingVideoUrl || mediaBlobUrl}
          permissionGranted={permissionGranted}
          permissionError={errors.permission}
          status={status}
          onPlay={handleVideoPlay}
          visualizing={false}
          isTestMode={false}
          stream={previewStream || mediaStreamRef.current}
          renderControlBar={(stream: MediaStream) => (
            <>
              <AnimatePresence mode="wait">
                {(barKey === 'idle' || barKey === 'recording') && stream && (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FloatingControlBar
                      status={status}
                      onDiscard={() => {}}
                      isRecording={status === 'recording'}
                      hasMedia={!!(existingVideoUrl || mediaBlobUrl)}
                      onStartRecording={handleRequestPermission}
                      onStopRecording={handleStopRecording}
                      remainingSeconds={recStopCountdownRemainingDuration}
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
                {(barKey === 'playback') && (
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
              </AnimatePresence>
            </>
          )}
          maxRecordingDuration={status === 'recording' ? maxDuration : undefined}
        />
      </div>
      <Flex className={status === 'recording' ? 'mt-16' : 'mt-4'} vertical justify="center" align="center" gap={4}>
        {controls}
      </Flex>

      {Object.keys(errors).map(key => (
        <Alert key={key} type="error" title={errors[key]} />
      ))}
    </Flex>
  )
}

export default MediaRecorderComponent
