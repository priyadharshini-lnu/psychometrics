import { FC } from 'react'
import {
  Select, Space, Typography, Checkbox,
} from 'antd'

import AppStore from '~/modules/reports/store/AppStore'
import { PropertiesModel, TableSectionsType, TableStyleType } from '~/modules/reports/interfaces/tables/HighestLowest'

import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import PropertyNumber from '~/modules/reports/components/PropertyNumber'
import { FactorsList } from './dataSources/FactorList'
import { QuestionList } from './dataSources/QuestionList'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'
import PaginationOptions from '~/modules/reports/components/PaginationOptions'
import { RenderJobFactorModes, RenderSkillTypeModes } from '../../Properties'

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
  modules: PropertiesModel[]
}

export const Properties: FC<Props> = ({ modules }) => {
  const model = modules[0]
  const {
    props: {
      sourceType, factorIds, questionsChoices, sections = TableSectionsType.ALL,
      tableStyle = TableStyleType.UNSTYLED, hideValues = false, noOfItems, scoreCutoff,
    },
    assessment_id,
  } = model

  const onChange = (key: string, value: unknown) => {
    modules.forEach((module) => {
      module.props[key] = value
      module.update()
    })
  }

  const collectFactors = () => {
    const model = modules[0]
    const dimensionId = AppStore.getAssessmentById(assessment_id)?.dimensionId ?? ''
    let allFactors = AppStore.factors?.[dimensionId] ?? []

    const { skillType } = model.props

    // Apply skillType filtering if skillType is selected i.e Skill type
    if (skillType && skillType.length > 0) {
      allFactors = allFactors.filter(factor => skillType.includes(factor.skill_type))
    }

    const mappedFactors = allFactors.map(factor => factor.id)
    return mappedFactors
  }

  const changeSkillType = (value) => {
    modules.forEach((model) => {
      if (!value || value.length === 0) {
        model.props.skillType = undefined
        model.props.factorIds = []
      } else {
        model.props.skillType = value
        const factorIds = collectFactors()
        model.props.factorIds = factorIds
      }
      model.update()
    })
  }

  return (
    <Space direction="vertical" size="small">
      <SourceTypeButtonGroup model={model} onChange={onChange} />


      {sourceType === 'Factor' && (
        <>
          <RenderJobFactorModes modules={modules} />
          <RenderSkillTypeModes modules={modules} callback={changeSkillType} />

          <FactorsList
            assessmentId={assessment_id}
            value={factorIds}
            onChange={onChange}
          />
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
        noOfItems={noOfItems}
        scoreCutoff={scoreCutoff}
        onChange={onChange}
      />
      {modules.length > 1 ? null
        : (
          <div className="mtm">
            <PaginationOptions module={model} onChange={onChange} />
          </div>
        )}
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
  noOfItems: number | null
  scoreCutoff: number | null
  onChange(key: string, value: unknown): void
}

const TablePreferences: FC<TablePreferencesProps> = ({
  hideValues, noOfItems, scoreCutoff, onChange,
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
      label="Cutoff"
      defaultValue={scoreCutoff ?? undefined}
      size="small"
      min={1}
      step={1}
      onChange={value => onChange('scoreCutoff', value)}
    />
  </Space>
)


export default Properties
