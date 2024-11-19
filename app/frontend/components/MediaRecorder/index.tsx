import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import axios, { AxiosResponse, AxiosProgressEvent } from 'axios'
import _ from 'lodash'
import {
  Button, Flex, Alert, Space,
  Dropdown,
} from 'antd'
import {
  DeleteOutlined, StopOutlined, VideoCameraOutlined, LoadingOutlined,
  DownOutlined,
  AudioOutlined,
  CheckCircleFilled,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useReactMediaRecorder } from './components/MediaRecorder'
import VideoPlayer from './components/VideoPlayer'
import ProgressWithCountdown, { ProgressWithCountdownProps } from './components/ProgressWIthCountdown'
import styles from './styles.less'

interface MimeType {
  mimeType: string;
  extension: string;
}

const recStartCountdownTotalDuration = 10 // 10 seconds

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
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const MediaRecorderComponent: React.FC<Props> = ({
  mediaUrl, questionId, maxDuration, mediaResponse,
}) => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false)
  const [devices, setDevices] = useState<DeviceDetails>({ videoDevices: [], audioDevices: [] })
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [streamReady, setStreamReady] = useState<boolean>(false)
  const [visualizing, setVisualizing] = useState<boolean>(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [percent, setPercent] = useState<Record<string, number>>({})
  const [recordingState, setRecordingState] = useState<'recording' | 'saved' | 'saving'>('recording')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [showMessage, setShowMessage] = useState<boolean>(false)


  const videoRef = useRef<HTMLVideoElement>(null)
  const promisesArrayRef = useRef<AxiosResponse[]>([])
  const urlDetailsRef = useRef<UrlDetails | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const [recStartCountdownTime, setRecStartCountdownTime] = useState<number>(Date.now()
      + 1000 * recStartCountdownTotalDuration)
  const [recStartCountdownRemainingDuration, setRecStartCountdownRemainingDuration] = useState<number>(
    recStartCountdownTotalDuration,
  )
  const [recStopCountdownRemainingDuration, setRecStopCountdownRemainingDuration] = useState<number>(
    maxDuration,
  )
  const [startRecStartCountdown, setStartRecStartCountdown] = useState<boolean>(false)
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
      const response = await axios.get<UrlDetails>(
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
    if (!existingMedia.id) {
      getUploadUrl()
    }
  }, [getUploadUrl, existingMedia.id])

  const chunkCounterRef = useRef<number>(0)

  const uploadChunk = async (chunk: Blob): Promise<void> => {
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

    try {
      const uploadResp = await axios.put(uploadUrl, chunk, {
        headers: { 'Content-Type': supportedMimeType?.mimeType },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            setPercent(prevPercent => ({ ...prevPercent, [chunkNumber]: percentComplete }))
          }
        },
      })

      promisesArrayRef.current.push(uploadResp)
      chunkCounterRef.current += 1
      removeError('upload')
    } catch (err) {
      console.error('Error uploading chunk:', err)
      setError('upload')((err as Error).message)
    }
  }

  const completeMediaUpload = async (): Promise<void> => {
    if (!urlDetailsRef.current) {
      console.error('No URL details available for completing upload')
      setError('complete')('Failed to complete upload: No URL details available')
      return
    }

    try {
      const resolvedArray = await Promise.all(promisesArrayRef.current)
      const uploadPartsArray = resolvedArray.map((resolvedPromise, index) => ({
        etag: resolvedPromise.headers.etag,
        part_number: index + 1,
      }))

      const { data } = await axios.put(
        `${mediaUrl}/complete_multipart_upload`,
        {
          parts: uploadPartsArray,
          media_id: urlDetailsRef.current.media_id,
          asset_key: urlDetailsRef.current.asset_key,
          upload_id: urlDetailsRef.current.upload_id,
          file_size: totalSize,
          checksum: urlDetailsRef.current.checksum,
          content_type: supportedMimeType,
        },
        {
          headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') },
        },
      )

      setExistingMedia(data)
      handleRecordingSaved()
      resetMultipartUpload()
      successMessage()
    } catch (error) {
      console.error('Error completing media upload:', error)
      setError('complete')('An unknown error occurred while completing the upload')
    }
  }

  const resetMultipartUpload = (): void => {
    chunksRef.current = []
    setTotalSize(0)
    promisesArrayRef.current = []
    setPercent({})
  }

  const handleRecordingSaved = (): void => {
    setRecordingState('saved')
  }

  const handleChunkAvailable = useCallback((chunk: Blob): void => {
    const chunkSize = chunk.size
    setTotalSize(prevSize => prevSize + chunkSize)
    chunksRef.current.push({ size: chunkSize })
    uploadChunk(chunk)
  }, [])

  const onStop = useCallback((blobUrl: string, blob: Blob) => {
    setVisualizing(false)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setIsUploading(true)
    uploadChunk(blob)
      .then(() => completeMediaUpload())
      .finally(() => setIsUploading(false))
  }, [])

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
        videoRef.current.onloadedmetadata = () => {
          setStreamReady(true)
          setRecStartCountdownTime(Date.now() + 1000 * recStartCountdownTotalDuration)
          setRecStartCountdownRemainingDuration(recStartCountdownTotalDuration)
          setStartRecStartCountdown(true)
        }
      }
      setPermissionGranted(true)
    } catch (error) {
      console.error('Permission denied:', error)
      setError('permission')('Failed to access camera and microphone')
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
    setStreamReady(false)
    setVisualizing(false)
    setStream(null)
    setRecordingState('recording')
    setErrors({})
    setIsUploading(false)
    setStartRecStartCountdown(false)
    setRecStartCountdownRemainingDuration(recStartCountdownTotalDuration)
    setRecStopCountdownRemainingDuration(maxDuration)
    setRecStartCountdownTime(Date.now() + 1000 * recStartCountdownTotalDuration)
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
        await axios.delete(`${mediaUrl}/remove_media`, {
          headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') },
          data: { media_id: existingMedia.id },
        })
        setExistingVideoUrl(null)
        clearBlobUrl()
      } catch (error) {
        console.error('Error discarding existing video:', error)
        setError('discard')('Failed to discard existing video')
        return
      }
    } else {
      clearBlobUrl()
    }

    resetRecorder()
  }, [mediaUrl, existingMedia, clearBlobUrl, resetRecorder])

  const handleStopRecording = useCallback((): void => {
    stopRecording()
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
  }, [stopRecording])

  const handleStartRecording = useCallback((): void => {
    startRecording()
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
          Stop Recording
        </Button>
      )
    }

    if (isRequestingPermission) {
      return (
        <Button type="primary" icon={<LoadingOutlined />} disabled>
          Requesting Permission...
        </Button>
      )
    }

    return (
      <Button
        onClick={handleRequestPermission}
        type="primary"
        icon={<VideoCameraOutlined />}
        disabled={startRecStartCountdown} // Disable the button during countdown
      >
        {startRecStartCountdown ? 'Starting Soon...' : 'Start Recording'}
      </Button>
    )
  }

  const renderDiscardButton = () => (
    <Button onClick={handleDiscard} type="primary" icon={<DeleteOutlined />}>
      Discard & Record Again
    </Button>
  )

  const renderSuccessText = () => (
    <>
      <CheckCircleFilled style={{ color: 'var(--ant-primary-color)' }} />
      <span>Response Recorded</span>
    </>
  )

  const controls = (

    <Flex gap={8}>
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

  useEffect(() => {
    // Reset chunk counter when starting a new recording
    if (status === 'idle') {
      chunkCounterRef.current = 0
    }
  }, [status])

  // Effect to handle countdown for starting recording
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout

    if (startRecStartCountdown && status === 'idle') {
      countdownInterval = setInterval(() => {
        setRecStartCountdownRemainingDuration((prev) => {
          if (prev <= 0) {
            clearInterval(countdownInterval)
            handleStartRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(countdownInterval)
  }, [startRecStartCountdown, status])

  // Effect to handle countdown for stopping recording
  useEffect(() => {
    let stopCountdownInterval: NodeJS.Timeout

    if (status === 'recording') {
      stopCountdownInterval = setInterval(() => {
        setRecStopCountdownRemainingDuration((prev) => {
          if (prev <= 0) {
            clearInterval(stopCountdownInterval)
            handleStopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(stopCountdownInterval)
  }, [status])

  const getProgressProps = (): ProgressWithCountdownProps => {
    if (status === 'idle') {
      return {
        percent: ((recStartCountdownTotalDuration
            - recStartCountdownRemainingDuration) / recStartCountdownTotalDuration) * 100,
        label: 'Recording will start in',
        countdownProps: startRecStartCountdown ? {
          value: recStartCountdownTime,
          format: 'mm:ss',
          onFinish: handleStartRecording,
          totalDuration: `00:${recStartCountdownTotalDuration} mins`,
        } : undefined,
      }
    } if (status === 'recording') {
      return {
        percent: ((maxDuration - recStopCountdownRemainingDuration) / maxDuration) * 100,
        label: 'Recording will stop in',
        countdownProps: {
          value: recStopCountdownTime,
          format: 'mm:ss',
          onFinish: handleStopRecording,
          totalDuration: `${formatDuration(maxDuration)} mins`,
        },
      }
    } if (isUploading) {
      return {
        percent: Math.round(_.mean(Object.values(percent))),
        label: 'Saving video...',
        strokeColor: '#009C37',
      }
    }
    if (recordingState === 'saved') {
      return {
        percent: 100,
        label: 'Video Saved',
        strokeColor: '#009C37',
      }
    }
    return {
      percent: 0,
      label: '',
    }
  }

  const getCameraDevices = () : MenuProps['items'] => {
    const items = devices.videoDevices.map(device => ({
      key: device.deviceId,
      label:
  <span
    role="button"
    tabIndex={0}
    onClick={() => handleChangeVideoDevice(device.deviceId)}
  >
    {device.label || `Camera ${device.deviceId}` }
  </span>,
    }))
    return items
  }

  const getMicrophoneDevices = () : MenuProps['items'] => {
    const audioDevices = devices.audioDevices.map(device => ({
      key: device.deviceId,
      label:
  <span
    role="button"
    tabIndex={0}
    onClick={() => handleChangeAudioDevice(device.deviceId)}
  >
    {device.label || `Microphone ${device.deviceId}` }
  </span>,
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
    <Flex vertical justify="center" align="center" gap={4}>
      <Flex className={styles.controls} justify="flex-end" align="flex-end" gap={8}>
        <Dropdown menu={{ items: getMicrophoneDevices() }}>
          <Space>
            <AudioOutlined />
            Mic
            <DownOutlined />
          </Space>
        </Dropdown>
        <Dropdown menu={{ items: getCameraDevices() }}>
          <Space>
            <VideoCameraOutlined />
            Camera
            <DownOutlined />
          </Space>
        </Dropdown>
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
      <Flex vertical justify="center" align="center" gap={4}>
        {permissionGranted && streamReady && (
        <ProgressWithCountdown {...getProgressProps()} />
        )}
        {controls}
      </Flex>

      {Object.keys(errors).map(key => (
        <Alert key={key} type="error" message={errors[key]} />
      ))}
    </Flex>
  )
}

export default MediaRecorderComponent
