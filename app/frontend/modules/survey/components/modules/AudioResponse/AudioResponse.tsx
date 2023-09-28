import { FC } from 'react'

import { BuilderModel } from '~/modules/survey/interfaces/questions/AudioResponse'
import useForceUpdate from '~/hooks/useUpdate'
import TextEditor from '~/modules/survey/components/TextEditor'
import AudioRecorder from '~/modules/survey/components/AudioRecorder'

interface Props {
  model: BuilderModel
  markQuestionInProgress: (questionId: number, progressState: string) => void
  removeQuestionInProgress: (questionId: number) => void
}

export const AudioResponse: FC<Props> = ({
  model,
  markQuestionInProgress,
  removeQuestionInProgress,
}) => {
  const forceUpdate = useForceUpdate()

  const {
    props: { questionText },
  } = model

  const handleOnTextChange = (value: string) => {
    model.props.questionText = value
    model.update()
    forceUpdate()
  }

  return (
    <div>
      <div className="mt-4">
        <TextEditor
          value={questionText}
          onChange={handleOnTextChange}
        />
      </div>
      <AudioRecorder
        model={model}
        mediaUrl=""
        fakeUpload
        disableRecording
        markQuestionInProgress={markQuestionInProgress}
        removeQuestionInProgress={removeQuestionInProgress}
      />
    </div>
  )
}
