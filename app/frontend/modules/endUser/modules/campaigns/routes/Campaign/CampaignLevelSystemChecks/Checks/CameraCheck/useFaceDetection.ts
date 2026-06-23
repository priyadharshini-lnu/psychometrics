import {
  useRef, useState, useEffect, useCallback,
} from 'react'
import {
  FaceDetector, PoseLandmarker, FilesetResolver,
} from '@mediapipe/tasks-vision'

const DETECTION_INTERVAL_MS = 500
const POSE_GRACE_PERIOD_SAMPLES = 5
const MAX_CONSECUTIVE_ERRORS = 3

const WASM_PATH = '/mediapipe/wasm'
const MODEL_PATH = '/mediapipe/models/blaze_face_short_range.tflite'
const POSE_MODEL_PATH = '/mediapipe/models/pose_landmarker_lite.task'

export interface FaceDetectionResult {
  isFaceCurrentlyDetected: boolean
  faceDetectionRatio: number
  totalSamples: number
  canvasRef: React.RefObject<HTMLCanvasElement>
  detectionMethod: 'face' | 'pose' | 'none'
  faceModelRatio: number
  poseModelRatio: number
  detectionError: boolean
  reset: () => void
}

interface FaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>
  isActive: boolean
  showOverlay?: boolean
}

