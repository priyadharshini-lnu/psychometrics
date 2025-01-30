import { Space, Typography, Divider } from 'antd'
import useForceUpdate from '~/hooks/useUpdate'
import ChoicesInput from '~/modules/survey/components/ChoicesInput'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'

const { I18n } = window

export function Properties (props) {
  const { model, showOnlyTranslatable } = props
  const forceUpdate = useForceUpdate()
  const onChange = (fieldName, val) => {
    if (fieldName === 'minFactors' && val > model.props.maxFactors) {
      model.props.maxFactors = val
    }
    model.props[fieldName] = val
    model.update()
  }

  if (showOnlyTranslatable) {
    return (
      <div>
        <ValidationTypes restricted model={model} update={forceUpdate} />
      </div>
    )
  }

  return (
    <div>
      <Space direction="vertical" className="ms-4 me-4">
        <Typography.Text>
          {I18n.t('frontend.questions.campaign_factor_feedback.min_factors')}
        </Typography.Text>
        <ChoicesInput
          value={model.props.minFactors}
          onChange={val => onChange('minFactors', val)}
          minValue={1}
        />
        <Typography.Text>
          {I18n.t('frontend.questions.campaign_factor_feedback.max_factors')}
        </Typography.Text>
        <ChoicesInput
          minValue={model.props.minFactors}
          value={model.props.maxFactors}
          onChange={val => onChange('maxFactors', val)}
        />
      </Space>
      <Divider />
      <RequiredValidations
        model={model}
        update={() => forceUpdate}
      />
      <ValidationTypes restricted model={model} update={forceUpdate} />
    </div>
  )
}
