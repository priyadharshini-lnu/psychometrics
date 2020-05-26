/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import VideoRecorder from 'components/VideoRecorder'
import connect from './connect'
import styles from '../VideoResponse.scss'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  successUpload = (data) => {
    const { model } = this.props
    model.result.answer(data.asset.url, data.id)
  }

  deleteMedia = () => {
    const { model } = this.props
    model.result.answer()
  }

  renderVideoRecorder () {
    const {
      model, type, mediaUrl, readOnly, markQuestionInProgress, removeQuestionInProgress,
    } = this.props
    const { result } = model
    const preview = type === 'preview_assessment'
    return (
      <div className="col">
        <VideoRecorder
          key={model.id}
          model={model}
          preview={preview}
          readOnly={readOnly}
          maxDuration={model.props.duration}
          result={result}
          mediaUrl={mediaUrl}
          fitInFrame={model.props.fitInFrame}
          trackerOptions={model.props.trackerOptions}
          onSuccessUpload={this.successUpload}
          onDeleteMedia={this.deleteMedia}
          markQuestionInProgress={markQuestionInProgress}
          removeQuestionInProgress={removeQuestionInProgress}
        />
      </div>
    )
  }

  render () {
    const { model, I18n } = this.props
    I18n.tQuestion(model, 'questionText')
    return (
      <div className={styles.videoResponse}>
        <div
          className={textEntryStyles.questionTextPreview}
          dangerouslySetInnerHTML={{ __html: I18n.tQuestion(model, 'questionText') }}
        />
        {this.renderVideoRecorder()}
      </div>
    )
  }
}

export default connect(Preview)
