import React, { Component } from 'react'
import PropTypes from 'prop-types'

import cs from 'classnames'
import * as faceapi from 'face-api.js'
import { Overlay } from './Overlay'
import styles from './Tracker.scss'

class Tracker extends Component {
  constructor () {
    super()

    this.state = {
      showOverlay: true,
      frame: 'person',
      isTracking: false,
      faceDetectionModelLoaded: false,
    }
  }

  loadFaceDetectionNet () {
    return Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/face-api/models'),
    ]).then(this.setState({ faceDetectionModelLoaded: true }))
  }

  componentWillMount () {
    const { fitInFrame, trackerOptions: { [fitInFrame]: { box, object } } } = this.props
    const playerEl = document.querySelector('video')

    const { offsetWidth, offsetHeight } = playerEl

    const width = box.width * offsetWidth
    const height = box.height * offsetHeight
    const boundaries = {
      x: box.x * offsetWidth,
      y: box.y * offsetHeight,
      width: width,
      height:height,
      area: width * height,
    }

    // min, max box calculations
    const thresholdWidth = object.threshold * offsetWidth
    const thresholdHeight = object.threshold * offsetHeight

    const minHeight = (object.size * offsetHeight) - thresholdHeight
    const minWidth = (object.size * offsetWidth) - thresholdWidth
    const maxHeight = (object.size * offsetHeight) + thresholdHeight
    const maxWidth = (object.size * offsetWidth) + thresholdWidth

    const thresholds = {
      areaMin: minHeight * minWidth,
      areaMax: maxHeight * maxWidth,
    }

    // eslint-disable-next-line react/no-unused-state
    this.setState({ boundaries, thresholds, playerEl })

    this.loadFaceDetectionNet()
  }

  componentDidMount () {
    this.setupBoundingBox()
  }

  setupBoundingBox () {
    const {
      boundaries,
      playerEl: { offsetHeight, offsetWidth },
    } = this.state
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')

    canvas.width = offsetWidth
    canvas.height = offsetHeight

    context.rect(boundaries.x, boundaries.y, boundaries.width, boundaries.height)
    this.contextRef = context
  }

  closesetDivisible = (n, m) => {
    let q = Math.floor(n / m)
    let first = m * q
    let second = (n * m) > 0 ? (m * (q + 1)) : (m * (q - 1))
    if (Math.abs(n - first) < Math.abs(n - second)) return first
    return second
  }

  async track(videoEl) {
    const { isTracking } = this.state
    const { offsetHeight } = videoEl

    // tinyFaceDetector requires the size (offsetHeight) to be divisible by 32 
    const inputSize = this.closesetDivisible(offsetHeight, 32)
    const scoreThreshold = 0.5

    const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    let result = await faceapi.detectSingleFace(videoEl, options)

    if (result) {
      // There is a face
      if (this.isInBoundary(result.box)) {
        console.info("Face is in boundary")
        this.setState({ showOverlay: false })
        this.hideElements([this.helpTextRef])
      } else {
        this.setState({ showOverlay: true })
        this.showElements([this.helpTextRef])
      }
    } else {
      // No face
      this.setState({ showOverlay: true })
      this.showElements([this.helpTextRef])
    }

    if (isTracking) {
      setTimeout(() => this.track(videoEl))
    }
  }

  initTracker() {
    const { playerEl } = this.state

    this.track(playerEl)

    const helperEl = document.querySelector('#help')
    const helpText = helperEl.querySelector('#helpText')

    this.helpTextRef = helpText
    this.hideElements([...helperEl.children])
  }

  isProperSize = (rect) => {
    const { thresholds, playerEl } = this.state
    const { offsetHeight, offsetWidth } = playerEl

    const boxArea = rect.width * rect.height

    return boxArea > thresholds.areaMin && boxArea < thresholds.areaMax
  }

  isInBoundary = (rect) => {
    const corners = [
      { ...rect.topLeft }, // topleft
      { ...rect.topRight }, // topRight
      { ...rect.bottomLeft }, // bottomLeft
      { ...rect.bottomRight }, // bottomRight
    ]

    const inBoundary = corners.every(corner => this.contextRef.isPointInPath(corner._x, corner._y))
    return inBoundary
  }

  showElements (targets) {
    targets.forEach(target => target.classList.remove('hidden'))
  }

  hideElements (targets) {
    targets.forEach(target => target.classList.add('hidden'))
  }

  startTracking () {
    this.setState({ showOverlay: true, frame: 'box', isTracking: true })
    this.initTracker()
  }

  stopTracking () {
    const { isTracking } = this.state
    if (!isTracking) {
      return
    }

    this.setState({ showOverlay: false, frame: 'person', isTracking: false })
  }

  render () {
    const { fitInFrame } = this.props
    const { showOverlay, frame, boundaries: position } = this.state

    return (
      <div className={styles.canvasContainer}>
        <canvas id="canvas" className={styles.canvas} />

        {showOverlay && (
          <Overlay
            position={position}
            ref={(instance) => { this.overlay = instance }}
            resolve={() => import(`./images/${frame}.svg`)}
          />
        )}
        {showOverlay && (
          <div id="help" className={cs(styles.help, styles[fitInFrame])}>
            <div id="helpText" className={styles.helpText}>
              Please make sure that your face fits inside the frame.
            </div>

            <div className={styles.secondary}>
              Press the Record button when ready to record the video.
            </div>
          </div>
        )}
      </div>
    )
  }
}

Tracker.popTypes = {
  fitInFrame: PropTypes.string,
  trackerOptions: PropTypes.object,
}

export default Tracker
