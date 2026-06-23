import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import User from '~/modules/admin/modules/campaigns/interfaces/User'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

const getMenuProps = ({
  campaignId,
  openModal,
  permissions,
}): MenuProps => {
  const menuItems: MenuItem[] = []
  permissions.import && menuItems.push({
    key: 'import',
    label: I18n.t('admin.assessor_toolbar_import'),
  })
  permissions.export && menuItems.push({
    key: 'export',
    label: (
      <a href={`/administration/new_campaigns/${campaignId}/assessors.csv`}>
        {I18n.t('admin.assessor_toolbar_export')}
      </a>
    ),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'import') {
      openModal('ImportAssessorsModal', { campaignId })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

interface Props {
  campaignId: number
  openModal(name: string, data?: { campaignId: string, user?: User }): void
  permissions: {
    import: boolean
    export: boolean
    add: boolean
  }
}

const ToolsDropdown: React.FC<Props> = ({ campaignId, openModal, permissions }) => (
  <ConditionalDropdown
    menu={getMenuProps({
      campaignId,
      openModal,
      permissions,
    })}
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>{I18n.t('shared.tools')}</span>
        <DownOutlined />
      </Button>
    )}
    hideForEmptyMenu
    className="mrm"
  />
)

export default ToolsDropdown
