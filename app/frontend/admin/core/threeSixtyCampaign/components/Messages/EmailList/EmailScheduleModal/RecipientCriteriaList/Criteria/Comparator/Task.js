import React, { useEffect } from 'react'
import { Select } from 'antd'

export default function Task ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: 'not_completed' })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key="not_completed" value="not_completed">
          Has not completed all tasks
        </Select.Option>
        <Select.Option key="completed" value="completed">
          Has completed all tasks
        </Select.Option>
        <Select.Option key="viewed_report" value="completed_need_approval">
          Has not viewed own report
        </Select.Option>
        <Select.Option key="not_viewed_report" value="completed_need_approval">
          Has viewed own report
        </Select.Option>
      </Select>
    </div>
  )
}
