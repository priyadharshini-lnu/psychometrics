import React, { FC } from 'react'
import {
  Select, Space, Typography, Checkbox,
} from 'antd'

import { PropertiesModel, TableSectionsType, TableStyleType } from 'modules/reports/interfaces/tables/HighestLowest'

import PropertyFilter from 'modules/reports/components/PropertyFilter'
import { FactorsList } from './dataSources/FactorList'
import { QuestionList } from './dataSources/QuestionList'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

const TABLE_SECTIONS_OPTIONS = [
  {
    label: 'All',
    value: TableSectionsType.ALL,
  },
  {
    label: 'Highest',
    value: TableSectionsType.HIGHEST,
  },
  {
    label: 'Lowest',
    value: TableSectionsType.LOWEST,
  },
]

const TABLE_STYLE_OPTIONS = [
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
  model: PropertiesModel
}

export const Properties: FC<Props> = ({ model }) => {
  const {
    props: {
      sourceType, factorIds, questionsChoices, sections = TableSectionsType.ALL,
      tableStyle = TableStyleType.UNSTYLED, hideValues = false,
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
      <TableSectionsSelect
        value={sections}
        onChange={value => onChange('sections', value)}
      />
      <TableStyleSelect
        value={tableStyle}
        onChange={value => onChange('tableStyle', value)}
      />
      <TablePreferences
        hideValues={hideValues}
        onChange={onChange}
      />
    </Space>
  )
}


interface TableSectionsSelectProps {
  value: TableSectionsType
  onChange(value: TableSectionsType): void
}

const TableSectionsSelect: FC<TableSectionsSelectProps> = ({ value, onChange }) => (
  <div>
    <Typography.Text>Show Sections</Typography.Text>
    <Select
      className="w-100"
      size="small"
      value={value}
      options={TABLE_SECTIONS_OPTIONS}
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
      options={TABLE_STYLE_OPTIONS}
      onChange={onChange}
    />
  </div>
)

interface TablePreferencesProps {
  hideValues: boolean
  onChange(key: string, value: unknown): void
}

const TablePreferences: FC<TablePreferencesProps> = ({ hideValues, onChange }) => (
  <div>
    <Checkbox
      checked={hideValues === true}
      onChange={e => onChange('hideValues', e.target.checked)}
    >
      Hide Values
    </Checkbox>
  </div>
)


export default Properties
