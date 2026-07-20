import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { Link } from 'react-router-dom'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { isSuperAdmin } from '~/core/currentUser'
import { useCurrentUser } from '~/hooks/useCurrentUser'

const { I18n } = window

const getMenuProps = (currentUser): MenuProps => {
  const menuItems: MenuItem[] = []
  if (isSuperAdmin(currentUser)) {
    menuItems.push({
      key: 'manage_condition_sets',
      label: <Link to="condition_sets">{I18n.t('admin.manage_condition_sets')}</Link>,
    })
  }

  return ({ items: menuItems })
}

interface Props {
  onManageConditionSets?: () => void
}

export const ToolsDropdown: React.FC<Props> = () => {
  const { currentUser } = useCurrentUser()
  return (
    <ConditionalDropdown
      menu={getMenuProps(currentUser)}
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
}
