import React, { Component } from 'react'
import PropTypes from 'prop-types'

import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import VideoRecorder from 'components/VideoRecorder'
import withLimitedTakes from 'components/VideoRecorder/hoc/withLimitedTakes'
import { SafeHTML } from 'components/SafeHTML'

import connect from './connect'
import styles from '../VideoResponse.scss'
import VideoPlayer from './VideoPlayer'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)
    this.VideoRecorderComponent = VideoRecorder
    const { model: { props: { maxTakes } } } = props
    if (maxTakes && maxTakes !== '') {
      this.VideoRecorderComponent = withLimitedTakes(VideoRecorder, { maxTakes })
    }
  }

  successUpload = (data) => {
    const { addMediaResponse } = this.props
    addMediaResponse(data)
  }

  deleteMedia = () => {
    const { model, removeMediaResponse } = this.props
    removeMediaResponse(model.id)
  }

  renderVideoRecorder () {
    const {
      model,
      type,
      mediaUrl,
      readOnly,
      markQuestionInProgress,
      removeQuestionInProgress,
      isAssessmentTimedOut,
      mediaResponses,
    } = this.props
    const { VideoRecorderComponent } = this

    if (readOnly) {
      return (
        <VideoPlayer
          mediaResponse={mediaResponses[0]}
          mediaUrl={mediaUrl}
        />
      )
    }

    return (
      <div className="col">
        <VideoRecorderComponent
          key={model.id}
          model={model}
          preview={type === 'preview_assessment'}
          readOnly={readOnly}
          maxDuration={model.props.duration}
          mediaResponse={mediaResponses[0]}
          mediaUrl={mediaUrl}
          fitInFrame={model.props.fitInFrame}
          trackerOptions={model.props.trackerOptions}
          onSuccessUpload={this.successUpload}
          onDeleteMedia={this.deleteMedia}
          markQuestionInProgress={markQuestionInProgress}
          removeQuestionInProgress={removeQuestionInProgress}
          isAssessmentTimedOut={isAssessmentTimedOut}
        />
      </div>
    )
  }

  render () {
    const { model, I18n } = this.props
    I18n.tQuestion(model, 'questionText')
    return (
      <div className={styles.videoResponse}>
        <SafeHTML
          className={textEntryStyles.questionTextPreview}
          html={I18n.tQuestion(model, 'questionText')}
          config="adminRichText"
        />
        {this.renderVideoRecorder()}
      </div>
    )
  }
}

export default connect(Preview)
