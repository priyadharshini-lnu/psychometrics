import React, { FC } from 'react'
import _ from 'lodash'

import LabelEditor from 'components/LabelEditor'

import { NOT_APPLICABLE } from 'modules/survey/constants/question'
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

  const listStyles = {
    display: position === 'Vertical' ? 'block' : 'flex',
  }

  return (
    <ul style={listStyles}>
      {_.times(choices, (i: number) => (
        <li key={i}>
          <input
            type="checkbox"
            name={`choice_${model.name}_${model.id}`}
          />
          <LabelEditor
            value={choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
            onChange={(value: string) => changeLabel(i, value)}
          />
        </li>
      ))}
      {notApplicable && (
        <NotApplicableOption
          value={notApplicableLabel}
          onLabelChange={handleNotApplicableLabelChange}
        />
      )}
    </ul>
  )
}

interface NotApplicableOptionProps {
  value: BuilderModel['props']['choicesTexts'][0]
  onLabelChange(value: string): void
}

const NotApplicableOption: FC<NotApplicableOptionProps> = ({
  value,
  onLabelChange,
}) => (
  <li>
    <input type="checkbox" name={NOT_APPLICABLE} />
    <LabelEditor value={value} onChange={onLabelChange} />
  </li>
)

export default MultipleAnswer
