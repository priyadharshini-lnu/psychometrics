import { useState, useEffect, useRef } from 'react'

const { I18n } = window

interface DeviceDetails {
  videoDevices: MediaDeviceInfo[]
  audioDevices: MediaDeviceInfo[]
}

interface UseMediaPreviewParams {
  shouldSkipPreview: boolean // true when mediaBlobUrl or existingVideoUrl exists
  isRecording: boolean
  requestMediaStream: (constraints: MediaStreamConstraints) => Promise<MediaStream | null>
  onError?: (error: string) => void
}

interface UseMediaPreviewReturn {
  previewStream: MediaStream | null
  permissionGranted: boolean
  devices: DeviceDetails
  selectedVideoDevice: string
  selectedAudioDevice: string
  setSelectedVideoDevice: (deviceId: string) => void
  setSelectedAudioDevice: (deviceId: string) => void
  setPermissionGranted: (granted: boolean) => void
  setPreviewStream: (stream: MediaStream | null) => void
}

export const VIDEO_RESOLUTION = {
  width: { min: 640, ideal: 640, max: 1280 },
  height: { min: 480, ideal: 480, max: 920 },
}

export const useMediaPreview = ({
  shouldSkipPreview,
  isRecording,
  requestMediaStream,
  onError,
}: UseMediaPreviewParams): UseMediaPreviewReturn => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false)
  const [devices, setDevices] = useState<DeviceDetails>({ videoDevices: [], audioDevices: [] })
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const mediaStreamRef = useRef<MediaStream | null>(null)


  useEffect(() => {
    const initDevices = async () => {
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput')
        const audioDevices = allDevices.filter(device => device.kind === 'audioinput')

        setDevices({ videoDevices, audioDevices })
        if (videoDevices.length > 0) setSelectedVideoDevice(videoDevices[0].deviceId)
        if (audioDevices.length > 0) setSelectedAudioDevice(audioDevices[0].deviceId)
      } catch (error) {
        console.error('Error enumerating devices:', error)
        if (onError) {
          onError(I18n.t('assessments.video_response.failed_to_access_permission'))
        }
      } finally {
        stream?.getTracks().forEach(track => track.stop())
      }
    }

    initDevices()
  }, [])

  useEffect(() => {
    const requestPreview = async () => {
      if (shouldSkipPreview || isRecording) {
        return
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }

      try {
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

        if (mediaStream) {
          mediaStreamRef.current = mediaStream
          setTimeout(() => {
            setPreviewStream(mediaStream)
            setPermissionGranted(true)
          }, 1000)
        }
      } catch (error) {
        console.error('Failed to get preview:', error)
        if (onError) {
          onError(I18n.t('assessments.video_response.failed_to_access_permission'))
        }
      }
    }

    requestPreview()
  }, [selectedVideoDevice, selectedAudioDevice, shouldSkipPreview])

  return {
    previewStream,
    permissionGranted,
    devices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    setPermissionGranted,
    setPreviewStream,
  }
}
