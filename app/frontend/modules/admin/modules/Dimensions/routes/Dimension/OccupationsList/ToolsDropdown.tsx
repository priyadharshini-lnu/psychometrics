import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { Link } from 'react-router-dom'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

const getMenuProps = (): MenuProps => {
  const menuItems: MenuItem[] = []
  menuItems.push({
    key: 'manage_condition_sets',
    label: <Link to="condition_sets">{I18n.t('admin.manage_condition_sets')}</Link>,
  })

  return ({ items: menuItems })
}

interface Props {
  onManageConditionSets?: () => void
}

export const ToolsDropdown: React.FC<Props> = () => (
  <ConditionalDropdown
    menu={getMenuProps()}
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>{I18n.t('shared.tools')}</span>
        <DownOutlined />
      </Button>
    )}
    className="mrm"
    hideForEmptyMenu
  />
)
