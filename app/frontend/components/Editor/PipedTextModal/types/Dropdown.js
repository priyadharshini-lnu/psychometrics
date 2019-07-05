import React from 'react'
import { Menu, Dropdown as AntDropdown, Icon } from 'antd'

const menu = (field, context, insert) => (
  <Menu>
    {field.items(context).map(f => (
      <Menu.Item key={f.key} onClick={() => insert(field.getValue(f))}>
        {f.value}
      </Menu.Item>
    ))}
  </Menu>
)

const Dropdown = ({ field, context, insert }) => (
  <AntDropdown overlay={menu(field, context, insert)}>
    <a className="ant-dropdown-link" href="#">
      {field.name}
      {' '}
      <Icon type="caret-down" theme="filled" />
    </a>
  </AntDropdown>
)

export default Dropdown
