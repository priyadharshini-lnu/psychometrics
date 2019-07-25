import React, { useEffect } from 'react'
import { Select } from 'antd'
import { TASKS_VALUES } from 'constants/emailCriteria'

export default function Task ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: TASKS_VALUES.NOT_COMPLETED })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key={TASKS_VALUES.NOT_COMPLETED} value={TASKS_VALUES.NOT_COMPLETED}>
          Has not completed all tasks
        </Select.Option>
        <Select.Option key={TASKS_VALUES.COMPLETED} value={TASKS_VALUES.COMPLETED}>
          Has completed all tasks
        </Select.Option>
        <Select.Option key={TASKS_VALUES.NOT_VIEWED_REPORT} value={TASKS_VALUES.NOT_VIEWED_REPORT}>
          Has not viewed own report
        </Select.Option>
        <Select.Option key={TASKS_VALUES.VIEWED_REPORT} value={TASKS_VALUES.VIEWED_REPORT}>
          Has viewed own report
        </Select.Option>
      </Select>
    </div>
  )
}
