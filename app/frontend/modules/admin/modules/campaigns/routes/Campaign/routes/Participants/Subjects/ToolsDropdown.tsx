import React from 'react'
import {
  Button, Dropdown, Menu,
} from 'antd'
import User from 'modules/admin/modules/campaigns/interfaces/User'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'

const { I18n } = window

const menu = ({
  campaignId,
  openModal,
  permissions,
}) => (
  <Menu>
    <Menu.Item
      key="export"
      disabled={!permissions.exportUsers}
    >
      <a href={`/administration/new_campaigns/${campaignId}/users.csv`}>{I18n.t('user.toolbar.export')}</a>
    </Menu.Item>
    <Menu.Item
      key="export_completion"
      disabled={!permissions.exportCompletionStatus}
    >
      <a href={`/administration/new_campaigns/${campaignId}/users/export_completion_status.csv`}>
        {I18n.t('user.toolbar.export_completion_status')}
      </a>
    </Menu.Item>
    <Menu.Item
      key="import"
      disabled={!permissions.import}
    >
      <a onClick={() => openModal('ImportUsersModal', { campaignId })}>{I18n.t('user.toolbar.import')}</a>
    </Menu.Item>
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
  <Dropdown
    overlay={menu({
      campaignId,
      openModal,
      permissions,
    })}
    className="mrm"
    trigger={['click']}
  >
    <Button>
      <ToolOutlined />
      <span>Tools</span>
      <DownOutlined />
    </Button>
  </Dropdown>
)

export default ToolsDropdown
