import React from 'react'
import cs from 'classnames'
import { Select } from 'antd'
import styles from './styles.scss'

export default function Operator ({
  operator, update, moveConditionToNextLogicSet,
}) {
  const handleOperatorChange = (value) => {
    if (value === 'move_to_new_logical_set') {
      moveConditionToNextLogicSet()
    } else {
      update(value)
    }
  }

  if (operator === 'if') return null
  return (
    <Select
      value={operator}
      size="small"
      dropdownMatchSelectWidth={false}
      className={cs([styles.inputElement, styles.width80])}
      onChange={handleOperatorChange}
    >
      <Select.Option key="and">And</Select.Option>
      <Select.Option key="or">Or</Select.Option>
      <Select.Option key="move_to_new_logical_set">Move to new logic set</Select.Option>
    </Select>
  )
}
