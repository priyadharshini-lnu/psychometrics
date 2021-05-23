import React, { FC } from 'react'
import { Radio, Space } from 'antd'

import LabelEditor from 'components/LabelEditor'

import useForceUpdate from 'hooks/useUpdate'

import { BuilderModel } from 'modules/survey/interfaces/questions/MultipleChoice'

interface Props {
  model: BuilderModel
}

const SingleAnswer: FC<Props> = ({ model }) => {
  const {
    moduleConfig,
    props: {
      notApplicable,
      notApplicableLabel,
      choices,
      choicesTexts,
      position,
    },
  } = model

  const forceUpdate = useForceUpdate()

  const changeLabel = (i: number, value: string) => {
    model.changeArrayProps({ collection: 'choicesTexts', i, val: value })
    forceUpdate()
  }

  const handleNotApplicableLabelChange = (value: string) => {
    model.changeProps({ notApplicableLabel: value })
    forceUpdate()
  }

  return (
    <Radio.Group value={null} className="mb-4">
      <Space
        direction={position === 'Horizontal' ? 'horizontal' : 'vertical'}
        size="small"
        wrap
      >
        {Array.from({ length: choices }, (_, index) => (
          <Radio>
            <LabelEditor
              value={
                choicesTexts[index] || moduleConfig.defaultChoiceText(index + 1)
              }
              onChange={(value: string) => changeLabel(index, value)}
            />
          </Radio>
        ))}
        {notApplicable && (
          <Radio>
            <LabelEditor
              value={notApplicableLabel}
              onChange={handleNotApplicableLabelChange}
            />
          </Radio>
        )}
      </Space>
    </Radio.Group>
  )
}

export default SingleAnswer
