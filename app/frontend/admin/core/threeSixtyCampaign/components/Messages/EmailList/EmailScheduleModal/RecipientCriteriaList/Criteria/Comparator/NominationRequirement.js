import React, { useEffect } from 'react'
import { Select } from 'antd'

export default function NominationRequirement ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: 'not_completed' })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key="not_completed" value="not_completed">
          Has not completed nomination requirement
        </Select.Option>
        <Select.Option key="completed" value="completed">
          Has completed nomination requirement
        </Select.Option>
      </Select>
    </div>
  )
}
