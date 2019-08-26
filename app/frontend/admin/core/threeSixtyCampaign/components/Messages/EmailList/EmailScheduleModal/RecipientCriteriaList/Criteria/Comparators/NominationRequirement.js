import React, { useEffect } from 'react'
import { Select } from 'antd'
import { NOMINATION_REQUIREMENTS_VALUES } from 'constants/emailCriteria'

export default function NominationRequirement ({ value, update, merge }) {
  useEffect(() => {
    merge({ value: NOMINATION_REQUIREMENTS_VALUES.NOT_COMPLETED })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        <Select.Option
          key={NOMINATION_REQUIREMENTS_VALUES.NOT_COMPLETED}
          value={NOMINATION_REQUIREMENTS_VALUES.NOT_COMPLETED}
        >
          Has not completed nomination requirement
        </Select.Option>
        <Select.Option
          key={NOMINATION_REQUIREMENTS_VALUES.COMPLETED}
          value={NOMINATION_REQUIREMENTS_VALUES.COMPLETED}
        >
          Has completed nomination requirement
        </Select.Option>
      </Select>
    </div>
  )
}
