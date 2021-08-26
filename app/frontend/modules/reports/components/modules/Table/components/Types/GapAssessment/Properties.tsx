import React, { FC } from 'react'
import { Space, Typography, Select } from 'antd'

import { PropertiesModel, GapType } from 'modules/reports/interfaces/tables/Gap'

import PropertyFilter from 'modules/reports/components/PropertyFilter/components/PropertyFilter'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'
import { FactorsList } from './dataSources/FactorList'
import { QuestionList } from './dataSources/QuestionList'

const GAP_TYPE_OPTIONS = [
  {
    label: 'All',
    value: GapType.ALL,
  },
  {
    label: 'Positive',
    value: GapType.POSITIVE,
  },
  {
    label: 'Negative',
    value: GapType.NEGATIVE,
  },
]

interface Props {
  model: PropertiesModel
}

export const Properties: FC<Props> = ({ model }) => {
  const {
    props: {
      gapType, sourceType, questionsChoices, factorIds,
    },
    assessment_id,
  } = model

  const onChange = (key: string, value: unknown) => {
    model.props[key] = value
    model.update()
  }

  return (
    <Space direction="vertical" size="small">
      <SourceTypeButtonGroup model={model} onChange={onChange} />
      {sourceType === 'Factor' && (
        <FactorsList
          assessmentId={assessment_id}
          value={factorIds}
          onChange={onChange}
        />
      )}
      {sourceType === 'Question' && (
        <QuestionList
          assessmentId={assessment_id}
          value={questionsChoices}
          onChange={onChange}
        />
      )}
      <PropertyFilter model={model} />
      <GapTypeSelect
        value={gapType}
        onChange={value => onChange('gapType', value)}
      />
    </Space>
  )
}

interface GapTypeSelectProps {
  value: GapType
  onChange(value: number): void
}

const GapTypeSelect: FC<GapTypeSelectProps> = ({ value, onChange }) => (
  <div>
    <Typography.Text>Gap type</Typography.Text>
    <Select
      className="w-100"
      size="small"
      value={value}
      options={GAP_TYPE_OPTIONS}
      onChange={onChange}
    />
  </div>
)

export default Properties
