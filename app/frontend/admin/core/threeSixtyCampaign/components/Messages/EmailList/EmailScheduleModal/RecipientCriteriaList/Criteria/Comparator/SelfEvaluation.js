import React, { useEffect } from 'react'
import { Select } from 'antd'
import { SELF_EVALUATIONS_VALUES } from 'constants/emailCriteria'

export default function SelfEvaluation ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: SELF_EVALUATIONS_VALUES.NOT_COMPLETED })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key={SELF_EVALUATIONS_VALUES.NOT_COMPLETED} value={SELF_EVALUATIONS_VALUES.NOT_COMPLETED}>
          Has not completed self evaluation
        </Select.Option>
        <Select.Option key={SELF_EVALUATIONS_VALUES.COMPLETED} value={SELF_EVALUATIONS_VALUES.COMPLETED}>
          Has completed self evaluation
        </Select.Option>
      </Select>
    </div>
  )
}
