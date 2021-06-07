import React, { ReactElement } from 'react'
import {
  Menu, Dropdown,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import _ from 'lodash'

interface DefaultProps {
  menu: ReactElement
  innerElement?: ReactElement
  className?: string
  hideForEmptyMenu?: boolean
}

export default function ConditionalDropdown (props: DefaultProps) {
  const {
    menu, innerElement, className, hideForEmptyMenu,
  } = props

  const filteredMenu = removeInvalidelements(menu)
  const hasChildrens = (filteredMenu.props.children.length > 0)

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

    newChildren = removeInvalidDividers(newChildren)

    return (
      <Menu {...menu.props}>
        {newChildren}
      </Menu>
    )
  }

  function removeInvalidDividers (newChildren) {
    let menuWithValidDividers
    if (newChildren.every(child => child.type.name === 'Divider')) {
      menuWithValidDividers = []
    } else {
      menuWithValidDividers = newChildren.map((child, index, array) => {
        const previousElement = array[index - 1]
        if (!(child.type.name === 'Divider' && previousElement?.type?.name === 'Divider')) {
          return child
        }
      })
    }
    return menuWithValidDividers
  }

  function toArray (children) {
    if (children === undefined || children === false) return []

    return Array.isArray(children) ? children : [children]
  }

  return (
    (!hasChildrens && hideForEmptyMenu) ? null : (
      <Dropdown
        overlay={() => (filteredMenu)}
        trigger={['click']}
        disabled={!hasChildrens}
        className={className || ''}
      >
        {innerElement || defaultInnerElement}
      </Dropdown>
    )
  )
}
