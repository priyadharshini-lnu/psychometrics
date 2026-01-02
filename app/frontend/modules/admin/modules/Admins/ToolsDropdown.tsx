import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

const getMenuProps = ({
  onExportAdminsWithPermissions,
  permissions,
}): MenuProps => {
  const menuItems: MenuItem[] = []
  const exportMenuItems = [
    {
      key: 'export_admins_with_permission',
      label: I18n.t('admin.export_admin_roles_permissions'),
    },
  ]
  permissions?.export && menuItems.push({
    type: 'group',
    key: 'export_group',
    label: I18n.t('shared.export'),
    children: exportMenuItems,
  })


  const handleMenuClick = ({ key }) => {
    if (key === 'export_admins_with_permission') {
      return onExportAdminsWithPermissions()
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

interface Props {
  permissions: {
    export?: boolean,
  },
  onExportAdminsWithPermissions?: () => void
}

const ToolsDropdown: React.FC<Props> = ({ permissions, onExportAdminsWithPermissions }) => (
  <ConditionalDropdown
    menu={getMenuProps({
      permissions,
      onExportAdminsWithPermissions,
    })}
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

export default ToolsDropdown
