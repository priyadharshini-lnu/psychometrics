import React from 'react'
import {
  Button, Menu,
} from 'antd'
import User from 'modules/admin/modules/campaigns/interfaces/User'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'

const { I18n } = window

const menu = ({
  campaignId,
  openModal,
  permissions,
}) => (
  <Menu>
    {permissions.exportUsers && (
      <Menu.Item key="export">
        <a href={`/administration/new_campaigns/${campaignId}/users.csv`}>{I18n.t('user.toolbar.export')}</a>
      </Menu.Item>
    )}
    {permissions.exportCompletionStatus && (
      <Menu.Item key="export_completion">
        <a href={`/administration/new_campaigns/${campaignId}/users/export_completion_status.csv`}>
          {I18n.t('user.toolbar.export_completion_status')}
        </a>
      </Menu.Item>
    )}
    {permissions.import && (
      <Menu.Item key="import">
        <a onClick={() => openModal('ImportUsersModal', { campaignId })}>{I18n.t('user.toolbar.import')}</a>
      </Menu.Item>
    )}
  </Menu>
)

interface Props {
  campaignId: number
  openModal(name: string, data?: { campaignId: string, user?: User }): void
  permissions: {
    exportUsers: boolean,
    exportCompletionStatus: boolean,
    import: boolean,
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
        <span>Tools</span>
        <DownOutlined />
      </Button>
    )}
    className="mrm"
    hideForEmptyMenu
  />
)

export default ToolsDropdown
