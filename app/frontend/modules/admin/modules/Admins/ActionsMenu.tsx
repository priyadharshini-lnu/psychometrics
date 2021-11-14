import React, { FC, ReactElement } from 'react'
import { Button, Menu, Tooltip } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

import { Admin } from 'modules/admin/modules/Admins/core'

import ConditionalDropdown from 'components/ConditionalDropdown'

const { I18n } = window

interface Props {
  id: Admin['id']
  email: Admin['email']
  campaignId: number
  permissions: Admin['permissions']
  handleEdit(id: Admin['id']): void
  handleDelete(id: Admin['id']): void
  handleResetPassword(id: Admin['id']): void
}

export const ActionsMenu: FC<Props> = ({
  id,
  email,
  campaignId,
  permissions,
  handleEdit,
  handleDelete,
  handleResetPassword,
}) => (
  <ConditionalDropdown
    menu={
      MenuDropdown({
        id,
        email,
        campaignId,
        permissions,
        handleEdit,
        handleDelete,
        handleResetPassword,
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
  campaignId: number
  email: Admin['email']
  permissions: Admin['permissions']
  handleEdit: Props['handleEdit']
  handleDelete: Props['handleDelete']
  handleResetPassword: Props['handleResetPassword']
}

const MenuDropdown: FC<MenuProps> = ({
  id,
  email,
  campaignId,
  permissions,
  handleEdit,
  handleDelete,
  handleResetPassword,
}) => (
  <Menu
    id={`menu_campaign-admins-${id}`}
    aria-labelledby={`menu-button_campaign-subjects-${id}`}
  >
    {permissions.loginAs && (
      <Menu.Item key="loginAs">
        <a
          href={`/administration/new_campaigns/${campaignId}/admins/${id}/spoof`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('administration.administrators.list.actions.login')}
        </a>
      </Menu.Item>
    )}
    {permissions.edit && (
      <Menu.Item key="edit" onClick={() => handleEdit(id)}>
        {I18n.t('administration.administrators.list.actions.edit')}
      </Menu.Item>
    )}
    {permissions.resetPassword && (
      <Menu.Item key="resetPassword" onClick={() => handleResetPassword(id)}>
        {I18n.t('administration.administrators.list.actions.change_password')}
      </Menu.Item>
    )}
    {permissions.sendMail && (
      <Menu.Item key="sendMail">
        <a href={`mailto:${email}`} target="_blank" rel="noreferrer noopener">
          {I18n.t('administration.administrators.list.actions.send_email')}
        </a>
      </Menu.Item>
    )}
    {permissions.remove && (
      <Menu.Item key="remove" onClick={() => handleDelete(id)}>
        {I18n.t('administration.administrators.list.actions.delete')}
      </Menu.Item>
    )}
  </Menu>
)
