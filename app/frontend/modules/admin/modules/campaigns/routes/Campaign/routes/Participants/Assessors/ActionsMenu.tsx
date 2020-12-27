import React from 'react'
import { Menu, Modal, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { I18n } = window


interface ActionMenuProps {
  onEdit(): void
  email: string
  remove(): void
}

export const ActionsMenu: React.FC<ActionMenuProps> = ({
  onEdit, remove, email,
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
      <Menu.Item key="edit">
        <div
          role="button"
          tabIndex={-1}
          onClick={onEdit}
        >
          {I18n.t('frontend.edit')}
        </div>
      </Menu.Item>
      <Menu.Item key="delete">
        <div
          role="button"
          tabIndex={-1}
          onClick={() => handleDelete()}
        >
          {I18n.t('common.actions.remove')}
        </div>
      </Menu.Item>
    </Menu>
  )
}
