import { Component } from 'react'
import { connect } from 'react-redux'

import {
  getI18n,
  isAssessmentTimedOut,
  getMediaResponsesByQuestionId,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'
import {
  markQuestionInProgress,
  removeQuestionInProgress,
  addMediaResponse,
  removeMediaResponse,
} from '~/modules/survey/core/preview/FlowProcessor/actions'

import { BROWSER_FEATURES } from '~/modules/survey/constants/browser'
import VideoRecorder from '~/modules/survey/components/VideoRecorder'
import { SafeHTML } from '~/components/SafeHTML'
import { checkBrowserSupportForFeature } from '~/utils/uaParser'
import { UnsupportedBrowser } from './UnsupportedBrowser'
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

const PreviewComponent = ({
  model,
  I18n,
  markQuestionInProgress,
  removeQuestionInProgress,
  addMediaResponse,
  removeMediaResponse,
  type,
  mediaUrl,
  isAssessmentTimedOut,
  mediaResponses,
  readOnly,
}) => {
  const { isBrowserSupported, supportedBrowsers } = checkBrowserSupportForFeature(
    BROWSER_FEATURES.mediaRecorderAPI,
  )

  return (
    <div>
      <SafeHTML
        html={I18n.tQuestion(model, 'questionText')}
        className="mb-4"
        config="adminRichText"
      />
      {isBrowserSupported ? (
        <SupportedVideoRecorder
          model={model}
          markQuestionInProgress={markQuestionInProgress}
          removeQuestionInProgress={removeQuestionInProgress}
          addMediaResponse={addMediaResponse}
          removeMediaResponse={removeMediaResponse}
          type={type}
          mediaUrl={mediaUrl}
          isAssessmentTimedOut={isAssessmentTimedOut}
          mediaResponses={mediaResponses}
          readOnly={readOnly}
        />
      ) : (
        <UnsupportedBrowser supportedBrowsers={supportedBrowsers} />
      )}
    </div>
  )
}

class SupportedVideoRecorder extends Component {
  constructor (props) {
    super(props)
    this.VideoRecorderComponent = VideoRecorder
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
      const mediaResponse = mediaResponses.filter(({ userSelected }) => userSelected)[0]
      return (
        <VideoPlayer mediaResponse={mediaResponse} mediaUrl={mediaUrl} />
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
    return <>{this.renderVideoRecorder()}</>
  }
}

export const Preview = connector(PreviewComponent)
