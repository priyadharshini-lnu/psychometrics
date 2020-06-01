/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import VideoRecorder from 'components/VideoRecorder'
import withLimitedTakes from 'components/VideoRecorder/hoc/withLimitedTakes'
import connect from './connect'
import styles from '../VideoResponse.scss'

const VideoRecorderWithLimitedTakes = withLimitedTakes(VideoRecorder, { maxTakes: 3 })

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  successUpload = (data) => {
    const { model, saveCurrentPage } = this.props
    model.result.answer(data.asset.url, data.id, data.takeNo)
    setTimeout(() => saveCurrentPage(), 300)
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
    return (
      <div className="col">
        <VideoRecorderWithLimitedTakes
          key={model.id}
          model={model}
          preview={type === 'preview_assessment'}
          readOnly={readOnly}
          maxDuration={model.props.duration}
          answer={result && result.answers[0]}
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
