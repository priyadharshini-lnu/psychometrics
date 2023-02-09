import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

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
  const handleUploadSuccess = (data: MediaResponse) => {
    addMediaResponse(data)
  }

  const handleDiscardRecording = () => {
    removeMediaResponse(model.id)
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
    </div>
  )
}

export const Preview = connector(PreviewComponent)
