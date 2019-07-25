import React from 'react'
import { Select, Input } from 'antd'
import { STRING_COMPARATOR } from 'constants/emailCriteria'
import style from '../style.scss'

export default function String ({ comparator, value, update }) {
  return (
    <div>
      <Select
        dropdownMatchSelectWidth={false}
        size="small"
        value={comparator}
        onChange={value => update('comparator', value)}
      >
        <Select.Option key={STRING_COMPARATOR.STARTS_WITH}>Starts With</Select.Option>
        <Select.Option key={STRING_COMPARATOR.EQUAL}>Is</Select.Option>
      </Select>
      <Input className={style.smallInput} size="small" value={value} onChange={e => update('value', e.target.value)} />
    </div>
  )
}
