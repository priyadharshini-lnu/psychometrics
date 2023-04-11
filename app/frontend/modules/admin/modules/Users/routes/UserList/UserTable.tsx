
import React, { useState } from 'react'
import {
  Button, Menu, Switch, message,
} from 'antd'
import * as t from 'io-ts'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { ConfirmationModal } from '~/glint'
import { isSuperAdmin } from '~/core/currentUser'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

export const UserTable: React.FC<{ currentUser: User, openDrawer: (user: User) => void }> = ({
  currentUser,
  openDrawer,
}) => (
  <Resource.Table pagination>
    <Resource.Column<User>
      title={I18n.t('common.column.id')}
      id="id"
      sorter
      render={user => <Button type="link" onClick={() => openDrawer(user)}>{user.id}</Button>}
    />
    <Resource.Column<User>
      id="disabled"
      title={I18n.t('common.column.active')}
      render={user => <ActiveSwitch user={user} />}
    />
    <Resource.Column<User>
      title={I18n.t('common.column.first_name')}
      id="first_name"
      width={300}
      sorter
    />
    <Resource.Column<User>
      title={I18n.t('common.column.last_name')}
      id="last_name"
      width={300}
      sorter
    />
    <Resource.Column<User>
      title={I18n.t('common.column.email')}
      id="email"
      width={300}
      sorter
    />
    <Resource.Column<User>
      title={I18n.t('common.column.updated_at')}
      id="updated_at"
      width={300}
      sorter
    />
    {isSuperAdmin(currentUser)
        && (
          <Resource.Column<User>
            title={I18n.t('common.column.action')}
            id="action"
            render={(_, user) => <Dropdown user={user} />}
          />
        )}
  </Resource.Table>
)

const ActiveSwitch: React.FC<{ user: User }> = ({ user }) => {
  const { resource } = useResourceContext<User>()
  return (
    <Switch
      checked={!user.disabled}
      onChange={() => {
        resource.updateResource({ id: user.id, disabled: !user.disabled })
      }}
    />
  )
}

const Dropdown: React.FC<{ user: User }> = ({ user }) => {
  const [confirmation, setConfirmation] = useState(false)
  return (<ConditionalDropdown menu={ActionsMenu({ user, setConfirmation, confirmation }) as React.ReactElement} />)
}

interface ActionMenuProps {
  user: User
  setConfirmation: (confirmation: boolean) => void
  confirmation: boolean
}

const ResetPasswordTR = t.literal('ok')

const ActionsMenu: React.FC<ActionMenuProps> = ({ setConfirmation, confirmation, user }) => {
  const { resource } = useResourceContext<User>()

  const resetPassword = (user: User) => resource.memberAction({
    id: user.id,
    action: 'reset_password',
    method: 'post',
    responseType: ResetPasswordTR,
  }).then(
    () => message.info(I18n.t('users.actions.reset_password.confirm_message', { email: user.email })),
  ).catch(e => message.error(JSON.stringify(e)))

  const toggle2FA = (user) => {
    resource.updateResource({
      id: user.id,
      enable_2fa: !user.enable_2fa,
    }).then((user: User) => {
      message.info(I18n.t(`users.actions.2fa.confirm_message.${user.enable_2fa ? 'enabled' : 'disabled'}`))
    })
  }

  const handleOnConfirm = () => resource.removeResource(user.id).then(() => {
    message.info(I18n.t('users.actions.remove.success_message', { email: user.email }))
  }).catch(e => message.error(JSON.stringify(e)))

  const menuItems = [
    {
      key: 'reset_password',
      label: (
        <Button type="link" onClick={() => resetPassword(user)} className="ps-0">
          {I18n.t('users.actions.reset_password.option')}
        </Button>),
    },
    {
      key: '2fa',
      label: (
        <Button type="link" onClick={() => toggle2FA(user)} className="ps-0">
          {I18n.t(`users.actions.2fa.${user.enable_2fa ? 'option_to_disable' : 'option_to_enable'}`)}
        </Button>),
    },
    {
      key: 'remove',
      label: (
        <>
          <Button type="link" onClick={() => setConfirmation(true)} className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
          {confirmation && (
            <ConfirmationModal
              title={I18n.t('users.actions.remove.confirm_title')}
              message={I18n.t('users.actions.remove.confirm_message', { email: user.email })}
              onConfirm={handleOnConfirm}
              onCancel={() => setConfirmation(false)}
            />
          )}
        </>
      ),
    },
  ]

  return (<Menu items={menuItems} />)
}
