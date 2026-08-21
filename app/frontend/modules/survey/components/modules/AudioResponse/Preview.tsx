import { FC, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import {
  Button,
  Card,
  Input,
  Typography,
} from 'antd'
import { DownloadOutlined, EyeInvisibleOutlined, EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/survey/core/rootReducers'
import { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { PreviewModel } from '~/modules/survey/interfaces/questions/AudioResponse'
import {
  markQuestionInProgress,
  removeQuestionInProgress,
  addMediaResponse,
  removeMediaResponse,
} from '~/modules/survey/core/preview/FlowProcessor/actions'
import {
  getI18n,
  getMediaResponseByQuestionId,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'

import AudioRecorder from '~/modules/survey/components/AudioRecorder'
import { SafeHTML } from '~/components/SafeHTML'
import { downloadTextFile } from '~/utils/downloadTextFile'

interface OwnProps {
  model: PreviewModel
  readOnly: boolean
}

const connector = connect(
  ({ preview }: RootState, { model }: OwnProps) => ({
    type: preview.type,
    mediaUrl: preview.mediaUrl,
    I18n: getI18n(preview),
    mediaResponse: getMediaResponseByQuestionId(preview, model.id),
  }),
  {
    markQuestionInProgress,
    removeQuestionInProgress,
    addMediaResponse,
    removeMediaResponse,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

const PreviewComponent: FC<Props> = ({
  model,
  I18n,
  type,
  mediaUrl,
  readOnly,
  mediaResponse,
  addMediaResponse,
  removeMediaResponse,
  removeQuestionInProgress,
  markQuestionInProgress,
}) => {
  const [showTranscription, setShowTranscription] = useState(false)

  const handleUploadSuccess = (data: MediaResponse) => {
    addMediaResponse(data)
  }

  const handleDiscardRecording = () => {
    removeMediaResponse(model.id)
  }

  const handleDownloadTranscription = () => {
    if (!mediaResponse?.transcriptionText) return
    downloadTextFile(
      mediaResponse.transcriptionText,
      `transcription_${model.id}.txt`,
    )
  }

  const handleCopyContentEvents = (
    e: React.ClipboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLTextAreaElement>,
  ) => {
    if (mediaResponse?.disableTranscriptDownload) {
      e.preventDefault()
    }
  }

  const isPreview = type === 'preview_assessment'

  return (
    <div>
      <SafeHTML
        html={I18n.tQuestion(model, 'questionText')}
        className="mb-4"
        config="adminRichText"
      />
      <AudioRecorder
        mediaUrl={mediaUrl}
        model={model}
        fakeUpload={isPreview}
        readOnly={readOnly}
        mediaResponse={mediaResponse}
        onSuccessUpload={handleUploadSuccess}
        onRecordingDiscard={handleDiscardRecording}
        markQuestionInProgress={markQuestionInProgress}
        removeQuestionInProgress={removeQuestionInProgress}
      />
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
              onClick={() => setShowTranscription(!showTranscription)}
            >
              {I18n.t('shared.view')}
            </Button>
            {!mediaResponse?.disableTranscriptDownload && (
              <Button
                className="ms-2"
                type="text"
                icon={<DownloadOutlined />}
                onClick={handleDownloadTranscription}
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
              onCopy={handleCopyContentEvents}
              onCut={handleCopyContentEvents}
              onContextMenu={handleCopyContentEvents}
              style={{ userSelect: mediaResponse?.disableTranscriptDownload ? 'none' : 'auto' }}
            />
          )}
        </Card>
      )}
    </div>
  )
}

export const Preview = connector(PreviewComponent)
