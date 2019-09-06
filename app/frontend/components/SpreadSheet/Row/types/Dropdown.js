import React from 'react'
import { Menu, Dropdown as AntDropdown, Icon } from 'antd'

const menu = ({ values, onChange }) => (
  <Menu onClick={({ key }) => onChange({ value: key })}>
    {values.map(({ value }) => (
      <Menu.Item key={value}>{value}</Menu.Item>
    ))}
  </Menu>
)

export default function Dropdown ({
  field, entity, index, updateEntity, context,
}) {
  const onChange = ({ value }) => {
    updateEntity([index, field.key], value)
  }
  return (
    <AntDropdown overlay={menu({ values: field.values(context), onChange })} trigger={['click']}>
      <span className="mls">
        {entity[field.key] || 'Choose'}
        {' '}
        <Icon type="down" />
      </span>
    </AntDropdown>
  )
}
