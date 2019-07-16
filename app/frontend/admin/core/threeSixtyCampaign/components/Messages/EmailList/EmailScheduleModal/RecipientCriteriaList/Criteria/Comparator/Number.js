import React from 'react'
import { Select, Input } from 'antd'
import style from '../style.scss'

export default function Number ({
  comparator, value, update,
}) {
  return (
    <div>
      <Select
        dropdownMatchSelectWidth={false}
        size="small"
        value={comparator}
        onChange={value => update('comparator', value)}
      >
        <Select.Option key="equal">Is Equal to</Select.Option>
        <Select.Option key="not_equal">Is Not Equal to</Select.Option>
        <Select.Option key="greater_than">Is Greater than</Select.Option>
        <Select.Option key="less_than">Is Less than</Select.Option>
      </Select>
      <Input className={style.smallInput} size="small" value={value} onChange={e => update('value', e.target.value)} />
    </div>
  )
}
