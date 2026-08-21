import { Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Card,
  Input,
  Typography,
} from 'antd'

import { DownloadOutlined, EyeInvisibleOutlined, EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
import { downloadTextFile } from '~/utils/downloadTextFile'
import { UnsupportedBrowser } from './UnsupportedBrowser'
import VideoPlayer from './VideoPlayer'
import MediaRecorder from '~/components/MediaRecorder'
import { VideoPreview } from './VideoPreview'

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
    this.state = {
      showTranscription: false,
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

  handleDownloadTranscription = (mediaResponse) => {
    const { model } = this.props

    if (!mediaResponse?.transcriptionText) return
    downloadTextFile(
      mediaResponse.transcriptionText,
      `transcription_${model.id}.txt`,
    )
  }

  handleCopyContentEvents = (e) => {
    const { mediaResponses } = this.props
    const mediaResponse = mediaResponses?.filter(({ userSelected }) => userSelected)[0]
    if (mediaResponse?.disableTranscriptDownload) {
      e.preventDefault()
    }
  }

  renderVideoRecorder () {
    const {
      model,
      mediaUrl,
      readOnly,
      markQuestionInProgress,
      removeQuestionInProgress,
      isAssessmentTimedOut,
      mediaResponses,
      features,
    } = this.props

    const { showTranscription } = this.state

    if (readOnly) {
      const mediaResponse = mediaResponses.filter(({ userSelected }) => userSelected)[0]
      return (
        <>
          {mediaResponse?.hideParticipantVideo
            ? (
              <Card>
                <Typography.Text type="secondary">
                  {I18n.t('admin.scheduling_columns_video_hidden_for_privacy')}
                </Typography.Text>
              </Card>
            )
            : mediaResponse?.url && <VideoPlayer mediaResponse={mediaResponse} mediaUrl={mediaUrl} />}
          {mediaResponse?.transcriptionText && (
            <Card>
              <div>
                <Typography.Text strong>
                  {I18n.t('shared.transcriptions')}
                  {': '}
                </Typography.Text>
                <Button
                  className="ms-2"
                  type="text"
                  icon={showTranscription ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => this.setState({ showTranscription: !showTranscription })}
                >
                  {I18n.t('shared.view')}
                </Button>
                {!mediaResponse?.disableTranscriptDownload && (
                  <Button
                    className="ms-2"
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={() => this.handleDownloadTranscription(mediaResponse)}
                  >
                    {I18n.t('shared.download')}
                  </Button>
                )}
              </div>
              {showTranscription && (
                <Input.TextArea
                  value={mediaResponse.transcriptionText}
                  readOnly
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  className="mt-4"
                  onCopy={this.handleCopyContentEvents}
                  onCut={this.handleCopyContentEvents}
                  onContextMenu={this.handleCopyContentEvents}
                  style={{ userSelect: mediaResponse?.disableTranscriptDownload ? 'none' : 'auto' }}
                />
              )}
            </Card>
          )}
        </>
      )
    }

    return (
      <div className="col">
        {features?.new_video_recording_ui ? (
          <MediaRecorder
            key={model.id}
            mediaUrl={mediaUrl}
            questionId={model.id}
            maxDuration={model.props.duration}
            onSuccessUpload={this.successUpload}
            onDeleteMedia={this.deleteMedia}
            mediaResponse={mediaResponses[mediaResponses.length - 1]}
            markQuestionInProgress={markQuestionInProgress}
            removeQuestionInProgress={removeQuestionInProgress}
            isAssessmentTimedOut={isAssessmentTimedOut}
          />
        ) : (
          <VideoPreview
            key={model.id}
            questionId={model.id}
            maxDuration={model.props.duration}
            markQuestionInProgress={markQuestionInProgress}
            removeQuestionInProgress={removeQuestionInProgress}
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
