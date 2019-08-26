import React, { useEffect } from 'react'
import { Select } from 'antd'
import { EVALUATIONS_VALUES } from 'constants/emailCriteria'

export default function Evaluation ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: EVALUATIONS_VALUES.NOT_COMPLETED })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key={EVALUATIONS_VALUES.NOT_COMPLETED} value={EVALUATIONS_VALUES.NOT_COMPLETED}>
          Has not completed evaluations
        </Select.Option>
        <Select.Option key={EVALUATIONS_VALUES.COMPLETED} value={EVALUATIONS_VALUES.COMPLETED}>
          Has completed evaluations
        </Select.Option>
        <Select.Option key={EVALUATIONS_VALUES.NEEDS_APPROVAL} value={EVALUATIONS_VALUES.NEEDS_APPROVAL}>
          Has evaluations that need approval
        </Select.Option>
      </Select>
    </div>
  )
}
