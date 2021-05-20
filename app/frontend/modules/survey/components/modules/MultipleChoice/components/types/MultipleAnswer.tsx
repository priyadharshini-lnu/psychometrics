import React, { FC } from 'react'
import { Checkbox, Space } from 'antd'

import LabelEditor from 'components/LabelEditor'

import useForceUpdate from 'hooks/useUpdate'

import { BuilderModel } from 'modules/survey/interfaces/questions/MultipleChoice'

interface Props {
  model: BuilderModel
}

const MultipleAnswer: FC<Props> = ({ model }) => {
  const {
    props: {
      notApplicableLabel,
      notApplicable,
      position,
      choices,
      choicesTexts,
    },
    moduleConfig,
  } = model

  const forceUpdate = useForceUpdate()

  const changeLabel = (i: number, text: string) => {
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    forceUpdate()
  }

  const handleNotApplicableLabelChange = (value: string) => {
    model.changeProps({ notApplicableLabel: value })
    forceUpdate()
  }

  return (
    <Checkbox.Group value={undefined} className="mb-4">
      <Space
        direction={position === 'Horizontal' ? 'horizontal' : 'vertical'}
        size="small"
        wrap
      >
        {Array.from({ length: choices }, (_, index) => (
          <Checkbox>
            <LabelEditor
              value={
                choicesTexts[index] || moduleConfig.defaultChoiceText(index + 1)
              }
              onChange={(value: string) => changeLabel(index, value)}
            />
          </Checkbox>
        ))}
        {notApplicable && (
          <Checkbox>
            <LabelEditor
              value={notApplicableLabel}
              onChange={handleNotApplicableLabelChange}
            />
          </Checkbox>
        )}
      </Space>
    </Checkbox.Group>
  )
}

export default MultipleAnswer
