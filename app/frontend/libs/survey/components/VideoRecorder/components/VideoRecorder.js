/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable import/no-unresolved */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import 'recordrtc'
import videojs from 'videojs'
import cs from 'classnames'
import Watchman from 'libs/survey/store/StoreWatchman'
import axios from 'axios'
import styles from './VideoRecorder.scss'
import 'videojs-record/dist/videojs.record'
import StatusText from './controls/status_text'
import RemainingTime from './controls/remaining_time'
import Tracker from './Tracker'

require('!style-loader!css-loader!video.js/dist/video-js.css')
require('!style-loader!css-loader!videojs-record/dist/css/videojs.record.css')

const { $ } = window
const UPLOAD_CHUNK_SIZE = 5.5

class VideoRecorder extends Component {
  constructor (props) {
    super(props)

    const { fitInFrame } = this.props
    this.state = {
      deviceReady: false,
      recordingState: 'initialized',
      percent: {},
      key: 'player',
      trackingEnabled: !!fitInFrame,
      hasMediaRecorder: true,
    }
  }

  componentDidMount () {
    const { answer, recordingAllowed } = this.props

    if (answer) {
      this.initPlayer()
    } else {
      this.initRecorder()
      if (recordingAllowed) {
        setTimeout(() => this.allowRecording(), 300)
      }
    }
  }

  // destroy player on unmount
  componentWillUnmount () {
    if (this.player) {
      this.player.dispose()
    }
  }

  startRecording = () => {
    this.player.record().start()
  }

  stopRecording = () => {
    this.player.record().stop()
  }

  // open device dialog
  allowRecording = () => {
    const { onRecordingAllowed } = this.props
    this.player.record().getDevice()
    onRecordingAllowed && onRecordingAllowed()
  }

  discardRecording = () => {
    const {
      answer, onDeleteMedia, mediaUrl, removeQuestionInProgress, model,
    } = this.props
    removeQuestionInProgress(model.id)
    if (answer) {
      const mediaId = answer.media_id
      if (mediaId) {
        $.ajax({
          method: 'DELETE',
          url: `${mediaUrl}/remove_media`,
          headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
          data: { media_id: mediaId },
        }).done(() => {
          onDeleteMedia && onDeleteMedia()
          this.resetRecorder()
        })
      }
    } else {
      this.resetRecorder()
    }
  }

  getUploadUrl = (id) => {
    const { mediaUrl } = this.props
    $.get(`${mediaUrl}/upload_media_url?question_id=${id}`, (urlDetails) => {
      this.urlDetails = urlDetails
    })
  }

  uploadFile = (urlDetails, batchNumber) => {
    const batchForUpload = this.batches[batchNumber]
    const blob = new Blob(batchForUpload.batchedBlobs, {
      type: 'video/webm',
    })

    const { percent } = this.state
    if (!percent[batchNumber]) {
      this.setState({ percent: { ...percent, [batchNumber]: 0 } })
    }

    const uploadResp = axios.put(
      urlDetails,
      blob,
      { onUploadProgress: e => this.setProgress(e, batchNumber) },
    )

    if (!this.promisesArray) { this.promisesArray = [] }
    this.promisesArray.push(uploadResp)

    uploadResp.then(() => { batchForUpload.batchedBlobs = null })
  }

  setProgress = (e, batchNumber) => {
    if (e.lengthComputable) {
      let percentComplete = e.loaded / e.total
      percentComplete = parseInt(percentComplete * 100, 10)
      const { percent } = this.state
      this.setState({ percent: { ...percent, [batchNumber]: percentComplete } })
    }
  }

  getUploadProgressPercentage = () => {
    let totalUploaded = 0
    let total = 0
    const { percent } = this.state
    _.each(percent, (percent, batchNumber) => {
      totalUploaded += (this.batches[batchNumber].size * percent / 100)
      total += this.batches[batchNumber].size
    })
    return totalUploaded / total * 100
  }

  // eslint-disable-next-line react/sort-comp
  initPlayer () {
    const { answer } = this.props

    const options = {
      sources: [{
        src: answer ? answer.value : undefined,
        type: 'video/mp4',
      }],
      preload: 'auto',
      controls: true,
      fluid: true,
      controlBar: {
        fullscreenToggle: false,
        volumePanel: false,
      },
    }

    this.player = videojs(this.video, options)
    this.setState({ recordingState: 'saved', deviceReady: true })
  }

  resetRecorder () {
    const { key } = this.state
    if (key === 'record') {
      this.player.record().reset()
      this.setState({ recordingState: 'ready' })
      this.allowRecording()
    } else {
      this.setState({ deviceReady: false })
      this.initRecorder()
    }

    this.player.controlBar.playToggle.hide()
    this.player.controlBar.progressControl.hide()

    if (this.statusText) { this.statusText.reset() }
    if (this.remainingTime) { this.remainingTime.hide() }

    this.player.controlBar.currentTimeDisplay.addClass('hide')
    this.player.controlBar.currentTimeDisplay.removeClass('show')
  }

