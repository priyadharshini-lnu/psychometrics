import React, { useEffect } from 'react'
import { Select } from 'antd'
import { EVALUATOR_TYPE_VALUES } from 'constants/emailCriteria'

export default function EvaluatorType ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: EVALUATOR_TYPE_VALUES.EXTERNAL })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option key={EVALUATOR_TYPE_VALUES.EXTERNAL} value={EVALUATOR_TYPE_VALUES.EXTERNAL}>
          External Only
        </Select.Option>
        <Select.Option key={EVALUATOR_TYPE_VALUES.NOT_EXTERNAL} value={EVALUATOR_TYPE_VALUES.NOT_EXTERNAL}>
          Not External
        </Select.Option>
      </Select>
    </div>
  )
}
