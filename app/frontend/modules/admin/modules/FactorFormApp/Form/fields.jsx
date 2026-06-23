import { Tooltip } from 'antd'
import { QuestionCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { SafeHTML } from '~/components/SafeHTML'

const ScoringStrategyLabel = () => (
  <span>
    <span className="mr4">{I18n.t('admin.factors_form_scoring_strategy')}</span>
    <Tooltip
      title={(
        <SafeHTML html={I18n.t('admin.factors_form_scoring_strategies_tip')} />
      )}
    >
      <span><QuestionCircleOutlined /></span>
    </Tooltip>
  </span>
)

const FIELDS = [
  {
    label: 'Name',
    name: 'name',
    type: 'Input',
    required: true,
  },
  {
    label: 'Code',
    name: 'code',
    type: 'Input',
    required: false,
  },
  {
    label: 'Description',
    name: 'description',
    type: 'TextArea',
  },
  {
    label: I18n.t('admin.what_to_look_for'),
    name: 'what_to_look_for',
    type: 'TextArea',
    required: false,
    placeholder: I18n.t('admin.what_to_look_for_placeholder'),
  },
  {
    label: <ScoringStrategyLabel />,
    name: 'scoring_strategy',
    type: 'Select',
    getOptions: ({ scoringStrategies }) => scoringStrategies,
  },
]

export default FIELDS