  initRecorder () {
    const { maxDuration, model, markQuestionInProgress } = this.props

    this.setState({
      recordingState: 'initialized',
      key: 'record',
      hasMediaRecorder: !(typeof window.MediaRecorder === 'undefined'),
    }, () => {
      const options = {
        controls: true,
        fluid: true,
        controlBar: {
          fullscreenToggle: false,
          volumePanel: false,
          timeDivider: false,
          durationDisplay: false,
        },
        plugins: {
          record: {
            pip: false,
            audio: true,
            video: true,
            maxLength: maxDuration || 10,
            debug: true,
            videoMimeType: 'video/webm;codecs=H264',
            timeSlice: 10000,
          },
        },
      }

      this.player = videojs(this.video, options)

      this.player.on('ready', () => {
        if (!this.remainingTime) this.addRemainingTimeControl()
        if (!this.statusText) this.addStatusTextControl()
      })

      this.player.on('timestamp', () => {
        const { preview } = this.props
        if (!preview) { this.multipartUpload() }
      })

      this.player.on('deviceReady', () => {
        this.setState({
          deviceReady: true,
          recordingState: 'ready',
        })

        this.statusText.show()
      })

      this.player.on('startRecord', () => {
        const { trackingEnabled } = this.state
        const { model, preview } = this.props

        if (!preview) { this.getUploadUrl(model.id) }
        this.setState({ recordingState: 'recording' })
        this.player.trigger('statechanged', { status: 'recording' })
        markQuestionInProgress(model.id, 'recording')

        this.remainingTime.show()
        this.player.controlBar.currentTimeDisplay.addClass('show')
        this.player.controlBar.currentTimeDisplay.removeClass('hide')

        if (trackingEnabled && this.tracker) this.tracker.startTracking()
      })

      this.player.on('finishRecord', async () => {
        const { preview } = this.props
        const { trackingEnabled } = this.state
        if (preview) {
          this.handleRecordingSaved()
        } else {
          this.uploadLastPart()
          this.setState({ recordingState: 'saving' })
          markQuestionInProgress(model.id, 'saving')
        }

        this.player.trigger('statechanged', { status: 'recorded' })

        if (trackingEnabled && this.tracker) this.tracker.stopTracking()

        if (!preview) {
          const resolvedArray = await Promise.all(this.promisesArray)
          const uploadPartsArray = []
          resolvedArray.forEach((resolvedPromise, index) => {
            uploadPartsArray.push({
              etag: resolvedPromise.headers.etag,
              part_number: index + 1,
            })
          })

          this.completeMediaUpload(uploadPartsArray)
        }
      })

      this.player.on('error', (element, error) => {
        // eslint-disable-next-line no-console
        console.warn(error)
      })
      this.player.on('deviceError', () => {
        const btnAllow = document.querySelector('#btn-allow-record')
        btnAllow.classList.add('vjs-hidden')

        // eslint-disable-next-line no-console
        console.error('Device Error:', this.player.deviceErrorCode)
      })
    })
  }

  multipartUpload = () => {
    const totalSlices = this.player.recordedData.length
    if (!this.batches) {
      this.batches = []
      this.batches.push({
        firstIndex: 0,
      })
    }

    const lastBatch = this.batches[this.batches.length - 1]
    const batchedBlobs = this.player.recordedData.slice(lastBatch.firstIndex, totalSlices)
    const sizeInBytes = _.sum(_.map(batchedBlobs, a => a.size))
    const sizeInMB = sizeInBytes / 1000 / 1000
    lastBatch.size = sizeInBytes
    lastBatch.batchedBlobs = batchedBlobs
    if (sizeInMB > UPLOAD_CHUNK_SIZE) {
      lastBatch.lastIndex = totalSlices - 1
      this.uploadFile(this.urlDetails.urls[this.batches.length - 1], this.batches.length - 1)
      this.batches.push({
        firstIndex: lastBatch.lastIndex + 1,
        batchedBlobs: [],
        size: 0,
      })
    }
  }

  uploadLastPart = () => {
    const lastBatch = this.batches[this.batches.length - 1]
    // If there is no lastIndex, it means last batch is not uploaded still
    if (!lastBatch.lastIndex) {
      this.uploadFile(this.urlDetails.urls[this.batches.length - 1], this.batches.length - 1)
    }
  }

