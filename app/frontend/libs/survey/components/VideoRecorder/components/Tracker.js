import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { snakeCase } from 'lodash'
import cs from 'classnames'
import tracking from 'tracking'
import 'tracking/build/data/face-min'
import 'tracking-data/upper-body'
import { Overlay } from './Overlay'
import styles from './Tracker.scss'

class Tracker extends Component {
  constructor () {
    super()

    this.state = {
      showOverlay: true,
    }
  }

  componentWillMount () {
    const { fitInFrame, trackerOptions } = this.props
    const playerEl = document.querySelector('video')

    const { offsetWidth, offsetHeight } = playerEl

    const boundaries = {
      x: trackerOptions[fitInFrame].x * offsetWidth,
      y: trackerOptions[fitInFrame].y * offsetHeight,
      width: trackerOptions[fitInFrame].width * offsetWidth,
      height: trackerOptions[fitInFrame].height * offsetHeight,
    }

    this.setState({ boundaries, playerEl })
  }

  componentDidMount () {
    this.setupBoundingBox()
  }

  setupBoundingBox () {
    const {
      boundaries,
      playerEl: { offsetHeight, offsetWidth },
    } = this.state
    const canvasInner = document.querySelector('#canvas')
    const context = canvasInner.getContext('2d')

    canvasInner.width = offsetWidth
    canvasInner.height = offsetHeight

    context.rect(boundaries.x, boundaries.y, boundaries.width, boundaries.height)
    this.contextRef = context
  }

  initTracker = () => {
    const { playerEl: { id } } = this.state

    const tracker = new tracking.ObjectTracker('face')
    // tracker.setStepSize(1.7)
    tracker.setInitialScale(4)
    tracker.setStepSize(2)
    tracker.setEdgesDensity(0.1)

    this.trackerTask = tracking.track(`#${id}`, tracker)

    const helperEl = document.querySelector('#help')
    const helpText = helperEl.querySelector('#helpText')

    let rect
    tracker.on('track', (event) => {
      if (event === undefined) return

      if (event.data && event.data.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        rect = event.data.slice(-1)[0] // take the last rectangle
        if (this.isInBoundary(rect)) {
          this.setState({ showOverlay: false })
          this.hideElements([helpText])
        } else {
          this.setState({ showOverlay: true })
          this.showElements([helpText])
        }

        // event.data.forEach((rect) => {
        //   if (this.isInBoundary(rect)) {
        //     context.clearRect(0, 0, offsetWidth, offsetHeight)
        //   } else {
        //     context.strokeRect(rect.x, rect.y, rect.width, rect.height)
        //     this.showElements([helpText])
        //   }
        // })
      }
    })

    this.hideElements([...helperEl.children])
  }

  isInBoundary = (rect) => {
    const corners = [
      { x: rect.x, y: rect.y }, // topleft
      { x: rect.x + rect.width, y: rect.y }, // topRight
      { x: rect.x, y: rect.y + rect.height }, // bottomLeft
      { x: rect.x + rect.width, y: rect.y + rect.height }, // bottomRight
    ]

    const inBoundary = corners.every(corner => this.contextRef.isPointInPath(corner.x, corner.y))
    return inBoundary
  }

  showElements (targets) {
    targets.forEach(target => target.classList.remove('hidden'))
  }

  hideElements (targets) {
    targets.forEach(target => target.classList.add('hidden'))
  }

  startTracking () {
    this.setState({ showOverlay: true })
    this.initTracker()
  }

  stopTracking () {
    this.setState({ showOverlay: false })
    this.trackerTask.stop()
  }

  render () {
    const { fitInFrame } = this.props
    const { showOverlay, boundaries: position } = this.state

    return (
      <div className={styles.canvasContainer}>
        <canvas id="canvas" className={styles.canvas} />

        {showOverlay && (
          <Overlay
            position={position}
            ref={(instance) => { this.overlay = instance }}
            resolve={() => import(`./images/${snakeCase(fitInFrame)}_frame.svg`)}
          />
        )}
        {showOverlay && (
          <div id="help" className={cs(styles.help, styles[fitInFrame])}>
            <div id="helpText" className={styles.helpText}>
              Please make sure that your&nbsp;
              {snakeCase(fitInFrame).replace(/_/g, ' ')}
              &nbsp;fits inside the frame.
            </div>

            <div className={styles.secondary}>
              {"Press the 'Record' button when you're ready to record the video."}
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
