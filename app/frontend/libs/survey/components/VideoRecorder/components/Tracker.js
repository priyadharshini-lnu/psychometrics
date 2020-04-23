/* eslint-disable react/no-unused-state */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { isEqual } from 'lodash'
import cs from 'classnames'
import * as faceapi from 'face-api.js'
import { Overlay } from './Overlay'
import styles from './Tracker.scss'

const messages = {
  frame: 'Please make sure that your face aligns with the frame.',
  ready: 'Press the Record button when ready to record.',
  forward: 'You are too far away from the screen. Please move a bit closer.',
  backward: 'You are too close to the screen. Please move a bit back.',
}

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

  componentWillMount () {
    const playerEl = document.querySelector('video')

    this.videoEl = playerEl
    this.calculateBoundaries()
    this.loadFaceDetectionNet()
  }

  componentDidMount () {
    this.setupBoundingBox()
    this.showElements(['frame', 'ready'])
  }

  componentDidUpdate (prevProps) {
    const { fitInFrame, trackerOptions } = this.props
    console.log('this.props: ', fitInFrame, trackerOptions[fitInFrame])
    console.log('prevProps: ', prevProps.trackerOptions[prevProps.fitInFrame])
    if (
      prevProps.fitInFrame !== fitInFrame
      || !isEqual(prevProps.trackerOptions[prevProps.fitInFrame], trackerOptions[fitInFrame])) {
      this.calculateBoundaries()
    } else {
      console.log('component update completed')
    }
  }

  setupBoundingBox () {
    const { boundaries } = this.state
    const { offsetHeight, offsetWidth } = this.videoEl
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')

    canvas.width = offsetWidth
    canvas.height = offsetHeight

    context.rect(boundaries.x, boundaries.y, boundaries.width, boundaries.height)
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
    const { thresholds } = this.state
    const boxArea = rect.width * rect.height

    // eslint-disable-next-line no-console
    console.log('thresholds: ', thresholds, ' boxArea: ', boxArea)

    if (boxArea > thresholds.areaMax) return 1
    if (boxArea < thresholds.areaMin) return -1

    return 0
  }

  isInBoundary = (rect) => {
    const corners = [
      { ...rect.topLeft }, // topleft
      { ...rect.topRight }, // topRight
      { ...rect.bottomLeft }, // bottomLeft
      { ...rect.bottomRight }, // bottomRight
    ]

    // eslint-disable-next-line no-underscore-dangle
    const inBoundary = corners.every(corner => this.contextRef.isPointInPath(corner._x, corner._y))
    return inBoundary
  }

  calculateBoundaries () {
    const {
      fitInFrame,
      trackerOptions: {
        [fitInFrame]: { box, object },
      },
    } = this.props
    const { offsetWidth, offsetHeight } = this.videoEl

    const width = box.width * offsetWidth
    const height = box.height * offsetHeight
    const boundaries = {
      x: box.x * offsetWidth,
      y: box.y * offsetHeight,
      width,
      height,
      area: width * height,
    }

    // min, max box calculations
    const thresholdWidth = object.threshold * offsetWidth
    const thresholdHeight = object.threshold * offsetHeight

    // eslint-disable-next-line no-console
    console.log('thresholdWidth: ', thresholdWidth, ' thresholdHeight: ', thresholdHeight)
    const minHeight = (object.size * offsetHeight) - thresholdHeight
    const minWidth = (object.size * offsetWidth) - thresholdWidth
    const maxHeight = (object.size * offsetHeight) + thresholdHeight
    const maxWidth = (object.size * offsetWidth) + thresholdWidth

    const thresholds = {
      areaMin: minHeight * minWidth,
      areaMax: maxHeight * maxWidth,
    }

    this.setState({ boundaries, thresholds })
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
    const helpTexts = []
    if (result) {
      // Face detected
      inBoundary = this.isInBoundary(result.box)
      inSize = this.isInSize(result.box)

      // eslint-disable-next-line no-console
      console.log('inBoundary: ', inBoundary, ' inSize: ', inSize)

      if (inBoundary && inSize === 0) {
        this.setState({ showOverlay: false })
        this.hideElements(Object.keys(messages))
      } else {
        this.setState({ showOverlay: true })
        this.hideElements(Object.keys(messages))

        if (!inBoundary) helpTexts.push('frame')
        if (inSize !== 0) {
          helpTexts.push(inSize < 0 ? 'forward' : 'backward')
        }
        this.showElements(helpTexts)
      }
    } else {
      // No face
      this.setState({ showOverlay: true })
      this.showElements([this.helpTextRef])
    }

    if (isTracking) {
      setTimeout(() => this.track())
    }
  }

  initTracker () {
    this.track(this.videoEl)
  }

  loadFaceDetectionNet () {
    return Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/face-api/models'),
    ]).then(this.setState({ faceDetectionModelLoaded: true }))
  }

  findElements (ids, containerSelector = '#help') {
    const container = document.querySelector(containerSelector)
    if (container) {
      return container.querySelectorAll(ids.map(id => `#${id}`).join(', '))
    }

    return null
  }

  showElements (targets) {
    const elements = this.findElements(targets)
    if (elements) {
      elements.forEach(target => target.classList.remove('hidden'))
    }
  }

  hideElements (targets) {
    const elements = this.findElements(targets)
    if (elements) {
      elements.forEach(target => target.classList.add('hidden'))
    }
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
  }

  render () {
    const { showOverlay, frame, boundaries: position } = this.state

    return (
      <div id="container" className={styles.canvasContainer}>
        <canvas id="canvas" className={styles.canvas} />

        {showOverlay && (
          <Overlay
            position={position}
            ref={(instance) => { this.overlay = instance }}
            resolve={() => import(`./images/${frame}.svg`)}
          />
        )}

        {showOverlay && (
          <div id="help" className={styles.help}>
            <div id="frame" className={cs(styles.message, 'hidden')}>{messages.frame}</div>
            <div id="ready" className={cs(styles.message, 'hidden')}>{messages.ready}</div>
            <div id="forward" className={cs(styles.message, 'hidden')}>{messages.forward}</div>
            <div id="backward" className={cs(styles.message, 'hidden')}>{messages.backward}</div>
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