  completeMediaUpload = (uploadPartsArray) => {
    const { mediaUrl } = this.props
    axios.put(
      `${mediaUrl}/complete_multipart_upload`,
      {
        parts: uploadPartsArray,
        media_id: this.urlDetails.media_id,
        asset_key: this.urlDetails.asset_key,
        upload_id: this.urlDetails.upload_id,
      },
      {
        headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
      },
    ).then(({ data }) => {
      this.handleRecordingSaved(data)
      this.resetMultipartUpload()
    })
  }

  resetMultipartUpload = () => {
    this.batches = null
    this.promisesArray = []
  }

  handleRecordingSaved = (data) => {
    const { model, removeQuestionInProgress, onSuccessUpload } = this.props
    onSuccessUpload && data && onSuccessUpload(data)
    this.player.trigger('statechanged', { status: 'saved' })
    this.setState({ recordingState: 'saved' })
    removeQuestionInProgress(model.id)

    this.statusText.hide()
    this.player.controlBar.progressControl.show()

    this.player.controlBar.currentTimeDisplay.addClass('hide')
    this.player.controlBar.currentTimeDisplay.removeClass('show')
  }

  addRemainingTimeControl () {
    this.remainingTime = new RemainingTime(this.player)
    this.player.controlBar.addChild(this.remainingTime)
  }

  addStatusTextControl () {
    this.statusText = new StatusText(this.player, { text: 'Start Recording' })
    this.player.getChild('controlBar').addChild(this.statusText)
  }

  renderControls () {
    const { onSuccessUpload, readOnly } = this.props
    const { recordingState, deviceReady } = this.state
    if (!deviceReady || !onSuccessUpload) { return null }

    return (
      <div className={styles.controlBar}>
        <div className={cs(styles.controls, 'display-flex')}>
          {recordingState === 'saved' && !readOnly && (
            <button
              title="Discard"
              className={cs(styles.control, styles.discard, styles[recordingState])}
              onClick={this.discardRecording}
            >
              <span className="mrs mls fa fa-trash-o" area-hidden="true" />
              <span className="vjs-control-text" aria-live="polite">
                { Watchman.I18n().t('assessments.video_response.discard') }
              </span>
            </button>
          )}
          {recordingState === 'saving' && (
            <span className="vjs-control-text" aria-live="polite">
              { Watchman.I18n().t('assessments.video_response.saving') }
            </span>
          )}
        </div>
      </div>
    )
  }

  renderProgress () {
    const percent = this.getUploadProgressPercentage()
    const width = `${percent}%`
    return (
      <div className={styles.progress}>
        <div
          className={`progress-bar-success ${styles.progressBar}`}
          style={{ width }}
        />
      </div>
    )
  }

  renderPerm () {
    const { readOnly } = this.props
    const { hasMediaRecorder } = this.state

    return (
      <div className={styles.perm}>
        <div className={styles.circle}>
          <span className={styles.icon} />
        </div>
        <div className={styles.permText}>
          {hasMediaRecorder
            ? Watchman.I18n().t('assessments.video_response.media_recorder.success')
            : Watchman.I18n().t('assessments.video_response.media_recorder.failure')}
        </div>

        { hasMediaRecorder && (
          <button
            id="btn-allow-record"
            className={cs('btn-default', styles.btnAllowRecord)}
            onClick={this.allowRecording}
            disabled={readOnly}
          >
            <span className="mrs mls fa fa-check" aria-hidden="true" />
            { Watchman.I18n().t('assessments.video_response.device') }
          </button>
        )}
      </div>
    )
  }

  render () {
    const {
      key, deviceReady, recordingState, trackingEnabled,
    } = this.state
    const {
      fitInFrame, trackerOptions, recordingAllowed, disallowDiscard,
    } = this.props
    const showProgress = ['saving'].includes(recordingState)

    return (
      <div className={cs(styles.recorder, styles[recordingState])}>
        <div data-vjs-player key={key}>
          {!deviceReady && recordingState === 'initialized' && !recordingAllowed && this.renderPerm() }
          <video ref={(ref) => { this.video = ref }} className="video-js vjs-default-skin vjs-4-3" />
        </div>
        { trackingEnabled
        && ['ready', 'recording', 'recorded'].includes(recordingState)
        && (
          <Tracker
            ref={(instance) => { this.tracker = instance }}
            videoRef={this.video}
            fitInFrame={fitInFrame}
            trackerOptions={trackerOptions}
          />
        )}
        {showProgress && this.renderProgress()}
        {(!disallowDiscard || recordingState === 'saving') && this.renderControls()}
      </div>
    )
  }
}

VideoRecorder.propTypes = {
  maxDuration: PropTypes.number.isRequired,
  onSuccessUpload: PropTypes.func,
  onDeleteMedia: PropTypes.func,
  fitInFrame: PropTypes.string,
  trackerOptions: PropTypes.object,
}

export default VideoRecorder
