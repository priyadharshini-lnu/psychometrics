/* eslint-disable react/no-unused-state */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { isEqual } from 'lodash'
import cs from 'classnames'
import * as faceapi from 'face-api.js'
import Watchman from 'libs/survey/store/StoreWatchman'
import { Overlay } from './Overlay'
import styles from './Tracker.scss'

const FACE_TO_HEAD = 0.3 // Assume Head is 30% bigger than the face

class Tracker extends Component {
  messages = {
    frame: Watchman.I18n().t('assessments.video_response.tracker.frame'),
    ready: Watchman.I18n().t('assessments.video_response.tracker.ready'),
    forward: Watchman.I18n().t('assessments.video_response.tracker.forward'),
    backward: Watchman.I18n().t('assessments.video_response.tracker.backward'),
  }

  constructor (props) {
    super(props)

    this.canvasRef = React.createRef()
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
      || !isEqual(prevProps.box, trackerOptions[fitInFrame].box)
      || !isEqual(prevProps.object, trackerOptions[fitInFrame].object)) {
      this.calculateBoundaries()
    }
  }

  componentWillUnmount () {
    this.stopTracking()
    window.removeEventListener('resize', this.calculateBoundaries)
  }

  setupBoundingBox () {
    const { boundaries } = this.state
    const { offsetHeight, offsetWidth } = this.videoEl
    const canvas = this.canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = offsetWidth
    canvas.height = offsetHeight

    context.rect(boundaries.x, boundaries.y, boundaries.boxWidth, boundaries.height)
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
      trackerOptions: {
        [fitInFrame]: { box, object },
      },
    } = this.props
    const { offsetWidth, offsetHeight } = this.videoEl

    const height = box.height * offsetHeight
    const boxWidth = box.width * offsetWidth
    const personHeight = object.size * offsetHeight
    const boundaries = {
      x: box.x * offsetWidth,
      y: box.y * offsetHeight,
      height,
      boxWidth,
      offsetHeight,
      offsetWidth,
      box,
      object,
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
    const { relativeBox } = result
    const { boundaries: { offsetWidth, offsetHeight } } = this.state

    const headWidth = offsetWidth * relativeBox.width
    const faceHeight = offsetHeight * relativeBox.height
    const headHeight = faceHeight + (faceHeight * FACE_TO_HEAD)
    const x = offsetWidth * (1 - relativeBox.x - relativeBox.width) // Flip x coordinates as image is mirrored
    const y = offsetHeight * relativeBox.y - (faceHeight * FACE_TO_HEAD)

    return {
      x,
      y,
      width: headWidth,
      height: headHeight,
    }
  }

  async track () {
    const { isTracking } = this.state
    const { offsetHeight } = this.videoEl

    // tinyFaceDetector requires the size (offsetHeight) to be divisible by 32
    const inputSize = this.closestDivisible(offsetHeight, 32)
    const scoreThreshold = 0.5

    const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    const result = await faceapi.detectSingleFace(this.videoEl, options)

    let inSize
    let inBoundary
    const visibleMessages = []
    if (result) {
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
      visibleMessages.push('frame')
      this.setState({ showOverlay: true, visibleMessages })
    }

    if (isTracking) {
      setTimeout(() => this.track(), 1000)
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
  }

  stopTracking () {
    const { isTracking } = this.state
    if (!isTracking) {
      return
    }

    this.setState({ showOverlay: false, frame: 'person', isTracking: false })

    // Uncomment following lines if we're doing drawDetections (see: `track` method)
    // const { offsetWidth, offsetHeight } = this.videoEl
    // this.contextRef.clearRect(0, 0, offsetWidth, offsetHeight)
  }

  render () {
    const {
      showOverlay, frame, boundaries, visibleMessages,
    } = this.state

    return (
      <div className={styles.canvasContainer}>
        <canvas ref={this.canvasRef} className={styles.canvas} />

        {showOverlay && (
          <Overlay
            boundaries={boundaries}
            ref={(instance) => { this.overlay = instance }}
            frame={frame}
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
