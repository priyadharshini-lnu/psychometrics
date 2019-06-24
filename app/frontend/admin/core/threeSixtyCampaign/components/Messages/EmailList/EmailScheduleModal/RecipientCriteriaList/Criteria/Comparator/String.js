import React from 'react'
import { Select, Input } from 'antd'
import style from '../style.scss'

export default function StringComparator ({ comparator, value, update }) {
  return (
    <div>
      <Select size="small" value={comparator} onChange={value => update('comparator', value)}>
        <Select.Option key="starts_with">Starts With</Select.Option>
        <Select.Option key="equal">Is</Select.Option>
      </Select>
      <Input className={style.smallInput} size="small" value={value} onChange={e => update('value', e.target.value)} />
    </div>
  )
}
