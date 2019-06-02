import React from 'react'
import { Input, Select, Icon } from 'antd'
import cs from 'classnames'
import css from '../style.scss'
import NestedOperator from 'admin/core/threeSixtyCampaign/components/common/NestedOperator'

export default function Condition ({
  datasheetFields,
  condition: {
    operator, field, value, comparator,
  },
  add,
  update,
  remove,
  moveConditionToNextLogicSet,
}) {
  return (
    <div style={{ display: 'inline-block' }} className="mbs">
      <NestedOperator
        operator={operator}
        update={value => update('operator', value)}
        remove={remove}
        moveConditionToNextLogicSet={moveConditionToNextLogicSet}
      />
      <Select
        value={field}
        size="small"
        className={css.inputElement}
        dropdownMatchSelectWidth={false}
        onChange={value => update('field', value)}
      >
        {datasheetFields.map(name => (
          <Select.Option key={name}>{name}</Select.Option>
        ))}
      </Select>
      <Select
        value={comparator}
        size="small"
        dropdownMatchSelectWidth={false}
        className={cs([css.inputElement, css.width80])}
        onChange={value => update('comparator', value)}
      >
        <Select.Option key="equal">Is</Select.Option>
        <Select.Option key="not_equal">Is Not</Select.Option>
      </Select>
      <Input
        value={value}
        size="small"
        className={cs([css.inputElement, css.width80])}
        onChange={(e) => {
          update('value', e.target.value)
        }}
      />

      <span>
        <Icon type="minus-circle" className={css.deleteIcon} onClick={remove} />
        <Icon type="plus-circle" className={css.addIcon} onClick={add} />
      </span>
    </div>
  )
}
