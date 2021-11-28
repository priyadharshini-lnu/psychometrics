import React from 'react'
import {
  Button, Menu,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { State as SmsInvites } from 'modules/admin/modules/campaigns/core/smsInvites'

const { I18n } = window

interface Props {
  campaignId: number
  openModal(name: string, data?: { campaignId: number }): void
  permissions: SmsInvites['permissions']
}

export const ToolsDropdown: React.FC<Props> = ({ campaignId, openModal, permissions }) => (
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

const menu: React.FC<Props> = ({
  campaignId,
  openModal,
  permissions,
}) => (
  <Menu>
    {permissions.export && (
      <Menu.Item key="export">
        <a href={`/administration/new_campaigns/${campaignId}/sms_invites.csv`}>
          {I18n.t('administration.sms_invites.tools.export')}
        </a>
      </Menu.Item>
    )}
    {permissions.import && (
      <Menu.Item key="import">
        <a onClick={() => openModal('ImportSmsInvites', { campaignId })}>
          {I18n.t('administration.sms_invites.tools.import')}
        </a>
      </Menu.Item>
    )}
    {permissions.sendSms && (
      <Menu.Item key="sendSms">
        <a onClick={() => openModal('SendSmsModal', { campaignId })}>
          {I18n.t('administration.sms_invites.tools.send_sms')}
        </a>
      </Menu.Item>
    )}
  </Menu>
)
