/* eslint-disable react/no-unused-state */
import { createRef, Component } from 'react'
import PropTypes from 'prop-types'

import { isEqual, debounce } from 'lodash'
import cs from 'classnames'
import * as faceapi from 'face-api.js'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { Overlay } from './Overlay'
import styles from './Tracker.less'

const FACE_TO_HEAD_RATIO = 0.3 // Assume Head is 30% bigger than the face

class Tracker extends Component {
  messages = {
    frame: I18n().t('assessments.video_response.tracker.frame'),
    ready: I18n().t('assessments.video_response.tracker.ready'),
    forward: I18n().t('assessments.video_response.tracker.forward'),
    backward: I18n().t('assessments.video_response.tracker.backward'),
  }

  trackingTimeout = null

  isUnmounted = false

  constructor (props) {
    super(props)

    this.canvasRef = createRef()
    this.state = {
      showOverlay: true,
      visibleMessages: ['frame', 'ready'],
      frame: 'person',
      isTracking: false,
      faceDetectionModelLoaded: false,
    }
  }

  componentWillMount () {
    const { videoRef } = this.props
    this.videoEl = videoRef
    this.calculateBoundaries()
    this.loadFaceDetectionNet()
  }

  componentDidMount () {
    this.setupBoundingBox()
    window.addEventListener('resize', this.calculateBoundaries)
  }

  componentDidUpdate () {
    const { prevProps } = this.state
    const { fitInFrame, trackerOptions } = this.props

    if (
      prevProps.fitInFrame !== fitInFrame
      || !isEqual(prevProps.box, trackerOptions.box)
      || !isEqual(prevProps.object, trackerOptions.object)) {
      this.calculateBoundaries()
    }
  }

  componentWillUnmount () {
    this.isUnmounted = true
    this.stopTracking()
    window.removeEventListener('resize', this.calculateBoundaries)
  }

  onNoFaceDetected = debounce(() => {
    const { isTracking } = this.state
    if (!isTracking) return
    this.setState({ showOverlay: true, visibleMessages: ['frame'] })
  }, 2000, { maxWait: 2000 })

  setupBoundingBox () {
    const { boundaries: { box } } = this.state
    const { offsetHeight, offsetWidth } = this.videoEl
    const canvas = this.canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = offsetWidth
    canvas.height = offsetHeight

    context.rect(box.x, box.y, box.width, box.height)
    this.contextRef = context
  }

  closestDivisible = (n, m) => {
    const q = Math.floor(n / m)
    const first = m * q
    const second = (n * m) > 0 ? (m * (q + 1)) : (m * (q - 1))
    if (Math.abs(n - first) < Math.abs(n - second)) return first
    return second
  }

  isInSize = (rect) => {
    const { thresholds: { minHeight, maxHeight } } = this.state

    if (rect.height > maxHeight) return 1
    if (rect.height < minHeight) return -1

    return 0
  }

  isInBoundary = (rect) => {
    const corners = [
      { x: rect.x, y: rect.y }, // topleft
      { x: rect.x + rect.width, y: rect.y }, // topRight
      { x: rect.x, y: rect.height + rect.y }, // bottomLeft
      { x: rect.width + rect.x, y: rect.height + rect.y }, // bottomRight
    ]
    const inBoundary = corners.every(corner => this.contextRef.isPointInPath(corner.x, corner.y))
    return inBoundary
  }

  calculateBoundaries = () => {
    const {
      fitInFrame,
      trackerOptions: { box, object },
    } = this.props
    const { offsetWidth, offsetHeight } = this.videoEl

    const boxHeight = box.height * offsetHeight
    const boxWidth = box.width * offsetWidth
    const personHeight = object.size * offsetHeight
    const boundaries = {
      box: {
        x: box.x * offsetWidth,
        y: box.y * offsetHeight,
        width: boxWidth,
        height: boxHeight,
      },
      canvas: {
        width: offsetWidth,
        height: offsetHeight,
      },
    }

    // min, max box calculations
    const thresholdHeight = object.threshold * personHeight

    const minHeight = personHeight - thresholdHeight
    const maxHeight = personHeight + thresholdHeight

    const thresholds = {
      minHeight,
      maxHeight,
    }

    const prevProps = {
      fitInFrame,
      box,
      object,
    }

    this.setState({ boundaries, thresholds, prevProps })
  }

