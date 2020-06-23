import React from 'react'
import { Select, Input } from 'antd'
import { NUMBER_COMPARATOR } from 'constants/emailCriteria'
import styles from '../styles.scss'

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
        <Select.Option key={NUMBER_COMPARATOR.EQUAL}>Is Equal to</Select.Option>
        <Select.Option key={NUMBER_COMPARATOR.NOT_EQUAL}>Is Not Equal to</Select.Option>
        <Select.Option key={NUMBER_COMPARATOR.GREATER_THAN}>Is Greater than</Select.Option>
        <Select.Option key={NUMBER_COMPARATOR.LESS_THAN}>Is Less than</Select.Option>
      </Select>
      <Input className={styles.smallInput} size="small" value={value} onChange={e => update('value', e.target.value)} />
    </div>
  )
}
