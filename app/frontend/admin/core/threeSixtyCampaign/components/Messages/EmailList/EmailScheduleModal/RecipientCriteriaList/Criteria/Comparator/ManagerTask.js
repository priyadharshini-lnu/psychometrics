import React, { useEffect } from 'react'
import { Select } from 'antd'

export default function ManagerTask ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: 'not_approved_all_nominations' })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key="not_approved_all_nominations" value="not_completed">
          Has not approved all nominations
        </Select.Option>
        <Select.Option key="not_approved_all_reports" value="completed">
          Has not approved all report
        </Select.Option>
      </Select>
    </div>
  )
}
