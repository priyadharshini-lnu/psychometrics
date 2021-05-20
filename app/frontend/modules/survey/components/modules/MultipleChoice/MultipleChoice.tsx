import React, { FC, useMemo } from 'react'

import TextEditor from 'components/TextEditor'
import Templates from 'modules/survey/components/modules/MultipleChoice/components/Templates'

import useForceUpdate from 'hooks/useUpdate'

import { BuilderModel } from 'modules/survey/interfaces/questions/MultipleChoice'

interface Props {
  model: BuilderModel
}

export const MultipleChoice: FC<Props> = ({ model }) => {
  const { type, questionText } = model.props

  const forceUpdate = useForceUpdate()

  const changeText = (value: string) => {
    model.changeProps({ questionText: value })
    forceUpdate()
  }

  const answerType = useMemo(() => {
    const View = Templates[type]
    return <View model={model} key={type} />
  }, [type])

  return (
    <div style={{ position: 'relative' }}>
      <div className="mt-4">
        <TextEditor
          model={model}
          value={questionText}
          onChange={changeText}
        />
      </div>
      {answerType}
    </div>
  )
}
