import { Tooltip } from 'antd'
import { QuestionCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { SafeHTML } from '~/components/SafeHTML'

const ScoringStrategyLabel = () => (
  <span>
    <span className="mr4">{I18n.t('administration.factors.form.scoring_strategy')}</span>
    <Tooltip
      title={(
        <SafeHTML html={I18n.t('administration.factors.form.scoring_strategies_tip')} />
      )}
    >
      <QuestionCircleOutlined />
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
    label: <ScoringStrategyLabel />,
    name: 'scoring_strategy',
    type: 'Select',
    getOptions: ({ scoringStrategies }) => scoringStrategies,
  },
]

export default FIELDS
