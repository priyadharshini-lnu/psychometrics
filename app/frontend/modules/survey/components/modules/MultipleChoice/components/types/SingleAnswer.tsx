import React, { FC } from 'react'
import _ from 'lodash'

import LabelEditor from 'components/LabelEditor'

import { NOT_APPLICABLE } from 'modules/survey/constants/question'
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

  const listStyles = {
    display: position === 'Vertical' ? 'block' : 'flex',
  }

  return (
    <ul style={listStyles}>
      {_.times(choices, i => (
        <li key={i}>
          <input type="radio" name={`choice_${model.name}_${model.id}`} />
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
    <input type="radio" name={NOT_APPLICABLE} />
    <LabelEditor value={value} onChange={onLabelChange} />
  </li>
)

export default SingleAnswer