export const useFaceDetection = ({
  videoRef,
  isActive,
  showOverlay = false,
}: FaceDetectionOptions): FaceDetectionResult => {
  const faceDetectorRef = useRef<FaceDetector | null>(null)
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null)
  const poseInitializingRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const statsRef = useRef({
    totalSamples: 0,
    faceDetectedSamples: 0,
    faceModelDetected: 0,
    poseModelDetected: 0,
    consecutiveFaceNotFound: 0,
    consecutiveErrors: 0,
    lastTimestamp: 0,
  })

  const [isFaceCurrentlyDetected, setIsFaceCurrentlyDetected] = useState(false)
  const [faceDetectionRatio, setFaceDetectionRatio] = useState(0)
  const [faceModelRatio, setFaceModelRatio] = useState(0)
  const [poseModelRatio, setPoseModelRatio] = useState(0)
  const [totalSamples, setTotalSamples] = useState(0)
  const [detectionMethod, setDetectionMethod] = useState<'face' | 'pose' | 'none'>('none')
  const [detectionError, setDetectionError] = useState(false)

  const initializeDetector = useCallback(async () => {
    if (faceDetectorRef.current) return

    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH)

      try {
        faceDetectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
          runningMode: 'VIDEO',
        })
      } catch {
        faceDetectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'CPU' },
          runningMode: 'VIDEO',
        })
      }
    } catch (error) {
      console.error('[FaceDetection] Failed to initialize face detector:', error)
      setDetectionError(true)
    }
  }, [])

  const initializePoseDetector = useCallback(async () => {
    if (poseLandmarkerRef.current || poseInitializingRef.current) return

    poseInitializingRef.current = true

    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH)

      try {
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL_PATH, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        })
      } catch {
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL_PATH, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        })
      }
    } catch (error) {
      console.error('[FaceDetection] Failed to initialize pose detector:', error)
    } finally {
      poseInitializingRef.current = false
    }
  }, [])

  const drawDetections = useCallback((
    detections: { boundingBox?: {
      originX: number; originY: number; width: number; height: number
    } }[],
    poseLandmarks: { x: number; y: number; visibility?: number }[][] = [],
  ) => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 3

    detections.forEach((detection) => {
      const box = detection.boundingBox
      if (!box) return
      ctx.strokeRect(box.originX, box.originY, box.width, box.height)
    })

    // Pose landmarks: 0=nose, 2=left eye, 5=right eye
    poseLandmarks.forEach((landmarks) => {
      if (landmarks.length < 6) return

      const nose = landmarks[0]
      const leftEye = landmarks[2]
      const rightEye = landmarks[5]

      const eyeMidX = ((leftEye.x + rightEye.x) / 2) * canvas.width
      const eyeMidY = ((leftEye.y + rightEye.y) / 2) * canvas.height
      const eyeSpan = Math.abs(rightEye.x - leftEye.x) * canvas.width
      const headRadius = eyeSpan * 1.5

      ctx.strokeStyle = '#00FF00'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(eyeMidX, eyeMidY, headRadius, 0, 2 * Math.PI)
      ctx.stroke()

      // Draw small dots on detected landmarks
      const points = [nose, leftEye, rightEye]
      ctx.fillStyle = '#00FF00'
      points.forEach((pt) => {
        ctx.beginPath()
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    })
  }, [videoRef])

  const runDetection = useCallback(() => {
    const video = videoRef.current
    const detector = faceDetectorRef.current

    if (!video || !detector) return
    if (video.readyState < 2) return

    try {
      const now = performance.now()
      if (now <= statsRef.current.lastTimestamp) return
      statsRef.current.lastTimestamp = now

      const result = detector.detectForVideo(video, now)
      const faceModelDetected = result.detections.length > 0

      if (faceModelDetected) {
        statsRef.current.consecutiveFaceNotFound = 0
      } else {
        statsRef.current.consecutiveFaceNotFound += 1
        if (
          statsRef.current.consecutiveFaceNotFound >= POSE_GRACE_PERIOD_SAMPLES
          && !poseLandmarkerRef.current
          && !poseInitializingRef.current
        ) {
          initializePoseDetector()
        }
      }

      statsRef.current.consecutiveErrors = 0

      let poseModelDetected = false
      let poseLandmarks: { x: number; y: number; visibility?: number }[][] = []

      if (poseLandmarkerRef.current) {
        const poseResult = poseLandmarkerRef.current.detectForVideo(
          video,
          now + 1,
        )
        poseLandmarks = poseResult.landmarks

        if (poseLandmarks.length > 0) {
          const landmarks = poseLandmarks[0]
          const nose = landmarks[0]
          const leftEye = landmarks[2]
          const rightEye = landmarks[5]

          poseModelDetected = (nose.visibility ?? 0) > 0.5
            && (leftEye.visibility ?? 0) > 0.5
            && (rightEye.visibility ?? 0) > 0.5
        }
      }

      const faceFound = faceModelDetected || poseModelDetected
      let currentMethod: 'face' | 'pose' | 'none' = 'none'

      if (faceModelDetected) {
        currentMethod = 'face'
      } else if (poseModelDetected) {
        currentMethod = 'pose'
      }

      if (showOverlay) {
        if (faceModelDetected) {
          drawDetections(result.detections)
        } else if (poseModelDetected) {
          drawDetections([], poseLandmarks)
        } else {
          drawDetections([])
        }
      }

      setDetectionMethod(currentMethod)

      statsRef.current.totalSamples += 1
      if (faceFound) {
        statsRef.current.faceDetectedSamples += 1
      }
      if (faceModelDetected) {
        statsRef.current.faceModelDetected += 1
      } else if (poseModelDetected) {
        statsRef.current.poseModelDetected += 1
      }

      setIsFaceCurrentlyDetected(faceFound)
      setTotalSamples(statsRef.current.totalSamples)

      const total = statsRef.current.totalSamples
      const ratio = total > 0
        ? statsRef.current.faceDetectedSamples / total
        : 0
      setFaceDetectionRatio(ratio)
      setFaceModelRatio(total > 0 ? statsRef.current.faceModelDetected / total : 0)
      setPoseModelRatio(total > 0 ? statsRef.current.poseModelDetected / total : 0)
    } catch (error) {
      console.error('[FaceDetection] Detection error:', error)
      statsRef.current.consecutiveErrors += 1
      if (statsRef.current.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setDetectionError(true)
      }
    }
  }, [videoRef, drawDetections, showOverlay, initializePoseDetector])

  const reset = useCallback(() => {
    statsRef.current = {
      totalSamples: 0,
      faceDetectedSamples: 0,
      faceModelDetected: 0,
      poseModelDetected: 0,
      consecutiveFaceNotFound: 0,
      consecutiveErrors: 0,
      lastTimestamp: 0,
    }
    setIsFaceCurrentlyDetected(false)
    setFaceDetectionRatio(0)
    setFaceModelRatio(0)
    setPoseModelRatio(0)
    setTotalSamples(0)
    setDetectionMethod('none')
    setDetectionError(false)

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    initializeDetector().then(() => {
      if (faceDetectorRef.current) {
        intervalRef.current = setInterval(
          runDetection,
          DETECTION_INTERVAL_MS,
        )
      } else {
        console.error('[FaceDetection] Detector not initialized')
      }
    })

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, initializeDetector, runDetection])

  useEffect(() => () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (faceDetectorRef.current) {
      faceDetectorRef.current.close()
      faceDetectorRef.current = null
    }
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close()
      poseLandmarkerRef.current = null
    }
  }, [])

  return {
    isFaceCurrentlyDetected,
    faceDetectionRatio,
    totalSamples,
    canvasRef,
    detectionMethod,
    faceModelRatio,
    poseModelRatio,
    detectionError,
    reset,
  }
}
