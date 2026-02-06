import React from 'react'
import uniq from 'lodash/uniq'
import get from 'lodash/get'
import filter from 'lodash/filter'
import find from 'lodash/find'
import Select from 'react-select'
import { Space } from 'antd'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { Assessment } from '~/modules/reports/core/interfaces/Assessment'
import Module from '~/modules/reports/core/interfaces/Module'
import { Factor } from '~/modules/reports/core/interfaces/Factor'

interface Props {
  assessment: Assessment
  modules: Module[]
  onSelect(): void
  singleChoice: boolean
}

export const SavilleFactor: React.FC<Props> = ({
  modules, assessment, onSelect, singleChoice,
}) => {
  const model = modules[0]
  const getAllValueTypes = () => {
    const valueTypes = assessment.factors.reduce((acc, factor) => {
      const scoreType = model.getScoreType()
      if (Object.keys(factor.score_types).includes(scoreType)) {
        return acc.concat(factor.score_types[scoreType])
      }
      return acc
    }, [])
    return uniq(valueTypes).reduce((acc, valueType) => [...acc, { value: valueType, label: valueType }], [])
  }

  const getFactors = () => {
    const scoreType = model.getScoreType()
    const valueType = model.getValueType()

    return filter<Factor>(assessment.factors, factor => (
      factor.score_types[scoreType] && factor.score_types[scoreType].includes(valueType)
    ))
  }

  const onValueTypeChange = ({ value }) => {
    modules.forEach((module) => {
      module.props.source.valueType = value
      module.props.source.factors = null
    })
    onSelect()
  }

  const onFactorChange = (data) => {
    modules.forEach((module) => {
      module.props.source.factors = singleChoice ? data && [data.id] : data && data.map(f => f.id)
    })
    onSelect()
  }

  const factors = getFactors()
  const values = get(model, ['props', 'source', 'factors']) || []
  const selectedFactor = singleChoice ? { id: values[0] } : values.map(f => ({ id: f }))
  const valueTypes = getAllValueTypes()
  const selectedValueType = model.getValueType()

  return (
    <Space orientation="vertical" className="w-100">
      <Select
        name="form-field-name"
        value={getValue(valueTypes, selectedValueType)}
        options={valueTypes}
        isClearable={false}
        autoFocus={false}
        onChange={onValueTypeChange}
      />
      <Select
        name="form-field-name"
        value={getValue(factors, selectedFactor)}
        options={factors}
        getOptionValue={opt => opt.id}
        getOptionLabel={opt => (find(factors, opt) as Factor)?.name}
        isClearable={false}
        autoFocus={false}
        isMulti={!singleChoice}
        onChange={onFactorChange}
      />
    </Space>
  )
}
