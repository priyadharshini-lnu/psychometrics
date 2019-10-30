import React from 'react'
import { Icon, Tooltip } from 'antd'

const ScoringStrategyLabel = () => (
  <span>
    Scoring Strategy&nbsp;
    <Tooltip
      title={(
        <div>
          <strong>Questions:</strong>
          {' '}
          This is like current scoring method when there are questions linked to a factor.
          <br />
          <br />
          <strong>Questions of Other Factors:</strong>
          {' '}
          This is like current scoring method when there are sub-factors
          for a factor, only change is the addition of weight.
          <br />
          <br />
          <strong>Weighted Sum of Factors:</strong>
          {' '}
          Here the scores of the selected other factors are multiplied by
          their weights are added.
        </div>
      )}
    >
      <Icon type="question-circle-o" />
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
