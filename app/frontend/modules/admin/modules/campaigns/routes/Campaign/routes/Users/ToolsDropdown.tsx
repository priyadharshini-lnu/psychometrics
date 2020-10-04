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
}) => (
  <Menu>
    <Menu.Item key="export">
      <a href={`/administration/new_campaigns/${campaignId}/users.csv`}>{I18n.t('user.toolbar.export')}</a>
    </Menu.Item>
    <Menu.Item key="export_completion">
      <a href={`/administration/new_campaigns/${campaignId}/users/export_completion_status.csv`}>
        {I18n.t('user.toolbar.export_completion_status')}
      </a>
    </Menu.Item>
    <Menu.Item key="import">
      <a onClick={() => openModal('ImportUsersModal', { campaignId })}>{I18n.t('user.toolbar.import')}</a>
    </Menu.Item>
  </Menu>
)

interface Props {
  campaignId: number
  openModal(name: string, data?: { campaignId: string, user?: User }): void
}

const ToolsDropdown: React.FC<Props> = ({ campaignId, openModal }) => (
  <Dropdown
    overlay={menu({
      campaignId,
      openModal,
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
