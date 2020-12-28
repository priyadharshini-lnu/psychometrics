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
    <Menu.Item key="import">
      <a onClick={() => openModal('ImportAssessorsModal', { campaignId })}>
        {I18n.t('administration.assessor.toolbar.import')}
      </a>
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
      <span>{I18n.t('administration.assessor.toolbar.tools')}</span>
      <DownOutlined />
    </Button>
  </Dropdown>
)

export default ToolsDropdown
