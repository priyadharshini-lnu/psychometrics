import { FC } from 'react'
import {
  Space, Typography, Select, Checkbox,
  InputNumber,
} from 'antd'

import { HintCheckbox } from '~/glint'
import { PropertiesModel, GapType, TableStyleType } from '~/modules/reports/interfaces/tables/Gap'
import PropertyFilter from '~/modules/reports/components/PropertyFilter/components/PropertyFilter'
import PropertyNumber from '~/modules/reports/components/PropertyNumber'
import PaginationOptions from '~/modules/reports/components/PaginationOptions'
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
const GAP_TABLE_STYLE_OPTIONS = [
  {
    label: 'Unstyled',
    value: TableStyleType.UNSTYLED,
  },
  {
    label: 'Minimal',
    value: TableStyleType.MINIMAL,
  },
]
interface Props {
  modules: PropertiesModel[]
}

export const Properties: FC<Props> = ({ modules }) => {
  const model = modules[0]
  const {
    props: {
      gapType, sourceType, questionsChoices, factorIds, hideValues = false, noOfItems, gapCutoff, precision,
      allFactors, tableStyle = TableStyleType.UNSTYLED,
    },
    assessment_id,
  } = model

  const onChange = (key: string, value: unknown) => {
    modules.forEach((model) => {
      model.props[key] = value
      model.update()
    })
  }

  const changeAll = () => {
    modules.forEach((model) => {
      model.props.allFactors = !allFactors
      model.update()
    })
  }

  return (
    <Space direction="vertical" size="small">
      <SourceTypeButtonGroup model={model} onChange={onChange} />
      {sourceType === 'Factor' && (
        <>
          <HintCheckbox
            label="All Factors"
            checked={!!allFactors}
            onChange={changeAll}
            hints={[
              'When checked, all factors will be displayed.',
              'When unchecked, only selected factors will be displayed.',
            ]}
          />
          {!allFactors && (
            <FactorsList
              assessmentId={assessment_id}
              value={factorIds}
              onChange={onChange}
            />
          )}
        </>
      )}
      {sourceType === 'Question' && (
        <QuestionList
          assessmentId={assessment_id}
          value={questionsChoices}
          onChange={onChange}
        />
      )}
      <PropertyFilter modules={modules} />
      <GapTypeSelect
        value={gapType}
        onChange={value => onChange('gapType', value)}
      />
      <TableStyleSelect
        value={tableStyle}
        onChange={value => onChange('tableStyle', value)}
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
      {modules.length > 1 ? null
        : (
          <div className="mtm">
            <PaginationOptions module={model} onChange={onChange} />
          </div>
        )}
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

interface TableStyleSelectProps {
  value: TableStyleType
  onChange(value: TableStyleType): void
}
const TableStyleSelect: FC<TableStyleSelectProps> = ({ value, onChange }) => (
  <div>

    <Typography.Text>Style</Typography.Text>
    <Select
      className="w-100"
      size="small"
      value={value}
      options={GAP_TABLE_STYLE_OPTIONS}
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
