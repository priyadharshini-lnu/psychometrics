import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import {
  getI18n,
  isAssessmentTimedOut,
  getMediaResponsesByQuestionId,
} from 'modules/survey/core/preview/FlowProcessor/selectors'
import {
  markQuestionInProgress,
  removeQuestionInProgress,
  addMediaResponse,
  removeMediaResponse,
} from 'modules/survey/core/preview/FlowProcessor/actions'

import textEntryStyles from 'components/modules/TextEntry/components/styles.scss'
import VideoRecorder from 'components/VideoRecorder'
import withLimitedTakes from 'components/VideoRecorder/hoc/withLimitedTakes'
import { SafeHTML } from 'components/SafeHTML'

import VideoPlayer from './VideoPlayer'

const connector = connect(
  ({ preview }, { model }) => ({
    type: preview.type,
    mediaUrl: preview.mediaUrl,
    I18n: getI18n(preview),
    isAssessmentTimedOut: isAssessmentTimedOut(preview),
    mediaResponses: getMediaResponsesByQuestionId(preview, model.id),
  }),
  {
    markQuestionInProgress,
    removeQuestionInProgress,
    addMediaResponse,
    removeMediaResponse,
  },
)

class PreviewComponent extends Component {
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
      <div>
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

export const Preview = connector(PreviewComponent)
