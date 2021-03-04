import React, { FC } from 'react'
import { Radio, Checkbox, Typography } from 'antd'

import { RadioChangeEvent } from 'antd/lib/radio'
import { Question } from 'modules/survey/interfaces/builder/Question'

interface Props {
  model: Question
  update: () => void
}

export const RequiredValidations: FC<Props> = ({ model, update }) => {
  const handleResponseTypeRadio = (event: RadioChangeEvent) => {
    const {
      target: { value },
    } = event

    model.changeReqValidations({ type: value })
    update()
  }

  const handleEnableCheckbox = () => {
    model.changeReqValidations({ enabled: !model.requiredValidation.enabled })
    update()
  }

  const {
    requiredValidation: { enabled: requiredIsValidation, type },
  } = model

  return (
    <section className="ms-4 me-4 mb-4">
      <Typography.Text strong>Validation option</Typography.Text>
      <Checkbox
        className="mt-2"
        checked={requiredIsValidation}
        onChange={handleEnableCheckbox}
      >
        Enable
      </Checkbox>
      {requiredIsValidation && (
        <div className="mt-2">
          <Typography.Text>Reponse type</Typography.Text>
          <Radio.Group
            className="mt-2"
            value={type}
            onChange={handleResponseTypeRadio}
          >
            <Radio value="Force">Force response</Radio>
            <Radio value="Request">Request response</Radio>
          </Radio.Group>
        </div>
      )}
    </section>
  )
}
