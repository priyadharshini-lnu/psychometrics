import React from 'react'
import { Input, Select } from 'antd'
import css from '../Options.scss'

export default function Criteria ({ fields, condition: { field, operator, value }, updateCriteria }) {
  const valueAttr = field ? { value: field } : {}

  function fieldSelectList () {
    return (
      <Select
        {...valueAttr}
        size="small"
        className={css.criteriaSelectList}
        placeholder="Select a datasheet field"
        onChange={(value) => {
          updateCriteria('field', value)
        }}
      >
        {fields.map(name => (
          <Select.Option key={name}>{name}</Select.Option>
        ))}
      </Select>
    )
  }

  return (
    <span>
      {fieldSelectList()}
      <Select
        value={operator}
        size="small"
        className={css.operatorSelectList}
        onChange={(value) => {
          updateCriteria('operator', value)
        }}
      >
        <Select.Option key="is_same_as_subject">Is Same as Subject</Select.Option>
        <Select.Option key="equal">Is</Select.Option>
      </Select>
      {operator === 'equal' ? (
        <Input
          value={value}
          className={css.criteriaValue}
          size="small"
          onChange={(e) => {
            updateCriteria('value', e.target.value)
          }}
        />
      ) : null}
    </span>
  )
}
