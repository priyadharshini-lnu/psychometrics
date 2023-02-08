import React, { FC, ReactElement } from 'react'
import { Button, Menu, Tooltip } from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { MoreOutlined } from '@ant-design/icons'

import {
  Admin, AdminPermissions,
} from '~/modules/admin/modules/client/core/admin'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

interface Props {
  id: Admin['id']
  email: Admin['email']
  permissions: AdminPermissions
  handleDelete(id: Admin['id']): void
  handleResetPassword(id: Admin['id']): void
  handleEdit(id: Admin['id']): void
}

export const ActionsMenu: FC<Props> = ({
  id,
  email,
  permissions,
  handleResetPassword,
  handleEdit,
  handleDelete,
}) => (
  <ConditionalDropdown
    menu={
      MenuDropdown({
        id,
        email,
        permissions,
        handleEdit,
        handleResetPassword,
        handleDelete,
      }) as ReactElement<MenuProps>
    }
    innerElement={(
      <Tooltip title={I18n.t('administration.table.more_actions')}>
        <Button
          id={`menu-button_campaign-admins-${id}`}
          type="link"
          aria-label={I18n.t('administration.table.more_actions')}
          aria-controls={`menu_campaign-admins-${id}`}
          aria-haspopup
        >
          <MoreOutlined />
        </Button>
      </Tooltip>
    )}
    hideForEmptyMenu
    className="mrm"
  />
)

interface MenuProps {
  id: Admin['id']
  email: Admin['email']
  permissions: AdminPermissions
  handleResetPassword: Props['handleResetPassword']
  handleDelete: Props['handleDelete']
  handleEdit: Props['handleEdit']
}

const MenuDropdown: FC<MenuProps> = ({
  id,
  email,
  permissions,
  handleResetPassword,
  handleDelete,
  handleEdit,
}) => {
  const menuItems:ItemType[] = []
  permissions.loginAs && menuItems.push(
    {
      key: 'loginAs',
      label: (
        <a
          href={`/api/v2/administration/memberships/${id}/spoof`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('administration.administrators.list.actions.login')}
        </a>
      ),
    },
  )
  permissions.edit && menuItems.push(
    {
      key: 'edit',
      label: I18n.t('administration.administrators.list.actions.edit'),
    },
  )
  permissions.resetPassword && menuItems.push(
    {
      key: 'resetPassword',
      label: I18n.t('administration.administrators.list.actions.change_password'),
    },
  )
  permissions.sendMail && menuItems.push(
    {
      key: 'sendMail',
      label: (
        <a href={`mailto:${email}`} target="_blank" rel="noreferrer noopener">
          {I18n.t('administration.administrators.list.actions.send_email')}
        </a>
      ),
    },
  )
  permissions.remove && menuItems.push(
    {
      key: 'remove',
      label: I18n.t('common.actions.remove'),
    },
  )

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      handleEdit(id)
    }
    if (key === 'resetPassword') {
      handleResetPassword(id)
    }
    if (key === 'remove') {
      handleDelete(id)
    }
  }
  return (
    <Menu
      id={`menu_campaign-admins-${id}`}
      aria-labelledby={`menu-button_campaign-subjects-${id}`}
      items={menuItems}
      onClick={handleMenuClick}
    />
  )
}
