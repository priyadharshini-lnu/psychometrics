import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { State as SmsInvites } from '~/modules/admin/modules/campaigns/core/smsInvites'

const { I18n } = window

interface Props {
  campaignId: number
  openModal(name: string, data?: { campaignId: number }): void
  permissions: SmsInvites['permissions']
}

export const ToolsDropdown: React.FC<Props> = ({ campaignId, openModal, permissions }) => (
  <ConditionalDropdown
    menu={getMenuProps({
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

const getMenuProps = ({
  campaignId,
  openModal,
  permissions,
}): MenuProps => {
  const menuItems:ItemType[] = []
  permissions.export && menuItems.push({
    key: 'export',
    label: (
      <a href={`/administration/new_campaigns/${campaignId}/sms_invites.csv`}>
        {I18n.t('administration.sms_invites.tools.export')}
      </a>
    ),
  })
  permissions.import && menuItems.push({
    key: 'import',
    label: I18n.t('administration.sms_invites.tools.import'),
  })
  permissions.sendSms && menuItems.push({
    key: 'sendSms',
    label: I18n.t('administration.sms_invites.tools.send_sms'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'import') {
      openModal('ImportSmsInvites', { campaignId })
    }
    if (key === 'sendSms') {
      openModal('SendSmsModal', { campaignId })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
