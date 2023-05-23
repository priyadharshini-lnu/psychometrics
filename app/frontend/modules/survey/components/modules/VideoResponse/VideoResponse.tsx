import { FC } from 'react'

import { BuilderModel } from '~/modules/survey/interfaces/questions/VideoResponse'
import {
  MarkQuestionInProgress,
  RemoveQuestionInProgress,
} from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import useForceUpdate from '~/hooks/useUpdate'
import TextEditor from '~/modules/survey/components/TextEditor'
import VideoRecorder from '~/modules/survey/components/VideoRecorder'

interface Props {
  model: BuilderModel
  markQuestionInProgress: MarkQuestionInProgress
  removeQuestionInProgress: RemoveQuestionInProgress
}

export const VideoResponse: FC<Props> = ({
  model,
  markQuestionInProgress,
  removeQuestionInProgress,
}) => {
  const forceUpdate = useForceUpdate()

  const handleOnChange = (value: string) => {
    model.changeProps({ questionText: value })
    model.update()
    forceUpdate()
  }

  return (
    <div>
      <div className="mt-4">
        <TextEditor
          value={model.props.questionText}
          onChange={handleOnChange}
        />
      </div>
      <div className="mt-4">
        <VideoRecorder
          key={model.id}
          disableRecording
          maxDuration={model.props.duration || 10}
          markQuestionInProgress={markQuestionInProgress}
          removeQuestionInProgress={removeQuestionInProgress}
          fitInFrame={model.props.fitInFrame}
          trackerOptions={model.props.trackerOptions}
        />
      </div>
    </div>
  )
}
