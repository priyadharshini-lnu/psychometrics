/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable import/no-unresolved */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AssessmentPreviewStore from 'store/AssessmentPreviewStore'
import 'recordrtc'
import videojs from 'videojs'
import cs from 'classnames'
import styles from './VideoRecorder.scss'
import 'videojs-record/dist/videojs.record'

require('!style-loader!css-loader!video.js/dist/video-js.css')
require('!style-loader!css-loader!videojs-record/dist/css/videojs.record.css')

const { $ } = window

class VideoRecorder extends Component {
  state = {
    deviceReady: false,
    recordingState: 'ready',
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

  discardRecording = () => {
    const { result, onDeleteMedia } = this.props
    if (result && result.answers.length > 0) {
      const mediaId = result.answers[0].media_id
      if (mediaId) {
        $.ajax({
          method: 'DELETE',
          url: `${AssessmentPreviewStore.mediaUrl}/remove_media`,
          data: { media_id: mediaId },
        }).done(() => {
          onDeleteMedia && onDeleteMedia()
          this.initRecorder()
        })
      }
    }
  }

  getUploadUrl = id => $.get(`${AssessmentPreviewStore.mediaUrl}/upload_media_url?question_id=${id}`, (data) => {
    this.uploadFile(data)
  })

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
    const { onSuccessUpload } = this.props
    const mediaId = data.media_id
    this.setState({ recordingState: 'saved' })
    if (data.env === 'prod') {
      const assetKey = data.key.replace('${filename}', 'video.mp4')
      $.ajax({
        method: 'PUT',
        url: `${AssessmentPreviewStore.mediaUrl}/upload_callback`,
        data: { media_id: mediaId, asset_key: assetKey },
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
      return this.setState({ percent: 100, recordingState: 'saved' })
    }

    this.getUploadUrl(model.id)
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

  initRecorder () {
    const { maxDuration } = this.props
    this.setState({ recordingState: 'ready', key: 'record' }, () => {
      const options = {
        controls: true,
        fluid: true,
        controlBar: {
          fullscreenToggle: false,
          volumePanel: false,
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

      this.player.on('deviceReady', () => {
        this.setState({ deviceReady: true })
      })
      this.player.on('startRecord', () => {
        this.setState({ recordingState: 'recording' })
      })
      this.player.on('finishRecord', () => {
        this.setState({ recordingState: 'recorded' })
      })

      this.player.on('error', (element, error) => {
        console.warn(error)
      })
      this.player.on('deviceError', () => {
        console.error('device error:', this.player.deviceErrorCode)
      })
    })
  }

  renderControls () {
    const { onSuccessUpload } = this.props
    const { recordingState, deviceReady } = this.state
    if (!deviceReady || !onSuccessUpload) { return null }
    return (
      <div className={styles.controls}>
        {recordingState === 'recorded'
          && (
            <button className={cs('btn-default', styles.btn, styles.delete)} onClick={this.discardRecording}>
              Discard
            </button>
          )}
        {recordingState === 'saved'
          && (
            <button className={cs('btn-default', styles.btn, styles.delete)} onClick={this.discardRecording}>
              Delete
            </button>
          )}
        {recordingState === 'recorded'
          && (
            <button className={cs('btn-default', styles.btn, styles.save)} onClick={this.saveRecording}>
              Save
            </button>
          )}
        {recordingState === 'error'
          && (
            <button className={cs('btn-default', styles.btn, styles.saved)} onClick={this.saveRecording}>
              Retry
            </button>
          )}
        {recordingState === 'saved'
          && (
            <button className={cs('btn-default', styles.btn, styles.saved)}>
              <span className="glyphicon glyphicon-ok" aria-hidden="true" />
              {' '}
              Saved
            </button>
          )}
        {recordingState === 'saving'
          && <button className={cs('btn-default', styles.btn, styles.saving)}>Saving</button>}
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

  render () {
    const { recordingState } = this.state
    const showProgress = _.includes(['saving'], recordingState)
    const { key } = this.state
    return (
      <div className={cs(styles.recorder, styles[recordingState])}>
        <div data-vjs-player key={key}>
          <video ref={(ref) => { this.video = ref }} className="video-js vjs-default-skin" />
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
