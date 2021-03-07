import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Radio, Typography } from 'antd'

import { RadioChangeEvent } from 'antd/lib/radio'
import { Question } from 'modules/survey/interfaces/builder/Question'

import { openModal } from 'modules/admin/core/ui/modals'
import { changeValidation } from 'modules/survey/core/builder/assessment/question/actions'

import Condition from 'models/QuestionCondition'
import ValidationTypeFields from './components/ValidationTypeFields'
import { LABELS } from './constants'

const connector = connect(null, {
  openCustomValidation: data => openModal('customValidation', data),
  changeValidation,
})

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  model: Question
  update: () => void
}

type Props = OwnProps & PropsFromRedux

const ValidationType: FC<Props> = ({
  model,
  update,
  changeValidation,
  openCustomValidation,
}) => {
  const {
    moduleConfig: { validations },
    validation: { type },
    props: { type: answerType },
  } = model

  const handleOnChange = (event: RadioChangeEvent) => {
    const {
      target: { value },
    } = event

    if (value === 'Custom') {
      if (model.validation.type !== 'Custom') {
        changeValidation(model, {
          type: 'Custom',
          args: { conditions: [new Condition({ subject: model.id })] },
        })
      }
      openCustomValidation({ questionId: model.id })
    } else {
      changeValidation(model, { type: value, args: {} })
      update()
    }
  }

  let availableValidations: string[] = []
  if (Array.isArray(validations)) {
    availableValidations = Array.from(validations)
  } else if (validations && Array.isArray(validations[answerType])) {
    availableValidations = Array.from(validations[answerType])
  }

  return (
    <section className="ms-4 me-4 mb-4">
      <Typography.Text strong>Validation type</Typography.Text>
      <Radio.Group className="mt-2" value={type} onChange={handleOnChange}>
        <Radio value="None">None</Radio>
        {availableValidations.map((availableValidation, index) => (
          <Radio key={index} value={availableValidation}>
            {LABELS[availableValidation]}
          </Radio>
        ))}
        <Radio value="Custom">Custom</Radio>
      </Radio.Group>
      <ValidationTypeFields model={model} update={update} />
    </section>
  )
}

export default connector(ValidationType)
