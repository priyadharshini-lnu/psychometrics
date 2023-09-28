import React, { ReactElement } from 'react'
import {
  Menu, Dropdown,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import compact from 'lodash/compact'
import castArray from 'lodash/castArray'

interface Props {
  menu: ReactElement | null | React.FC
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

  const removeInvalidDividers = (menuItems) => {
    if (menuItems.every(menuItem => menuItem.type === 'divider')) { return [] }

    const menuWithValidDividers = menuItems.map((menuItem, index, array) => {
      const previousElement = (index > 0) ? (array[index - 1]) : null
      if (menuItem.type === 'divider' && previousElement?.type === 'divider') { return null }
      return menuItem
    })

    return compact(menuWithValidDividers)
  }

  const removeInvalidElements = (menu) => {
    const menuItems = compact(castArray(menu.props.items))
    let newChildren = menuItems.map((menuItem) => {
      const itemType = menuItem?.type
      if (itemType === 'divider') {
        return menuItem
      }
      const childIsAGroup = itemType === 'group' || Array.isArray(menuItem?.children)
      const hasValidGradchildren = compact(castArray(menuItem.children)).some(
        child => React.isValidElement(child.label) || typeof child.label === 'string',
      )
      if (childIsAGroup && hasValidGradchildren) { return menuItem }
      if (!childIsAGroup && (React.isValidElement(menuItem.label) || typeof menuItem.label === 'string')) {
        return menuItem
      }
    })

    newChildren = compact(newChildren)
    newChildren = removeInvalidDividers(newChildren)

    return (
      <Menu {...menu.props} items={newChildren} />
    )
  }

  const filteredMenu = removeInvalidElements(menu)
  const hasChildrens = (filteredMenu.props.items?.length > 0)

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
