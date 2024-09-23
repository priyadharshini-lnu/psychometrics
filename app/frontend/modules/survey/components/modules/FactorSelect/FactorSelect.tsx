import { FC, Suspense } from 'react'
import { Spin } from 'antd'

import useForceUpdate from '~/hooks/useUpdate'

import { BuilderModel, FactorModel } from '~/modules/survey/interfaces/questions/FactorSelect'
import TextEditor from '~/modules/survey/components/TextEditor'
import Dropdown from './components/types/Dropdown'

interface Props {
  model: BuilderModel
  factors: FactorModel[]
}

export const FactorSelect: FC<Props> = ({ model, factors }) => {
  const forceUpdate = useForceUpdate()

  const changeText = (value: string) => {
    model.changeProps({ questionText: value })
    forceUpdate()
  }

  const { type, questionText } = model.props

  const builderAnswerTypeProps = {
    factors,
    key: type,
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="mt-4">
        <TextEditor value={questionText} onChange={changeText} />
      </div>
      <Suspense fallback={<Spin />}>
        <Dropdown {...builderAnswerTypeProps} />
      </Suspense>
    </div>
  )
}
