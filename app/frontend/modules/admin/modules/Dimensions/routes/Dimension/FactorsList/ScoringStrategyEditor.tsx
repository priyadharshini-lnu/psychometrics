import {
  Checkbox,
  Form,
  InputNumber,
} from 'antd'
import { LuaEditor } from '~/glint'
import ExternalList from './ExternalList'
import SubFactorList from './SubFactorList'
import { IndicatorList } from './IndicatorList'

const { I18n } = window

const INDICATOR_SUPPORTED_STRATEGIES = [
  'sub_factors_average',
  'sub_factors_conditional_average',
  'sub_factors_sum',
]

const CustomFormula = () => (
  <Form.Item
    label={I18n.t('admin.factors_form_scoring_strategies_custom_formula')}
    name="custom_formula"
    className="mtm"
  >
    <LuaEditor />
  </Form.Item>
)

const QuestionsPercentage = () => (
  <>
    <Form.Item
      label={I18n.t('admin.scale_min')}
      name="scaleMin"
      dependencies={['scaleMax']}
      rules={[
        ({ getFieldValue }) => ({
          validator (_, value) {
            if (value == null) return Promise.resolve()
            if (value < 0) {
              return Promise.reject(new Error(I18n.t('admin.scale_value_must_not_be_negative')))
            }

            const scaleMax = getFieldValue('scaleMax')
            if (scaleMax == null || value <= scaleMax) {
              return Promise.resolve()
            }

            return Promise.reject(new Error(I18n.t('admin.scale_min_must_be_less_than_scale_max')))
          },
        }),
      ]}
    >
      <InputNumber min={0} />
    </Form.Item>
    <Form.Item
      label={I18n.t('admin.scale_max')}
      name="scaleMax"
      dependencies={['scaleMin']}
      rules={[
        ({ getFieldValue }) => ({
          validator (_, value) {
            if (value == null) return Promise.resolve()
            if (value < 0) {
              return Promise.reject(new Error(I18n.t('admin.scale_value_must_not_be_negative')))
            }

            const scaleMin = getFieldValue('scaleMin')
            if (scaleMin == null || value >= scaleMin) {
              return Promise.resolve()
            }

            return Promise.reject(new Error(I18n.t('admin.scale_max_must_be_greater_than_scale_min')))
          },
        }),
      ]}
    >
      <InputNumber min={0} />
    </Form.Item>
  </>
)

export const PercentageCheckbox = ({ strategy }) => {
  if (strategy === 'sub_factor_questions_sum' || strategy === 'questions_sum') {
    return (
      <Form.Item
        name="usePercentage"
        valuePropName="checked"
      >
        <Checkbox>
          Use percentage of correct answers
          <br />
          <small>(If normed score not present)</small>
        </Checkbox>
      </Form.Item>
    )
  }

  return null
}

export const SubfactorNormScoreCheckbox = ({ strategy }) => {
  if (!['sub_factors_average', 'sub_factors_conditional_average', 'sub_factors_sum'].includes(strategy)) { return null }

  return (
    <Form.Item
      name="useSubFactorNormScore"
      valuePropName="checked"
    >
      <Checkbox>
        {I18n.t('admin.factors_form_use_sub_factor_norm_score')}
      </Checkbox>
    </Form.Item>
  )
}


export const ScoringStrategyEditor = ({ strategy, form, childrenFactorType }) => {
  if (!strategy) return null

  if (strategy === 'custom_formula') {
    return <CustomFormula />
  }

  if (strategy === 'questions_percentage') {
    return <QuestionsPercentage />
  }

  if (INDICATOR_SUPPORTED_STRATEGIES.includes(strategy) && childrenFactorType === 'indicator') {
    return <IndicatorList form={form} />
  }

  if (strategy.startsWith('sub_factor') || INDICATOR_SUPPORTED_STRATEGIES.includes(strategy)) {
    return <SubFactorList form={form} />
  }

  if (strategy === 'external_score') {
    return <ExternalList />
  }

  return null
}
