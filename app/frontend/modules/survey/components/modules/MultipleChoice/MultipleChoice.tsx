import { FC, lazy, Suspense } from 'react'
import { Spin } from 'antd'

import useForceUpdate from '~/hooks/useUpdate'

import { BuilderModel } from '~/modules/survey/interfaces/questions/MultipleChoice'
import TextEditor from '~/modules/survey/components/TextEditor'

const SingleAnswer = lazy(() => import('./components/types/SingleAnswer'))
const MultipleAnswer = lazy(() => import('./components/types/MultipleAnswer'))
const Dropdown = lazy(() => import('./components/types/Dropdown'))

interface Props {
  model: BuilderModel
}

export const MultipleChoice: FC<Props> = ({ model }) => {
  const forceUpdate = useForceUpdate()

  const changeText = (value: string) => {
    model.changeProps({ questionText: value })
    forceUpdate()
  }

  const { type, questionText } = model.props

  const builderAnswerTypeProps = {
    model,
    key: type,
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="mt-4">
        <TextEditor value={questionText} onChange={changeText} />
      </div>
      <Suspense fallback={<Spin />}>
        {type === 'SingleAnswer' && (
          <SingleAnswer {...builderAnswerTypeProps} />
        )}
        {type === 'MultipleAnswer' && (
          <MultipleAnswer {...builderAnswerTypeProps} />
        )}
        {type === 'Dropdown' && <Dropdown {...builderAnswerTypeProps} />}
      </Suspense>
    </div>
  )
}
