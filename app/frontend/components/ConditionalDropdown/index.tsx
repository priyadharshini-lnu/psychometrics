import React, { ReactElement } from 'react'
import {
  Button, Dropdown, MenuProps, DropdownProps,
} from 'antd'
import compact from 'lodash/compact'
import castArray from 'lodash/castArray'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

interface Props extends Pick<DropdownProps, 'placement'> {
  menu: MenuProps | null
  innerElement?: ReactElement
  className?: string
  hideForEmptyMenu?: boolean
  autoAdjustOverflow?: boolean
}

const ConditionalDropdown: React.FC<Props> = ({
  menu, innerElement, className, hideForEmptyMenu, placement, autoAdjustOverflow,
}) => {
  const defaultInnerElement = <Button type="link" icon={<MoreOutlined />} />

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
    const menuItems = compact(castArray(menu.items))
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

    return newChildren
  }

  const filteredMenuItems = removeInvalidElements(menu)
  const hasChildrens = (filteredMenuItems?.length > 0)
  const dropdownMenu = {
    ...menu,
    items: filteredMenuItems,
    style: {
      ...(menu?.style || {}),
    },
  }

  if (!hasChildrens && hideForEmptyMenu) { return null }

  return (
    <Dropdown
      menu={dropdownMenu}
      trigger={['click']}
      disabled={!hasChildrens}
      className={className || ''}
      placement={placement}
      autoAdjustOverflow={autoAdjustOverflow}
    >
      {innerElement || defaultInnerElement}
    </Dropdown>
  )
}

export default ConditionalDropdown