  adjustedHeadBox (result) {
    const { box } = result
    const { offsetWidth } = this.videoEl
    const headHeight = box.height + (box.height * FACE_TO_HEAD_RATIO)
    const x = (offsetWidth - box.x - box.width) // Flip x coordinates as image is mirrored
    const y = box.y - (box.height * FACE_TO_HEAD_RATIO)

    return {
      x,
      y,
      width: box.width,
      height: headHeight,
    }
  }

  async track () {
    const { isTracking } = this.state
    const { offsetWidth, offsetHeight } = this.videoEl
    // tinyFaceDetector requires the size (offsetHeight) to be divisible by 32
    const inputSize = this.closestDivisible(offsetHeight, 32)

    const options = new faceapi.TinyFaceDetectorOptions({ inputSize })
    const detections = await faceapi.detectSingleFace(this.videoEl, options)

    let inSize
    let inBoundary
    const visibleMessages = []
    if (detections) {
      this.onNoFaceDetected.cancel()
      const result = faceapi.resizeResults(detections, { width: offsetWidth, height: offsetHeight })
      const headBox = this.adjustedHeadBox(result)

      inBoundary = this.isInBoundary(headBox)
      inSize = this.isInSize(headBox)

      const showOverlay = !inBoundary || inSize !== 0

      if (!inBoundary) visibleMessages.push('frame')
      if (inSize !== 0) visibleMessages.push(inSize < 0 ? 'forward' : 'backward')

      this.setState({ showOverlay, visibleMessages })
    } else {
      // No face
      if (!isTracking) {
        return
      }
      this.onNoFaceDetected()
    }

    if (isTracking) {
      this.trackingTimeout = setTimeout(() => this.track(), 500)
    }
  }

  drawThresholds () {
    const { boundaries: { box }, thresholds: { minHeight, maxHeight } } = this.state
    const canvas = this.canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const minRect = {
        x: box.x + box.width / 2 - (minHeight / 2),
        y: box.y + box.height / 2 - (minHeight / 2),
        width: minHeight,
        height: minHeight,
      }
      const maxRect = {
        x: box.x + box.width / 2 - (maxHeight / 2),
        y: box.y + box.height / 2 - (maxHeight / 2),
        width: maxHeight,
        height: maxHeight,
      }
      ctx.strokeStyle = '#FF0000'
      ctx.strokeRect(minRect.x, minRect.y, minRect.width, minRect.height)
      ctx.strokeStyle = '#FF00FF'
      ctx.strokeRect(maxRect.x, maxRect.y, maxRect.width, maxRect.height)
    }
  }

  initTracker () {
    this.track()
  }

  loadFaceDetectionNet () {
    return Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/face-api/models'),
    ]).then(this.setState({ faceDetectionModelLoaded: true }))
  }

  startTracking () {
    this.setState({ showOverlay: false, frame: 'box', isTracking: true })
    this.initTracker()
    // Uncomment this to draw thresholds for testing
    // this.drawThresholds()
  }

  stopTracking () {
    const { isTracking } = this.state
    clearTimeout(this.trackingTimeout)
    if (!isTracking || this.isUnmounted) {
      return
    }

    this.setState({ showOverlay: false, frame: 'person', isTracking: false })
  }

  render () {
    const {
      showOverlay, frame, boundaries, visibleMessages,
    } = this.state
    const {
      trackerOptions,
    } = this.props

    return (
      <div className={styles.canvasContainer}>
        <canvas ref={this.canvasRef} className={styles.canvas} />

        {showOverlay && (
          <Overlay
            boundaries={boundaries}
            ref={(instance) => { this.overlay = instance }}
            frame={frame}
            trackerOptions={trackerOptions}
          />
        )}

        {showOverlay && (
          <div className={styles.help}>
            {visibleMessages.includes('frame') && (
              <div className={cs(styles.message)}>{this.messages.frame}</div>
            )}
            {visibleMessages.includes('ready') && (
              <div className={cs(styles.message)}>{this.messages.ready}</div>
            )}
            {visibleMessages.includes('forward') && (
              <div className={cs(styles.message)}>{this.messages.forward}</div>
            )}
            {visibleMessages.includes('backward') && (
              <div className={cs(styles.message)}>{this.messages.backward}</div>
            )}
          </div>
        )}
      </div>
    )
  }
}

Tracker.popTypes = {
  fitInFrame: PropTypes.string,
  trackerOptions: PropTypes.object,
  videoRef: PropTypes.instanceOf(Element).isRequired,
}

export default Tracker
