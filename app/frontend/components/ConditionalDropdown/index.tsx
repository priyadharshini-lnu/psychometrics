import React, { ReactElement } from 'react'
import {
  Menu, Dropdown,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import _ from 'lodash'

interface DefaultProps {
  menu: ReactElement
  innerElement?: ReactElement,
}

export default function ConditionalDropdown (props: DefaultProps) {
  const {
    menu, innerElement,
  } = props

  const filteredMenu = removeInvalidelements(menu)
  const disabledDropdown = !filteredMenu.props.children.length

  const defaultInnerElement = (
    <a>
      <MoreOutlined />
    </a>
  )

  function removeInvalidelements (menu) {
    const childrens = toArray(menu.props.children)
    let newChildren = _.compact(childrens.map((child) => {
      const type = child && child.type.name
      if (type === 'MenuItemGroup' || type === 'SubMenu') {
        if (child.props.children.length && child.props.children.some(child => React.isValidElement(child))) {
          return child
        }
      } else if (React.isValidElement(child)) {
        return child
      }
    }))

    if (newChildren.every(child => child.type.name === 'Divider')) {
      newChildren = []
    }

    return (
      <Menu>
        {newChildren}
      </Menu>
    )
  }

  function toArray (children) {
    if (children === undefined || children === false) return []

    return Array.isArray(children) ? children : [children]
  }

  return (
    <Dropdown
      overlay={() => (filteredMenu)}
      trigger={['click']}
      disabled={disabledDropdown}
    >
      {innerElement || defaultInnerElement}
    </Dropdown>
  )
}
