/* eslint-disable import/no-webpack-loader-syntax */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import cs from 'classnames'
import tracking from 'tracking'
import 'tracking/build/data/face-min'

import styles from './Tracker.scss'

class Tracker extends Component {
  componentDidMount () {
    this.setupBoundingBox()
  }

  setupBoundingBox () {
    const { fitInFrame, trackerOptions } = this.props
    const playerEl = document.querySelector('video')

    const { offsetWidth, offsetHeight } = playerEl
    const canvasInner = document.querySelector('#canvasInner')
    const context = canvasInner.getContext('2d')

    canvasInner.width = offsetWidth
    canvasInner.height = offsetHeight

    const boundaries = {
      x: trackerOptions[fitInFrame].x * offsetWidth,
      y: trackerOptions[fitInFrame].y * offsetHeight,
      width: trackerOptions[fitInFrame].width * offsetWidth,
      height: trackerOptions[fitInFrame].height * offsetHeight,
    }

    context.rect(boundaries.x, boundaries.y, boundaries.width, boundaries.height)
    context.lineWidth = 3
    context.strokeStyle = 'yellow'
    context.stroke()

    this.contextRef = context
  }

  initTracker = () => {
    const playerEl = document.querySelector('video')
    const { id, offsetWidth, offsetHeight } = playerEl

    const canvas = document.querySelector('#canvasOuter')
    const context = canvas.getContext('2d')

    canvas.width = offsetWidth
    canvas.height = offsetHeight
    context.lineWidth = 2
    context.strokeStyle = 'blue'

    const tracker = new tracking.ObjectTracker('face')
    tracker.setStepSize(1.7)

    this.trackerTask = tracking.track(`#${id}`, tracker)

    // const boundaryEl = document.querySelector('.boundary')
    // const statusEl = boundaryEl.children[0]

    let rect
    tracker.on('track', (event) => {
      context.clearRect(0, 0, offsetWidth, offsetHeight)
      if (event === undefined) return

      if (event.data && event.data.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        rect = event.data.slice(-1)[0] // take the last rectangle
        if (this.isInBoundary(rect)) {
          // eslint-disable-next-line no-console
          console.log('In Boundary')
          context.clearRect(0, 0, offsetWidth, offsetHeight)
        } else {
          // eslint-disable-next-line no-console
          console.log('Not In Boundary')
          context.strokeRect(rect.x, rect.y, rect.width, rect.height)
        }

        // event.data.forEach((rect) => {
        //   if (!this.isInBoundary(rect)) {
        //     context.strokeRect(rect.x, rect.y, rect.width, rect.height)
        //   }
        // })
      }
    })
  }

  isInBoundary = (rect) => {
    const coordinates = [
      { x: rect.x, y: rect.y }, // topleft
      { x: rect.x + rect.width, y: rect.y }, // topRight
      { x: rect.x, y: rect.y + rect.height }, // bottomLeft
      { x: rect.x + rect.width, y: rect.y + rect.height }, // bottomRight
    ]

    const inBoundary = coordinates.every(corner => this.contextRef.isPointInPath(corner.x, corner.y))
    // console.log('coordinates: ', coordinates)
    // for (const coords of coordinates) {
    //   if (!this.contextRef.isPointInPath(coords.x, coords.y)) return false
    // }

    return inBoundary
  }

  unCamelize = (text) => {
    text = text.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') // add space between camelCase text
    text = text.toLowerCase()
    return text
  }

  stopTracking () {
    // TODO: cleanup after stopping the trackerTask
    this.trackerTask.stop()
  }

  render () {
    const { fitInFrame, onInitTracker } = this.props

    return (
      <div className={styles.canvasContainer}>
        <canvas id="canvasInner" className={cs(styles.canvas, styles.inner)} />
        <canvas id="canvasOuter" className={cs(styles.canvas, styles.outer)} />

        <div className={styles.help}>
          Please make sure that your
          {this.unCamelize(fitInFrame)}
          fits inside the frame.

          <div className={styles.secondary}>
            {"Press the 'Ready' when you're set to record the video."}
          </div>
          <button className={styles.btnReady} onClick={this.initTracker && onInitTracker()}>Ready</button>
        </div>
      </div>
    )
  }
}

Tracker.popTypes = {
  fitInFrame: PropTypes.string,
  trackerOptions: PropTypes.object,
  onInitTracker: PropTypes.func,
}

export default Tracker
