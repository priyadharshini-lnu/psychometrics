import { Component } from 'react'
import { connect } from 'react-redux'

import { getFeatures } from '~/core/config.ts'
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
import MediaRecorder from '~/components/MediaRecorder'

const connector = connect(
  (state, { model }) => ({
    type: state.preview.type,
    mediaUrl: state.preview.mediaUrl,
    I18n: getI18n(state.preview),
    isAssessmentTimedOut: isAssessmentTimedOut(state.preview),
    mediaResponses: getMediaResponsesByQuestionId(state.preview, model.id),
    features: getFeatures(state),
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
  features,
}) => {
  const { isBrowserSupported, supportedBrowsers } = checkBrowserSupportForFeature(
    BROWSER_FEATURES.mediaRecorderAPI,
  )

  return (
    <div>
      <SafeHTML
        html={I18n.tQuestion(model, 'questionText')}
        className="mb-4"
        style={{ marginLeft: '32px' }}
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
          features={features}
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
      features,
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
        {features?.new_video_recording_ui ? (
          <MediaRecorder
            mediaUrl={mediaUrl}
            questionId={model.id}
            maxDuration={model.props.duration}
            mediaResponse={mediaResponses[mediaResponses.length - 1]}
          />
        ) : (
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
        )
        }
      </div>
    )
  }

  render () {
    return <>{this.renderVideoRecorder()}</>
  }
}

export const Preview = connector(PreviewComponent)
