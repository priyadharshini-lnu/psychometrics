import { FC } from 'react'
import {
  Space, Typography, Select, Checkbox,
  InputNumber,
} from 'antd'

import { PropertiesModel, GapType } from '~/modules/reports/interfaces/tables/Gap'

import PropertyFilter from '~/modules/reports/components/PropertyFilter/components/PropertyFilter'
import PropertyNumber from '~/modules/reports/components/PropertyNumber'
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
      gapType, sourceType, questionsChoices, factorIds, hideValues = false, noOfItems, gapCutoff, precision,
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
      <TablePreferences
        hideValues={hideValues}
        noOfItems={noOfItems}
        gapCutoff={gapCutoff}
        onChange={onChange}
      />
      <div className="margin-top-10">
        <div>Number Prceision:</div>
        <InputNumber min={0} size="small" value={precision} onChange={val => onChange('precision', val)} />
      </div>
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

interface TablePreferencesProps {
  hideValues: boolean
  noOfItems: number | null
  gapCutoff: number | null
  onChange(key: string, value: unknown): void
}

const TablePreferences: FC<TablePreferencesProps> = ({
  hideValues, noOfItems, gapCutoff, onChange,
}) => (
  <Space direction="vertical">
    <Checkbox
      checked={hideValues === true}
      onChange={e => onChange('hideValues', e.target.checked)}
    >
      Hide Values
    </Checkbox>
    <PropertyNumber
      label="No. of Items"
      defaultValue={noOfItems ?? undefined}
      size="small"
      min={1}
      step={1}
      onChange={value => onChange('noOfItems', value)}
    />
    <PropertyNumber
      label="Min Gap"
      defaultValue={gapCutoff ?? undefined}
      size="small"
      min={0.01}
      step={0.1}
      onChange={value => onChange('gapCutoff', value)}
    />
  </Space>
)


export default Properties
