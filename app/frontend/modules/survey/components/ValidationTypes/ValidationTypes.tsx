import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Radio, Typography, Space } from 'antd'

import { RadioChangeEvent } from 'antd/es/radio'
import { BasePropertiesModel } from '~/modules/survey/interfaces/questions/Base'

import { openModal } from '~/modules/admin/core/ui/modals'
import { changeValidation } from '~/modules/survey/core/builder/assessment/question/actions'

import Condition from '~/modules/survey/models/QuestionCondition'
import ValidationTypeFields from './components/ValidationTypeFields'
import { LABELS } from './constants'

const connector = connect(null, {
  openCustomValidation: data => openModal('customValidation', data),
  changeValidation,
})

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  model: BasePropertiesModel
  update: () => void
  restricted?: boolean
}

type Props = OwnProps & PropsFromRedux

const ValidationType: FC<Props> = ({
  model,
  update,
  changeValidation,
  openCustomValidation,
  restricted,
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
      // openCustomValidation({ questionId: model.id })
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
          <div key={index}>
            <Radio value={availableValidation}>
              {LABELS[availableValidation]}
            </Radio>
          </div>
        ))}
        {!restricted && (
          <Radio value="Custom">
            <Space>
              Custom
              {type === 'Custom' && (
                <a onClick={() => openCustomValidation({ questionId: model.id })}>Edit</a>
              )}
            </Space>
          </Radio>
        )}
      </Radio.Group>


      <ValidationTypeFields model={model} update={update} />
    </section>
  )
}

export default connector(ValidationType)
