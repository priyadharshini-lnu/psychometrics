import React from 'react'
import { Input, Select, Icon } from 'antd'
import styles from './styles.scss'


export default function Criteria ({
  datasheetFields, condition: { field, comparator, value }, updateCriteria, addCriteria, removeCriteria,
}) {
  const valueAttr = field ? { value: field } : {}

  function fieldSelectList () {
    return (
      <Select
        {...valueAttr}
        size="small"
        className={styles.criteriaSelectList}
        placeholder="Select a datasheet field"
        onChange={(value) => {
          updateCriteria('field', value)
        }}
      >
        {datasheetFields.map(name => (
          <Select.Option key={name}>{name}</Select.Option>
        ))}
      </Select>
    )
  }

  return (
    <span>
      {fieldSelectList()}
      <Select
        value={comparator}
        size="small"
        className={styles.operatorSelectList}
        onChange={(value) => {
          updateCriteria('comparator', value)
        }}
      >
        <Select.Option key="is_same_as_subject">Is Same as Subject</Select.Option>
        <Select.Option key="equal">Is</Select.Option>
      </Select>
      {comparator === 'equal' && (
        <Input
          value={value}
          className={styles.value}
          size="small"
          onChange={(e) => {
            updateCriteria('value', e.target.value)
          }}
        />
      )}
      <span>
        <Icon type="minus-circle" onClick={removeCriteria} className={styles.deleteIcon} />
        <Icon type="plus-circle" onClick={addCriteria} className={styles.addIcon} />
      </span>
    </span>
  )
}
