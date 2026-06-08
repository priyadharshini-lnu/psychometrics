
import React, { useState } from 'react'
import {
  Button, MenuProps, Switch, message, Tooltip,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import _ from 'lodash'
import { Admin } from 'modules/admin/modules/client/core/admin'
import { useNavigate } from 'react-router-dom'
import {
  LockOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { isSuperAdmin } from '~/core/currentUser'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { ConfirmationModal } from '~/glint'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

const connecter = connect(null, { openModal })
interface OwnProps {
  userTab: string,
  currentUser: User,
  openDrawer: (user: User) => void
}
export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux & OwnProps

export const UserTableComponent: React.FC<Props> = ({
  openDrawer,
  openModal,
  userTab,
  currentUser,
}) => (
  <Resource.Table pagination>
    <Resource.Column<User>
      title={I18n.t('shared.id')}
      id="id"
      sorter
      render={user => <Button type="link" onClick={() => openDrawer(user)}>{user.id}</Button>}
    />
    <Resource.Column<User>
      id="disabled"
      title={I18n.t('shared.active')}
      render={user => <ActiveSwitch user={user} />}
    />
    <Resource.Column<User>
      title={I18n.t('shared.first_name')}
      id="first_name"
      width={300}
      sorter
    />
    <Resource.Column<User>
      title={I18n.t('shared.last_name')}
      id="last_name"
      width={300}
      sorter
    />
    <Resource.Column<User>
      title={I18n.t('shared.email')}
      id="email"
      width={300}
      sorter
      render={user => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>{user.email}</span>
          {user.accessLocked && (
            <Tooltip placement="top" title={I18n.t('users.actions.unlock_user_access.tooltip')}>
              <span><LockOutlined /></span>
            </Tooltip>
          )}
        </div>
      )}
    />
    <Resource.Column<User>
      title={I18n.t('shared.last_updated')}
      id="updated_at"
      width={300}
      sorter
    />
    <Resource.Column<User>
      title={I18n.t('shared.action')}
      id="action"
      render={(_, user) => (
        <Dropdown
          userTab={userTab}
          currentUser={currentUser}
          user={user}
          openResetPasswordModal={user => openModal('ResetPasswordModal', { user })}
        />
      )}
      width={100}
    />
  </Resource.Table>
)

export const UserTable = connecter(UserTableComponent)

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

interface DropdownProps {
  user: User
  userTab: string,
  currentUser: User,
  openResetPasswordModal: (user: User) => void
}

const Dropdown: React.FC<DropdownProps> = ({
  user, openResetPasswordModal, userTab, currentUser,
}) => {
  const [confirmation, setConfirmation] = useState(false)
  const { resource } = useResourceContext<User>()

  const handleOnConfirm = () => resource.removeResource(user.id).then(() => {
    message.info(I18n.t('users.actions.remove.success_message', { email: user.email }))
  }).catch(response => (message.error(response.error
    ? I18n.t('users.actions.remove.error_message', { error: response.error })
    : I18n.t('users.actions.remove.system_error_message'))
  ))

  return (
    <>
      <ConditionalDropdown menu={getActionsMenuProps({
        user, openResetPasswordModal, setConfirmation, userTab, currentUser,
      })}
      />
      <ConfirmationModal
        open={confirmation}
        title={I18n.t('users.actions.remove.confirm_title')}
        message={I18n.t('users.actions.remove.confirm_message', { email: user.email })}
        onConfirm={handleOnConfirm}
        close={() => setConfirmation(false)}
      />
    </>

  )
}

interface ActionMenuData extends DropdownProps {
  user: User
  setConfirmation: (confirmation: boolean) => void
  openResetPasswordModal: DropdownProps['openResetPasswordModal']
}

const getActionsMenuProps = ({
  setConfirmation, user, openResetPasswordModal, userTab, currentUser,
}: ActionMenuData):MenuProps => {
  const navigate = useNavigate()
  const { resource } = useResourceContext<User>()

  const toggle2FA = (user) => {
    resource.updateResource({
      id: user.id,
      enable_2fa: !user.enable_2fa,
    }).then((user: User) => {
      message.info(I18n.t(`users.actions.2fa.confirm_message.${user.enable_2fa ? 'enabled' : 'disabled'}`))
    })
  }

  const unlockUserAccess = () => resource.memberAction({
    action: 'unlock_user_access',
    id: user.id,
    method: 'post',
  }).then(({ email }: User) => {
    message.info(I18n.t('users.actions.unlock_user_access.message', { email }))
  })

  const handleAPIKeysClick = (userId: Admin['userId']) => {
    navigate(`/admin/users/admins/${userId}/api_keys`)
  }

  const menuItems = [
    user.meta.permissions.resetPassword && {
      key: 'reset_password',
      label: I18n.t('users.actions.reset_password.option'),
      onClick: () => openResetPasswordModal(user),
    },
    user.meta.permissions.toggleEnable2fa && {
      key: '2fa',
      label: I18n.t(`users.actions.2fa.${user.enable_2fa ? 'option_to_disable' : 'option_to_enable'}`),
      onClick: () => toggle2FA(user),
    },
    user.meta.permissions.remove && {
      key: 'remove',
      label: I18n.t('shared.remove'),
      onClick: () => setConfirmation(true),
    },
    (isSuperAdmin(currentUser) && userTab === 'Users::Admin') && {
      key: 'apiKeys',
      label: I18n.t('admin.api_keys'),
      onClick: () => handleAPIKeysClick(user.id),
    },
    user.meta.permissions.loginAs && {
      key: 'loginAs',
      label: (
        <a
          href={`/administration/users/${user.id}/spoof`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit' }}
        >
          {I18n.t('admin.login')}
        </a>
      ),
    },
    user.meta.permissions.unlockUserAccess && {
      key: 'unlock_user_access',
      label: I18n.t('users.actions.unlock_user_access.title'),
      onClick: unlockUserAccess,
    },
  ]

  return ({ items: _.compact(menuItems) })
}
