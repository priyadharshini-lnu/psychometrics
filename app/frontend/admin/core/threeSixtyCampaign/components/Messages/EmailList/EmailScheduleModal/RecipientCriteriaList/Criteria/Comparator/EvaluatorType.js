import React, { useEffect } from 'react'
import { Select } from 'antd'

export default function EvaluatorType ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: 'external' })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key="external" value="external">
          External Only
        </Select.Option>
        <Select.Option key="not_external" value="not_external">
          Not External
        </Select.Option>
      </Select>
    </div>
  )
}
