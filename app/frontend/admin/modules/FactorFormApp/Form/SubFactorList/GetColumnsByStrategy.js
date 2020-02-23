import React from 'react'
import { Button, InputNumber, Select } from 'antd'

export default {
  run: (factor, onChange, onRemove, errors) => getColumns(onChange, onRemove, errors).filter(
    c => !c.scoringStrategies
        || c.scoringStrategies.includes(factor.scoring_strategy),
  ),
}
const { Option } = Select
const PREDICATES = ['==', '!=', '>', '>=', '<', '<=']

const getColumns = (onChange, onRemove, errors) => [
  {
    dataIndex: 'icon',
    scoringStrategies: ['sub_factors_conditional_average'],
    render: (text, record, index) => (
      <i key={index} className="fa fa-bars" />
    ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text, record) => {
      const error = errors.find(([id]) => id === record.sub_factor_id)
      return (
        <>
          <div>{record.name}</div>
          {error && (
            <div className="has-error">
              <span className="ant-form-explain">{error[1]}</span>
            </div>
          )}
        </>
      )
    },
  },
  {
    title: 'Predicate',
    dataIndex: 'predicate',
    scoringStrategies: ['sub_factors_conditional_average'],
    render: (text, record) => (
      <Select
        defaultValue="equal_to"
        value={record.predicate}
        size="small"
        onChange={predicate => onChange({ ...record, predicate })}
      >
        {PREDICATES.map(predicate => (
          <Option key={predicate} value={predicate}>
            {predicate}
          </Option>
        ))}
      </Select>
    ),
  },
  {
    title: 'Weight',
    dataIndex: 'weight',
    scoringStrategies: ['sub_factors_conditional_average', 'sub_factors_average'],
    render: (text, record) => (
      <InputNumber
        value={record.weight}
        size="small"
        min={0}
        max={10}
        step={0.1}
        onChange={weight => onChange({ ...record, weight })}
      />
    ),
  },
  {
    title: 'Value',
    dataIndex: 'value',
    scoringStrategies: ['sub_factors_conditional_average'],
    render: (text, record) => (
      <InputNumber
        value={record.value}
        size="small"
        min={0}
        step={0.1}
        onChange={value => onChange({ ...record, value })}
      />
    ),
  },
  {
    title: 'Actions',
    dataIndex: 'operation',
    render: (text, record) => (
      <Button
        type="link"
        icon="delete"
        size="small"
        onClick={() => onRemove(record)}
      />
    ),
  },
]
