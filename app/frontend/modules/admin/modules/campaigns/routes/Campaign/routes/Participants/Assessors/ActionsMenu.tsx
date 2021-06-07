import React from 'react'
import { Menu, Modal, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import User from 'modules/admin/modules/campaigns/interfaces/User'

const { I18n } = window

interface ActionMenuProps {
  campaignId: string
  currentUser: User
  id: number
  email: string
  permissions: {
    loginAs: boolean
    remove: boolean
  }
  remove(): void
}

export const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, id, remove, email, permissions,
}) => {
  const handleDelete = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('administration.assessor.remove_confirmation', { email }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove()
        message.success(I18n.t('campaign_users.details.modals.remove.successfully', { email }))
      },
    })
  }

  return (
    <Menu>
      {permissions.remove && (
        <Menu.Item
          key="delete"
        >
          <div
            role="button"
            tabIndex={-1}
            onClick={() => handleDelete()}
          >
            {I18n.t('common.actions.remove')}
          </div>
        </Menu.Item>
      )}
      {permissions.loginAs && (
        <Menu.Item key="loginAs">
          <a
            href={`/administration/new_campaigns/${campaignId}/assessors/${id}/spoof`}
          >
            {I18n.t('frontend.login')}
          </a>
        </Menu.Item>
      )}
    </Menu>
  )
}
