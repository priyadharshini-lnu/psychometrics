/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable import/no-unresolved */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import 'recordrtc'
import videojs from 'videojs'
import cs from 'classnames'
import Watchman from 'libs/survey/store/StoreWatchman'
import styles from './VideoRecorder.scss'
import 'videojs-record/dist/videojs.record'
import StatusText from './controls/status_text'
import RemainingTime from './controls/remaining_time'

require('!style-loader!css-loader!video.js/dist/video-js.css')
require('!style-loader!css-loader!videojs-record/dist/css/videojs.record.css')

const { $ } = window

class VideoRecorder extends Component {
  state = {
    deviceReady: false,
    recordingState: 'initialized',
    percent: 0,
    key: 'player',
  }

  componentDidMount () {
    const { result } = this.props

    if (result && result.answers.length > 0) {
      this.initPlayer()
    } else {
      this.initRecorder()
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
    this.player.record().getDevice()
  }

  discardRecording = () => {
    const { result, onDeleteMedia, mediaUrl } = this.props
    if (result && result.answers.length > 0) {
      const mediaId = result.answers[0].media_id
      if (mediaId) {
        $.ajax({
          method: 'DELETE',
          url: `${mediaUrl}/remove_media`,
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
    $.get(`${mediaUrl}/upload_media_url?question_id=${id}`, (data) => {
      this.uploadFile(data)
    })
  }

  uploadFile = (data) => {
    const video = this.player.recordedData
    const mediaId = data.media_id
    const fd = new FormData()
    if (data.env === 'prod') {
      fd.append('key', data.key)
      fd.append('acl', data.acl)
      fd.append('success_action_status', data.success_action_status)
      fd.append('policy', data.policy)
      fd.append('x-amz-algorithm', data['x-amz-algorithm'])
      fd.append('x-amz-credential', data['x-amz-credential'])
      fd.append('x-amz-date', data['x-amz-date'])
      fd.append('x-amz-signature', data['x-amz-signature'])
      fd.append('file', video, 'video.mp4')
    } else {
      fd.append('authenticity_token', $('meta[name="csrf-token"]').attr('content'))
      fd.append('media_id', mediaId)
      fd.append('asset', video, 'video.mp4')
    }

    $.ajax({
      method: 'POST',
      url: data.url,
      data: fd,
      processData: false,
      contentType: false,
      xhr: () => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', this.onUploadProgress, false)
        return xhr
      },
    }).done((media) => {
      this.onUploadDone(media, data)
    }).fail(() => {
      this.setState({ recordingState: 'error' })
    })
  }

  onUploadDone = (media, data) => {
    const { onSuccessUpload, mediaUrl } = this.props
    const mediaId = data.media_id
    this.setState({ recordingState: 'saved' })
    this.handleRecordingSaved()
    if (data.env === 'prod') {
      const assetKey = data.key.replace('${filename}', 'video.mp4')
      $.ajax({
        method: 'PUT',
        url: `${mediaUrl}/upload_callback`,
        data: { media_id: mediaId, asset_key: assetKey },
        headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
      }).done((data) => {
        onSuccessUpload(data)
      })
    } else {
      onSuccessUpload(media)
    }
  }

  onUploadProgress = (e) => {
    if (e.lengthComputable) {
      let percentComplete = e.loaded / e.total
      percentComplete = parseInt(percentComplete * 100, 10)
      this.setState({ percent: percentComplete })
    }
  }

  saveRecording = async () => {
    const { preview, model } = this.props
    this.setState({ recordingState: 'saving' })
    if (preview) {
      this.handleRecordingSaved()
      return this.setState({ percent: 100, recordingState: 'saved' })
    }

    this.getUploadUrl(model.id)
  }

  handleRecordingSaved = () => {
    this.player.trigger('statechanged', { status: 'saved' })

    this.statusText.hide()
    this.player.controlBar.progressControl.show()

    this.player.controlBar.currentTimeDisplay.addClass('hide')
    this.player.controlBar.currentTimeDisplay.removeClass('show')
  }

  initPlayer () {
    const { result } = this.props

    const options = {
      sources: [{
        src: result ? result.answers[0].value : undefined,
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
    this.initRecorder()

    this.setState({ recordingState: 'ready' })
    this.player.controlBar.playToggle.hide()
    this.player.controlBar.progressControl.hide()

    this.statusText.reset()

    this.remainingTime.hide()

    this.player.controlBar.currentTimeDisplay.addClass('hide')
    this.player.controlBar.currentTimeDisplay.removeClass('show')
  }

  initRecorder () {
    const { maxDuration } = this.props
    this.setState({ recordingState: 'initialized', key: 'record' }, () => {
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
          },
        },
      }

      this.player = videojs(this.video, options)

      this.player.on('ready', () => {
        if (!this.remainingTime) this.addRemainingTimeControl()
        if (!this.statusText) this.addStatusTextControl()
      })
      this.player.on('deviceReady', () => {
        this.setState({
          deviceReady: true,
          recordingState: 'ready',
        })
        this.statusText.show()
      })
      this.player.on('startRecord', () => {
        this.setState({ recordingState: 'recording' })
        this.player.trigger('statechanged', { status: 'recording' })

        this.remainingTime.show()
        this.player.controlBar.currentTimeDisplay.addClass('show')
        this.player.controlBar.currentTimeDisplay.removeClass('hide')
      })
      this.player.on('finishRecord', () => {
        this.player.trigger('statechanged', { status: 'recorded' })
        this.setState({ recordingState: 'recorded' })
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
          {['recorded', 'saved', 'saving'].includes(recordingState) && !readOnly && (
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
          {recordingState === 'recorded' && (
            <button className={cs(styles.control, styles[recordingState])} onClick={this.saveRecording} title="Save">
              <span className="mrs mls fa fa-check" aria-hidden="true" />
              <span className="vjs-control-text" aria-live="polite">
                { Watchman.I18n().t('assessments.video_response.save') }
              </span>
            </button>
          )}
          {recordingState === 'saving' && (
            <button className={cs(styles.control, styles[recordingState])} onClick={this.saveRecording} title="Save">
              <span className="vjs-control-text" aria-live="polite">
                { Watchman.I18n().t('assessments.video_response.saving') }
              </span>
            </button>
          )}
          {recordingState === 'saved' && !readOnly && (
            <button className={cs(styles.control, styles[recordingState])} title="Saved">
              <span className="mrs mls fa fa-check" aria-hidden="true" />
              <span className="vjs-control-text" aria-live="polite">
                { Watchman.I18n().t('assessments.video_response.saved') }
              </span>
            </button>
          )}
          {recordingState === 'error' && (
            <button className={cs(styles.control, styles.error)} onClick={this.saveRecording} title="Retry Save">
              <span className="vjs-control-text" aria-live="polite">
                { Watchman.I18n().t('assessments.video_response.retry') }
              </span>
            </button>
          )}
        </div>
      </div>
    )
  }

  renderProgress () {
    const { percent } = this.state
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

    return (
      <div className={styles.perm}>
        <div className={styles.circle}>
          <span className={styles.icon} />
        </div>
        <div className={styles.permText}>
          Please allow to use camera and microphone to record audio and Video
        </div>

        <button
          id="btn-allow-record"
          className={cs('btn-default', styles.btnAllowRecord)}
          onClick={this.allowRecording}
          disabled={readOnly}
        >
          <span className="mrs mls fa fa-check" aria-hidden="true" />
          { Watchman.I18n().t('assessments.video_response.device') }
        </button>
      </div>
    )
  }

  render () {
    const { deviceReady, recordingState } = this.state
    const showProgress = _.includes(['saving'], recordingState)
    const { key } = this.state
    return (
      <div className={cs(styles.recorder, styles[recordingState])}>
        <div data-vjs-player key={key}>
          { !deviceReady && recordingState === 'initialized' && this.renderPerm() }
          <video ref={(ref) => { this.video = ref }} className="video-js vjs-default-skin vjs-4-3" />
        </div>
        {showProgress && this.renderProgress()}
        {this.renderControls()}
      </div>
    )
  }
}

VideoRecorder.propTypes = {
  maxDuration: PropTypes.number.isRequired,
  onSuccessUpload: PropTypes.func,
  onDeleteMedia: PropTypes.func,
}

export default VideoRecorder
