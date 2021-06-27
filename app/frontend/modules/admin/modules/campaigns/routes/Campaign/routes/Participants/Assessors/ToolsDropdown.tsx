import React from 'react'
import {
  Button, Menu,
} from 'antd'
import User from 'modules/admin/modules/campaigns/interfaces/User'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'

const { I18n } = window

const menu = ({
  campaignId,
  openModal,
  permissions,
}) => (
  <Menu>
    {permissions.import && (
      <Menu.Item key="import">
        <a onClick={() => openModal('ImportAssessorsModal', { campaignId })}>
          {I18n.t('administration.assessor.toolbar.import')}
        </a>
      </Menu.Item>
    )}
    {permissions.export && (
      <Menu.Item key="export">
        <a href={`/administration/new_campaigns/${campaignId}/assessors.csv`}>
          {I18n.t('administration.assessor.toolbar.export')}
        </a>
      </Menu.Item>
    )}
  </Menu>
)

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
    menu={menu({
      campaignId,
      openModal,
      permissions,
    })}
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>{I18n.t('administration.assessor.toolbar.tools')}</span>
        <DownOutlined />
      </Button>
    )}
    hideForEmptyMenu
    className="mrm"
  />
)

export default ToolsDropdown
