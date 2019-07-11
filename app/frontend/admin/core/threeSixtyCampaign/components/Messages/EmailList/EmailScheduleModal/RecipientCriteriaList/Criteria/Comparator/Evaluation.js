import React, { useEffect } from 'react'
import { Select } from 'antd'

export default function Evaluation ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: 'not_completed' })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key="not_completed" value="not_completed">
          Has not completed evaluations
        </Select.Option>
        <Select.Option key="completed" value="completed">
          Has completed evaluations
        </Select.Option>
        <Select.Option key="completed_need_approval" value="completed_need_approval">
          Has evaluations that need approval
        </Select.Option>
      </Select>
    </div>
  )
}
