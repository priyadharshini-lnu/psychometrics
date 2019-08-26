import React, { useEffect } from 'react'
import { Select } from 'antd'
import { MANAGER_TASK_VALUES } from 'constants/emailCriteria'

export default function ManagerTask ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: MANAGER_TASK_VALUES.NOT_APPROVED_ALL_NOMINATIONS })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option
          key={MANAGER_TASK_VALUES.NOT_APPROVED_ALL_NOMINATIONS}
          value={MANAGER_TASK_VALUES.NOT_APPROVED_ALL_NOMINATIONS}
        >
          Has not approved all nominations
        </Select.Option>
        <Select.Option
          key={MANAGER_TASK_VALUES.NOT_APPROVED_ALL_REPORTS}
          value={MANAGER_TASK_VALUES.NOT_APPROVED_ALL_REPORTS}
        >
          Has not approved all report
        </Select.Option>
      </Select>
    </div>
  )
}
