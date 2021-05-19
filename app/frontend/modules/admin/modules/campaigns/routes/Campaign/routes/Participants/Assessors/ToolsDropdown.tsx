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
      key="import"
      disabled={!permissions.import}
    >
      <a onClick={() => openModal('ImportAssessorsModal', { campaignId })}>
        {I18n.t('administration.assessor.toolbar.import')}
      </a>
    </Menu.Item>
    <Menu.Item
      key="export"
      disabled={!permissions.export}
    >
      <a href={`/administration/new_campaigns/${campaignId}/assessors.csv`}>
        {I18n.t('administration.assessor.toolbar.export')}
      </a>
    </Menu.Item>
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
      <span>{I18n.t('administration.assessor.toolbar.tools')}</span>
      <DownOutlined />
    </Button>
  </Dropdown>
)

export default ToolsDropdown
