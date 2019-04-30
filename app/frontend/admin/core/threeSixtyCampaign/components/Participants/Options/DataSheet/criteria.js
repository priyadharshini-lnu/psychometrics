import React from 'react'
import { Input, Select } from 'antd'

export default function Criteria ({ fields, condition: { field, operator, value }, updateCriteria }) {
  const valueAttr = field ? { value: field } : {}

  function fieldSelectList () {
    return (
      <Select
        {...valueAttr}
        size="small"
        style={{ width: '160px' }}
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
        style={{ margin: '0px 10px', width: '160px' }}
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
          style={{ marginRight: '10px', width: '160px' }}
          size="small"
          onChange={(e) => {
            updateCriteria('value', e.target.value)
          }}
        />
      ) : null}
    </span>
  )
}
