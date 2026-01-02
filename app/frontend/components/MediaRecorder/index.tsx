// Refer to the below gist for code which has a buffer time logic before recording starts
// https://gist.github.com/ruthvik-mandapati/ac0a60719554b8cd08e57fbe2488dac3

import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import { AxiosResponse, AxiosProgressEvent } from 'axios'
import _ from 'lodash'
import {
  Button, Flex, Alert,
  Select,
} from 'antd'
import humps from 'humps'
import SparkMD5 from 'spark-md5'
import {
  DeleteOutlined, StopOutlined, VideoCameraOutlined, LoadingOutlined,
  DownOutlined,
  AudioOutlined,
  CheckCircleFilled,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { axiosWithRetry } from '~/utils/axiosWithRetry'
import { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { useReactMediaRecorder } from './components/MediaRecorder'
import { useRecording } from '~/context/RecordingContext'
import VideoPlayer from './components/VideoPlayer'
import ProgressWithCountdown, { ProgressWithCountdownProps } from './components/ProgressWIthCountdown'
import styles from './styles.less'

const { I18n } = window

const axiosInstance = axiosWithRetry()

interface MimeType {
  mimeType: string;
  extension: string;
}

const VIDEO_BACKGROUND_COLOR = '#E9F7F6'
const PLACEHOLDER_BLACK = '#000'
const PROGRESS_BAR_SUCCESS = '#009C37'


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
}

const UPLOAD_CHUNK_SIZE = 5.5 * 1024 * 1024 // 5.5MB in bytes


interface UrlDetails {
  media_id: string;
  asset_key: string;
  upload_id: string;
  urls: string[];
  checksum: string;
}

interface DeviceDetails {
  videoDevices : MediaDeviceInfo[];
  audioDevices : MediaDeviceInfo[];
}

const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60)
  const seconds = durationInSeconds % 60
  return `${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`
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
  mediaUrl, questionId, maxDuration, mediaResponse, onSuccessUpload, onDeleteMedia,
}) => {
  const { isRecording, startVideoRecording, stopVideoRecording } = useRecording()
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false)
  const [devices, setDevices] = useState<DeviceDetails>({ videoDevices: [], audioDevices: [] })
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [visualizing, setVisualizing] = useState<boolean>(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [percent, setPercent] = useState<Record<string, number>>({})
  const [recordingState, setRecordingState] = useState<'recording' | 'saved' | 'saving'>('recording')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [showMessage, setShowMessage] = useState<boolean>(false)


  const videoRef = useRef<HTMLVideoElement>(null)
  const promisesArrayRef = useRef<Promise<AxiosResponse<unknown> | undefined>[]>([])
  const urlDetailsRef = useRef<UrlDetails | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const [recStopCountdownRemainingDuration, setRecStopCountdownRemainingDuration] = useState<number>(
    maxDuration,
  )
  const [recStopCountdownTime, setRecStopCountdownTime] = useState<number>(Date.now() + 1000 * maxDuration)
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


  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      const audioDevices = devices.filter(device => device.kind === 'audioinput')

      setDevices({ videoDevices, audioDevices })

      if (videoDevices.length > 0) {
        setSelectedVideoDevice(videoDevices[0].deviceId)
      }

      if (audioDevices.length > 0) {
        setSelectedAudioDevice(audioDevices[0].deviceId)
      }
    }

    getDevices()
  }, [])

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
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            setPercent(prevPercent => ({ ...prevPercent, [chunkNumber]: percentComplete }))
          }
        },
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
      stopVideoRecording()
    } catch (error) {
      console.error('Error completing media upload:', error)
      setError('complete')(I18n.t('assessments.video_response.error_while_uploading'))
    }
  }

  const resetMultipartUpload = (): void => {
    chunksRef.current = []
    setTotalSize(0)
    promisesArrayRef.current = []
    setPercent({})
  }

  const handleRecordingSaved = (data: MediaResponse): void => {
    onSuccessUpload(data)
    setRecordingState('saved')
    setExistingMedia(data)
    resetMultipartUpload()
    successMessage()
  }

  const handleChunkAvailable = useCallback((chunk: Blob): void => {
    const chunkSize = chunk.size
    setTotalSize(prevSize => prevSize + chunkSize)
    chunksRef.current.push({ size: chunkSize })
    const uploadPromise = uploadChunk(chunk)
    promisesArrayRef.current.push(uploadPromise)
  }, [])

  const onStop = useCallback(async (blobUrl: string, lastBlob: Blob, completeBlob: Blob) => {
    setVisualizing(false)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
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
  }, [stream])

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    onChunkAvailable: handleChunkAvailable,
    onStop,
    chunkSize: UPLOAD_CHUNK_SIZE,
  })

  const handleRequestPermission = useCallback(async () => {
    setIsRequestingPermission(true)
    try {
      const mediaStream = await window.navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedAudioDevice },
        video: { deviceId: selectedVideoDevice },
      })
      setStream(mediaStream)
      mediaStreamRef.current = mediaStream

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setPermissionGranted(true)
      startVideoRecording()
      handleStartRecording()
    } catch (error) {
      console.error('Permission denied:', error)
      setError('permission')(I18n.t('assessments.video_response.failed_to_access_permission'))
    } finally {
      setIsRequestingPermission(false)
    }
  }, [])

  useEffect(() => {
    if ((mediaBlobUrl || existingMedia) && videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = mediaBlobUrl || existingMedia.url
    }
  }, [mediaBlobUrl, existingMedia])

  const resetRecorder = useCallback((): void => {
    setPermissionGranted(false)
    setVisualizing(false)
    setStream(null)
    setRecordingState('recording')
    setErrors({})
    setIsUploading(false)
    setRecStopCountdownRemainingDuration(maxDuration)
    setRecStopCountdownTime(Date.now() + 1000 * maxDuration)

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }

    // Reset upload-related state
    resetMultipartUpload()
    chunkCounterRef.current = 0
    handleRequestPermission()
    getUploadUrl()
  }, [maxDuration])

  const handleDiscard = useCallback(async (): Promise<void> => {
    if (existingMedia) {
      try {
        await axiosInstance.delete(`${mediaUrl}/remove_media`, {
          headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') },
          data: { media_id: existingMedia?.id },
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

    resetRecorder()
  }, [mediaUrl, existingMedia, clearBlobUrl, resetRecorder])

  const handleStopRecording = useCallback((): void => {
    stopVideoRecording()
    stopRecording()
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
  }, [stopRecording])

  const handleStartRecording = useCallback((): void => {
    if (!isRecording) {
      startRecording()
    }
    setRecStopCountdownTime(Date.now() + 1000 * maxDuration)
    setRecStopCountdownRemainingDuration(maxDuration)
  }, [startRecording, maxDuration])

  const getMediaStream = useCallback(async (): Promise<MediaStream | null> => {
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

  const handleVideoPlay = (): void => {
    setVisualizing(true)
  }

  const showActionButton = !mediaBlobUrl && !existingVideoUrl

  const renderActionButton = () => {
    if (status === 'recording') {
      return (
        <Button onClick={handleStopRecording} type="primary" danger icon={<StopOutlined />}>
          {I18n.t('assessments.video_response.stop_recording')}
        </Button>
      )
    }

    if (isRequestingPermission) {
      return (
        <Button type="primary" icon={<LoadingOutlined />} disabled>
          {I18n.t('assessments.video_response.requesting_permission')}
        </Button>
      )
    }

    return (
      <Button
        onClick={handleRequestPermission}
        type="primary"
        icon={<VideoCameraOutlined />}
        disabled={isRecording}
      >
        {I18n.t('assessments.video_response.start_recording')}
      </Button>
    )
  }

  const renderDiscardButton = () => (
    <Button disabled={isRecording} onClick={handleDiscard} type="primary" icon={<DeleteOutlined />}>
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
      {(mediaBlobUrl || existingVideoUrl) && !isUploading && !showMessage && renderDiscardButton()}
    </Flex>
  )

  const successMessage = () => {
    setShowMessage(true)

    setTimeout(() => {
      setShowMessage(false)
    }, 3000)
  }

  // Effect to handle countdown for starting recording
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout

    if (status === 'recording') {
      countdownInterval = setInterval(() => {
        setRecStopCountdownRemainingDuration((prev) => {
          if (prev <= 0) {
            clearInterval(countdownInterval)
            handleStopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }


    return () => clearInterval(countdownInterval)
  }, [status])


  const getProgressProps = (): ProgressWithCountdownProps => {
    const getCountdownProps = (value: number, onFinish: () => void, totalDuration: string) => ({
      value,
      format: 'mm:ss',
      onFinish,
      totalDuration,
    })

    if (status === 'idle' && !existingVideoUrl) {
      return {
        percent: 0,
        label: `${I18n.t('assessments.video_response.recording_duration_label')}
        ${formatDuration(maxDuration)}`,
      }
    } if (status === 'recording') {
      return {
        percent: ((maxDuration - recStopCountdownRemainingDuration) / maxDuration) * 100,
        label: I18n.t('assessments.video_response.recording_stop_label'),
        countdownProps: getCountdownProps(recStopCountdownTime,
          handleStopRecording, `${formatDuration(maxDuration)}`),
      }
    } if (isUploading) {
      return {
        percent: Math.round(_.mean(Object.values(percent))),
        label: I18n.t('assessments.video_response.saving'),
        strokeColor: PROGRESS_BAR_SUCCESS,
      }
    }
    if (recordingState === 'saved' || existingVideoUrl) {
      return {
        percent: 100,
        label: I18n.t('assessments.video_response.saved.label'),
        strokeColor: PROGRESS_BAR_SUCCESS,
      }
    }
    return {
      percent: 0,
      label: '',
    }
  }

  const getCameraDevices = () => {
    const items = devices.videoDevices.map(device => ({
      value: device.deviceId,
      label: device.label || `Camera ${device.deviceId}`,
    }))
    return items
  }

  const getMicrophoneDevices = () => {
    const audioDevices = devices.audioDevices.map(device => ({
      value: device.deviceId,
      label: device.label || `Microphone ${device.deviceId}`,
    }))
    return audioDevices
  }

  const handleChangeVideoDevice = (deviceId : string) => {
    setSelectedVideoDevice(deviceId)
  }

  const handleChangeAudioDevice = (deviceId : string) => {
    setSelectedAudioDevice(deviceId)
  }

  return (
    <Flex
      style={{ background: VIDEO_BACKGROUND_COLOR }}
      vertical
      justify="center"
      align="center"
      gap={4}
    >
      <Flex style={{ paddingTop: '16px' }} className={styles.controls} justify="flex-end" align="flex-end">
        <AudioOutlined style={{ alignSelf: 'center' }} />
        <Select
          placeholder={(
            <p style={{ color: PLACEHOLDER_BLACK, margin: 0 }}>
              {I18n.t('assessments.video_response.device_selection.mic')}
            </p>
            )}
          onChange={handleChangeAudioDevice}
          suffixIcon={<DownOutlined style={{ color: PLACEHOLDER_BLACK, pointerEvents: 'none' }} />}
          variant="borderless"
          disabled={status === 'recording'}
          dropdownStyle={{ minWidth: '300px' }}
          options={getMicrophoneDevices()}
        />
        <VideoCameraOutlined style={{ alignSelf: 'center' }} />
        <Select
          disabled={status === 'recording'}
          placeholder={(
            <p style={{ color: PLACEHOLDER_BLACK, margin: 0 }}>
              {I18n.t('assessments.video_response.device_selection.camera')}
            </p>
          )}
          dropdownStyle={{ minWidth: '300px' }}
          suffixIcon={<DownOutlined style={{ color: PLACEHOLDER_BLACK, pointerEvents: 'none' }} />}
          onChange={handleChangeVideoDevice}
          variant="borderless"
          options={getCameraDevices()}
        />
      </Flex>
      <VideoPlayer
        videoRef={videoRef}
        mediaUrl={existingVideoUrl || mediaBlobUrl}
        permissionGranted={permissionGranted}
        status={status}
        onPlay={handleVideoPlay}
        visualizing={visualizing}
        getMediaStream={getMediaStream}
      />
      <Flex className={status === 'recording' ? 'mt-16' : 'unset'} vertical justify="center" align="center" gap={4}>
        <ProgressWithCountdown {...getProgressProps()} />
        {controls}
      </Flex>

      {Object.keys(errors).map(key => (
        <Alert key={key} type="error" message={errors[key]} />
      ))}
    </Flex>
  )
}

export default MediaRecorderComponent
