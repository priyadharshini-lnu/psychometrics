import React, { Component } from 'react'
import PropTypes from 'prop-types'

import cs from 'classnames'
// import tracking from 'tracking'
// import 'tracking/build/data/face-min'
import * as faceapi from 'face-api.js'
import { Overlay } from './Overlay'
import styles from './Tracker.scss'

class Tracker extends Component {
  constructor () {
    super()

    this.state = {
      showOverlay: true,
      frame: 'person',
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

    const boundaries = {
      x: box.x * offsetWidth,
      y: box.y * offsetHeight,
      width: box.width * offsetWidth,
      height: box.height * offsetHeight,
    }

    // eslint-disable-next-line react/no-unused-state
    this.setState({ boundaries, thresholds: object, playerEl })

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

    context.beginPath()
    context.rect(boundaries.x, boundaries.y, boundaries.width, boundaries.height)
    this.contextRef = context

    context.strokeStyle = 'yellow'
    context.stroke()
  }

  closesetDivisible = (n, m) => {
    let q = Math.floor(n / m)
    let first = m * q
    let second = (n * m) > 0 ? (m * (q + 1)) : (m * (q - 1))
    if (Math.abs(n - first) < Math.abs(n - second)) return first
    return second
  }

  async initTracker() {
    const { playerEl, playerEl: { id, offsetHeight } } = this.state
    const inputSize = this.closesetDivisible(offsetHeight, 32)
    const scoreThreshold = 0.5
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })

    let result = await faceapi.detectSingleFace(playerEl, options)
    if (result) {
      console.log("face: ", result)
      const canvas = document.querySelector('#canvas')
      const dims = faceapi.matchDimensions(canvas, playerEl, true)

      faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
    }

    setTimeout(() => this.initTracker())
    // const tracker = new tracking.ObjectTracker('face')
    // // tracker.setStepSize(1.7)
    // tracker.setInitialScale(4)
    // tracker.setStepSize(2)
    // tracker.setEdgesDensity(0.1)

    // this.trackerTask = tracking.track(`#${id}`, tracker)

    // const helperEl = document.querySelector('#help')
    // const helpText = helperEl.querySelector('#helpText')

    // let rect
    // tracker.on('track', (event) => {
    //   if (event === undefined) return

    //   if (event.data && event.data.length > 0) {
    //     console.log('rects: ', event.data.length)
    //     // eslint-disable-next-line prefer-destructuring
    //     rect = event.data.slice(-1)[0] // take the last rectangle
    //     this.contextRef.beginPath()
    //     this.contextRef.strokeStyle = 'blue'
    //     this.contextRef.rect(rect.x, rect.y, rect.width, rect.height)
    //     this.contextRef.stroke()
    //     if (this.isInBoundary(rect)) {
    //       this.setState({ showOverlay: false })
    //       this.hideElements([helpText])
    //     } else {
    //       this.setState({ showOverlay: true })
    //       this.showElements([helpText])
    //     }

    //     // event.data.forEach((rect) => {
    //     //   if (this.isInBoundary(rect)) {
    //     //     context.clearRect(0, 0, offsetWidth, offsetHeight)
    //     //   } else {
    //     //     context.strokeRect(rect.x, rect.y, rect.width, rect.height)
    //     //     this.showElements([helpText])
    //     //   }
    //     // })
    //   }
    // })

    // this.hideElements([...helperEl.children])
  }

  isInBoundary = (rect) => {
    // const { thresholds: { threshold }, playerEl: { offsetHeight, offsetWidth } } = this.state
    // const thresholdWidth = threshold * offsetWidth
    // const thresholdHeight = threshold * offsetHeight
    const corners = [
      { x: rect.x, y: rect.y }, // topleft
      { x: rect.x + rect.width, y: rect.y }, // topRight
      { x: rect.x, y: rect.y + rect.height }, // bottomLeft
      { x: rect.x + rect.width, y: rect.y + rect.height }, // bottomRight
    ]

    const inBoundary = corners.every(corner => this.contextRef.isPointInPath(corner.x, corner.y))
    console.log('inBoundary: ', inBoundary)
    return inBoundary
  }

  showElements (targets) {
    targets.forEach(target => target.classList.remove('hidden'))
  }

  hideElements (targets) {
    targets.forEach(target => target.classList.add('hidden'))
  }

  startTracking () {
    this.setState({ showOverlay: true, frame: 'box' })
    this.initTracker()
  }

  stopTracking () {
    this.setState({ showOverlay: false, frame: 'person' })
    this.trackerTask.stop()
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
