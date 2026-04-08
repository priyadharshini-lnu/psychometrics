import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Alert, Space, Progress } from 'antd'
import 'recordrtc'
import videojs from 'videojs'
import cs from 'classnames'
import humps from 'humps'
import { unset, set } from 'lodash/fp'
import SparkMD5 from 'spark-md5'
import * as Sentry from '@sentry/react'
import { LoadingOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { axiosWithRetry } from '~/utils/axiosWithRetry'
import styles from './VideoRecorder.less'
import 'videojs-record/dist/videojs.record'
import StatusText from './controls/status_text'
import RemainingTime from './controls/remaining_time'
import Tracker from './Tracker'

import 'video.js/dist/video-js.css'
import 'videojs-record/dist/css/videojs.record.css'
import '~/modules/survey/utils/MediaRecorder'

const { $ } = window
const UPLOAD_CHUNK_SIZE = 5.5

const axiosInstance = axiosWithRetry()

function getMediaRecorderMimeType () {
  const types = [
    { mimeType: 'video/webm', extension: 'webm' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=h264', extension: 'webm' },
    { mimeType: 'video/webm;codecs=vp8', extension: 'webm' },
  ]
  return types.find(type => MediaRecorder.isTypeSupported(type.mimeType))
}

const supportedMimeType = getMediaRecorderMimeType()

class VideoRecorder extends Component {
  constructor (props) {
    super(props)

    this.state = {
      deviceReady: false,
      recordingState: 'initialized',
      percent: {},
      key: 'player',
      hasMediaRecorder: true,
      errors: {},
    }
  }

  componentDidMount () {
    const { mediaResponse, recordingAllowed } = this.props

    if (mediaResponse && mediaResponse.url) {
      this.initPlayer()
    } else {
      this.initRecorder()
      if (recordingAllowed) {
        setTimeout(() => this.allowRecording(), 300)
      }
    }
  }

  componentDidUpdate (prevProps) {
    const { isAssessmentTimedOut } = this.props
    const { recordingState } = this.state
    if (prevProps.isAssessmentTimedOut === isAssessmentTimedOut || !isAssessmentTimedOut) {
      return
    }

    if (recordingState === 'recording') {
      return this.stopRecording()
    }
  }

  // destroy player on unmount
  componentWillUnmount () {
    if (this.player) {
      this.player.dispose()
    }
    window.removeEventListener('online', this.setOnline)
    window.removeEventListener('offline', this.setOffline)
  }

  setError = (key, message) => this.setState(state => ({
    errors: set(key, message, state.errors),
  }))

  getUploadUrl = async (id) => {
    const { mediaUrl } = this.props
    try {
      const response = await axiosInstance.get(
        `${mediaUrl}/upload_media_url.json?question_id=${id}&file_name=video.${supportedMimeType.extension}`,
      )
      this.urlDetails = response.data
      this.removeError('uploadUrl')
    } catch (error) {
      this.stopRecording()
      this.setError('uploadUrl', _.get(error, ['response', 'data', 'error'], error.message))
    }
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

  removeError = key => this.setState(state => ({
    errors: unset(key, state.errors),
  }))

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
      mediaResponse, onDeleteMedia, mediaUrl, removeQuestionInProgress, model,
    } = this.props
    removeQuestionInProgress(model.id)
    if (mediaResponse) {
      const mediaId = mediaResponse.id
      if (mediaId) {
        axiosInstance({
          method: 'DELETE',
          url: `${mediaUrl}/remove_media`,
          headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
          data: { media_id: mediaId },
        }).then(() => {
          onDeleteMedia && onDeleteMedia()
          this.resetRecorder()
        })
      }
    } else {
      this.resetRecorder()
    }
  }

  uploadFile = (urlDetails, batchNumber) => {
    const batchForUpload = this.batches[batchNumber]
    const blob = new Blob(batchForUpload.batchedBlobs, {
      type: supportedMimeType.mimeType,
    })

    const { percent, recordingState } = this.state
    if (!percent[batchNumber]) {
      this.setState({ percent: { ...percent, [batchNumber]: 0 } })
    }
    if (blob.size === 0) {
      recordingState === 'recording' ? this.stopRecording() : this.handleFinishRecording()
      return
    }

    const uploadResp = axiosInstance.put(
      urlDetails,
      blob,
      {
        onUploadProgress: e => this.setProgress(e, batchNumber),
      },
    )

    if (!this.promisesArray) { this.promisesArray = [] }
    this.promisesArray.push(uploadResp)

    uploadResp.then(() => {
      batchForUpload.batchedBlobs = null
      this.removeError('upload')
    }).catch((err) => {
      console.error(err)
      this.setError('upload', err.message)
    })
  }

  initPlayer () {
    const { mediaResponse } = this.props

    const options = {
      sources: [{
        src: mediaResponse ? mediaResponse.url : undefined,
        // type: 'video/mp4',
      }],
      preload: 'auto',
      controls: true,
      fluid: true,
      disablePictureInPicture: true,
      controlBar: {
        fullscreenToggle: false,
        volumePanel: false,
        pictureInPictureToggle: false,
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
    const {
      maxDuration, markQuestionInProgress, disableRecording,
    } = this.props

    this.setState({
      recordingState: 'initialized',
      key: 'record',
      hasMediaRecorder: !(typeof window.MediaRecorder === 'undefined'),
    }, () => {
      const options = {
        controls: !disableRecording,
        fluid: true,
        controlBar: {
          fullscreenToggle: false,
          pictureInPictureToggle: false,
          volumePanel: false,
          timeDivider: false,
          durationDisplay: false,
        },
        plugins: {
          record: {
            pip: false,
            audio: true,
            maxLength: maxDuration || 10,
            debug: true,
            videoMimeType: supportedMimeType.mimeType,
            timeSlice: 10000,
            video: {
              // video media constraints: set resolution of camera
              width: { min: 640, ideal: 640, max: 1280 },
              height: { min: 480, ideal: 480, max: 920 },
            },
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
        const { model, preview, fitInFrame } = this.props

        if (!preview) { this.getUploadUrl(model.id) }
        this.setState({ recordingState: 'recording', percent: {} })
        this.player.trigger('statechanged', { status: 'recording' })
        markQuestionInProgress(model.id, 'recording')

        this.remainingTime.show()
        this.player.controlBar.currentTimeDisplay.addClass('show')
        this.player.controlBar.currentTimeDisplay.removeClass('hide')

        setTimeout(() => {
          if (!!fitInFrame && this.tracker) this.tracker.startTracking()
        }, 2000)
      })

      this.player.on('finishRecord', this.handleFinishRecording)

      this.player.on('error', (element, error) => {
        console.warn(error)
      })
      this.player.on('deviceError', () => {
        const btnAllow = document.querySelector('#btn-allow-record')
        btnAllow.classList.add('vjs-hidden')

        console.error('Device Error:', this.player.deviceErrorCode)
      })
    })
  }

  async calculateMD5Checksum () {
    let allBlobs = this.player.recordedData
    if (!Array.isArray(allBlobs)) {
      allBlobs = [allBlobs]
    }
    const fullBlob = new Blob(allBlobs, {
      type: this.supportedMimeType?.mimeType || 'video/webm',
    })

    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      const spark = new SparkMD5.ArrayBuffer()

      fileReader.onload = () => {
        spark.append(fileReader.result)
        const base64 = btoa(spark.end(true))
        resolve(base64)
      }

      fileReader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      fileReader.readAsArrayBuffer(fullBlob)
    })
  }

  handleFinishRecording = async () => {
    const {
      preview, fitInFrame, model, markQuestionInProgress,
    } = this.props
    if (!!fitInFrame && this.tracker) this.tracker.stopTracking()
    if (preview) {
      this.handleRecordingSaved()
    } else if (this.urlDetails) {
      this.uploadLastPart()
      this.setState({ recordingState: 'saving' })
      markQuestionInProgress(model.id, 'saving')
    } else {
      return
    }

    this.player.trigger('statechanged', { status: 'recorded' })

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

  async completeMediaUpload (uploadPartsArray) {
    const { mediaUrl } = this.props
    try {
      const checksum = await this.calculateMD5Checksum()
      const { data } = await axiosInstance.put(
        `${mediaUrl}/complete_multipart_upload`,
        {
          parts: uploadPartsArray,
          media_id: this.urlDetails.media_id,
          asset_key: this.urlDetails.asset_key,
          upload_id: this.urlDetails.upload_id,
          file_size: this.player.recordedData.size,
          checksum,
          content_type: this.supportedMimeType,
        },
        {
          headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
        },
      )

      const camelizedData = humps.camelizeKeys(data)
      this.handleRecordingSaved(camelizedData)
      this.resetMultipartUpload()
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
      this.setError('complete', I18n.t('assessments.unknown_error'))
    }
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

    this.player.controlBar.progressControl.children()[0]?.setAttribute(
      'aria-label', I18n.t('assessments.video_response.seek'),
    )
  }

  addRemainingTimeControl () {
    this.remainingTime = new RemainingTime(this.player)
    this.player.controlBar.addChild(this.remainingTime)
  }

  addStatusTextControl () {
    this.statusText = new StatusText(this.player, { text: I18n.t('assessments.video_response.start_recording') })
    this.player.getChild('controlBar').addChild(this.statusText)
  }

  renderControls () {
    const { onSuccessUpload, readOnly } = this.props
    const { recordingState, deviceReady, errors } = this.state
    if (!deviceReady || !onSuccessUpload) { return null }

    return (
      <div className={styles.controlBar}>
        <div className={cs(styles.controls, 'display-flex', 'mtm')}>
          {recordingState === 'saved' && !readOnly && (
            <button
              title="Discard"
              className={cs(styles.control, styles.discard, styles[recordingState])}
              onClick={this.discardRecording}
            >
              <span className="mrs mls fa fa-trash-o" aria-hidden="true" />
              <span className="vjs-control-text" aria-live="polite">
                { I18n.t('assessments.video_response.discard') }
              </span>
            </button>
          )}
          {!errors.upload && recordingState === 'saving' && (
            <Alert
              type="info"
              className={styles.savingBanner}
              message={(
                <Space>
                  <LoadingOutlined />
                  {I18n.t('shared.saving_video')}
                </Space>
              )}
            />
          )}
        </div>
      </div>
    )
  }

  renderProgress () {
    const percent = this.getUploadProgressPercentage()
    const { errors } = this.state
    return (
      <Progress percent={parseInt(percent, 10)} status={_.isEmpty(errors) ? 'normal' : 'exception'} />
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
            ? I18n.t('assessments.video_response.media_recorder.success')
            : I18n.t('assessments.video_response.media_recorder.failure')}
        </div>

        { hasMediaRecorder && (
          <button
            id="btn-allow-record"
            className={cs('btn-default', styles.btnAllowRecord)}
            onClick={this.allowRecording}
            disabled={readOnly}
          >
            <span className="mrs mls fa fa-check" aria-hidden="true" />
            { I18n.t('assessments.video_response.device') }
          </button>
        )}
      </div>
    )
  }

  renderErrors () {
    const { errors } = this.state
    const { errors: otherErrors = {} } = this.props
    if (_.isEmpty(errors) && _.isEmpty(otherErrors)) return null
    return (
      <Alert
        className="mtm"
        type="error"
        message={(
          <ul className={styles.errors}>
            {_.map(errors, (message, key) => <li key={key}>{message}</li>)}
            {_.map(otherErrors, (message, key) => <li key={`other${key}`}>{message}</li>)}
          </ul>
        )}
      />
    )
  }

  render () {
    const {
      key, deviceReady, recordingState,
    } = this.state
    const {
      fitInFrame, trackerOptions, recordingAllowed, disallowDiscard, extraControls,
    } = this.props
    const showProgress = ['saving'].includes(recordingState)
    return (
      <div className={cs(styles.recorder, styles[recordingState])}>
        <div data-vjs-player key={key}>
          {!deviceReady && recordingState === 'initialized' && !recordingAllowed && this.renderPerm() }
          <video ref={(ref) => { this.video = ref }} className="video-js vjs-default-skin vjs-4-3" />
        </div>
        { extraControls }
        { !!fitInFrame
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
        {this.renderErrors()}
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
  extraControls: PropTypes.node,
  errors: PropTypes.object,
}


export default VideoRecorder
