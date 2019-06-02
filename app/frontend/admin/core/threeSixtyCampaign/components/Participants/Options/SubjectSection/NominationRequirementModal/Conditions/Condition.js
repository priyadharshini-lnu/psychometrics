import React from 'react'
import { Icon, Select, Input } from 'antd'
import cs from 'classnames'
import css from '../style.scss'

export default function Condition ({
  relationships,
  condition: { comparator, relationshipId, value },
  canRemove,
  add,
  remove,
  update,
}) {
  const handleRemove = () => canRemove && remove()

  return (
    <div className="mbs">
      <Select
        value={comparator}
        size="small"
        className={css.inputElement}
        dropdownMatchSelectWidth={false}
        onChange={value => update('comparator', value)}
      >
        <Select.Option key="atleast">Atleast</Select.Option>
        <Select.Option key="exactly">Exactly</Select.Option>
        <Select.Option key="atmost">At Most</Select.Option>
      </Select>

      <Input
        value={value}
        size="small"
        className={cs([css.inputElement, css.width80])}
        onChange={(e) => {
          update('value', e.target.value)
        }}
      />

      <Select
        value={relationshipId}
        size="small"
        dropdownMatchSelectWidth={false}
        className={cs([css.inputElement])}
        onChange={value => update('relationshipId', value)}
      >
        {relationships.map(r => (<Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>))}
      </Select>

      <span>
        <Icon
          type="minus-circle"
          onClick={handleRemove}
          className={cs(css.deleteIcon, { [css.disabledIcon]: !canRemove })}
        />
        <Icon type="plus-circle" className={css.addIcon} onClick={add} />
      </span>
    </div>
  )
}
