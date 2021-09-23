import React, { ReactElement } from 'react'
import {
  Menu, Dropdown,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import compact from 'lodash/compact'
import castArray from 'lodash/castArray'

interface Props {
  menu: ReactElement | null
  innerElement?: ReactElement
  className?: string
  hideForEmptyMenu?: boolean
}

const ConditionalDropdown: React.FC<Props> = ({
  menu, innerElement, className, hideForEmptyMenu,
}) => {
  const defaultInnerElement = (
    <a>
      <MoreOutlined />
    </a>
  )

  const removeInvalidDividers = (newChildren) => {
    if (newChildren.every(child => child.type.name === 'Divider')) { return [] }

    const menuWithValidDividers = newChildren.map((child, index, array) => {
      const previousElement = (index > 0) ? (array[index - 1]) : null
      if (child.type.name === 'Divider' && previousElement?.type?.name === 'Divider') { return null }
      return child
    })

    return compact(menuWithValidDividers)
  }

  const removeInvalidElements = (menu) => {
    const childrens = compact(castArray(menu.props.children))
    let newChildren = childrens.map((child) => {
      const childType = child?.type?.name
      const childIsAGroup = ['MenuItemGroup', 'SubMenu'].includes(childType)
      const hasValidGradchildren = compact(castArray(child.props.children)).some(child => React.isValidElement(child))

      if (childIsAGroup && hasValidGradchildren) { return child }
      if (!childIsAGroup && React.isValidElement(child)) { return child }
    })

    newChildren = compact(newChildren)
    newChildren = removeInvalidDividers(newChildren)

    return (
      <Menu {...menu.props}>
        {newChildren}
      </Menu>
    )
  }

  const filteredMenu = removeInvalidElements(menu)
  const hasChildrens = (filteredMenu.props.children.length > 0)

  if (!hasChildrens && hideForEmptyMenu) { return null }

  return (
    <Dropdown
      overlay={() => (filteredMenu)}
      trigger={['click']}
      disabled={!hasChildrens}
      className={className || ''}
    >
      {innerElement || defaultInnerElement}
    </Dropdown>
  )
}

export default ConditionalDropdown
