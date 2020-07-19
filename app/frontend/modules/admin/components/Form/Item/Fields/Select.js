import React from 'react'
import { Select as AntSelect } from 'antd'

export default function Select ({
  field: {
    value, name, getOptions,
  }, context, onChange,
}) {
  return (
    <AntSelect
      defaultValue={getOptions(context).key}
      name={name}
      value={value}
      onChange={val => onChange({ currentTarget: { value: val, name } })}
    >
      {getOptions(context).map(({ key, value }) => (
        <AntSelect.Option key={key} value={key}>
          {value}
        </AntSelect.Option>
      ))}
    </AntSelect>
  )
}
