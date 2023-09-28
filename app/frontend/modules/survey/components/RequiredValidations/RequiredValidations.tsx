import { FC } from 'react'
import { Radio, Checkbox } from 'antd'

import { RadioChangeEvent } from 'antd/lib/radio'
import { BasePropertiesModel } from '~/modules/survey/interfaces/questions/Base'

const { I18n } = window

interface Props {
  model: BasePropertiesModel
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
      <Checkbox
        className="mt-2"
        checked={requiredIsValidation}
        onChange={handleEnableCheckbox}
      >
        {I18n.t('administration.survey_builder.property_panel.validation_response_type')}
      </Checkbox>
      {requiredIsValidation && (
        <div className="mt-2">
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
