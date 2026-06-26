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
    label={I18n.t('administration.factors.form.scoring_strategies.custom_formula')}
    name="customFormula"
    className="mtm"
  >
    <LuaEditor />
  </Form.Item>
)

const QuestionsPercentage = () => (
  <>
    <Form.Item
      label="Scale Min"
      name="scaleMin"
    >
      <InputNumber />
    </Form.Item>
    <Form.Item label="Scale Max" name="scaleMax">
      <InputNumber />
    </Form.Item>
  </>
)

export const PercentageCheckbox = ({ strategy }) => {
  if (strategy === 'sub_factor_questions_sum' || strategy === 'questions_sum') {
    return (
      <Form.Item
        name="use_percentage"
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
        {I18n.t('administration.factors.form.use_sub_factor_norm_score')}
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
