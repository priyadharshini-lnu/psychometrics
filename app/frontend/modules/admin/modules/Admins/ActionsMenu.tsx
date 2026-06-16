import { FC } from 'react'
import { Button, Tooltip, MenuProps } from 'antd'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'

import { User } from '~/modules/admin/modules/client/core/users'
import {
  Admin, AdminPermissions,
} from '~/modules/admin/modules/client/core/admin'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

interface Props {
  id: Admin['id']
  userId: Admin['userId']
  email: Admin['email']
  currentUser: User
  firstName: Admin['firstName']
  lastName: Admin['lastName']
  permissions: AdminPermissions
  handleDelete(
    id: Admin['id'],
    firstName: Admin['firstName'],
    lastName: Admin['lastName'],
    email: Admin['email'],
  ): void
  handleResetPassword(id: Admin['id']): void
  handleEdit(id: Admin['id']): void
}

export const ActionsMenu: FC<Props> = ({
  id,
  userId,
  currentUser,
  email,
  firstName,
  lastName,
  permissions,
  handleResetPassword,
  handleEdit,
  handleDelete,
}) => (
  <ConditionalDropdown
    menu={
      getActionMenuProps({
        id,
        userId,
        currentUser,
        email,
        firstName,
        lastName,
        permissions,
        handleEdit,
        handleResetPassword,
        handleDelete,
      })
    }
    innerElement={(
      <Tooltip title={I18n.t('shared.more_actions')}>
        <Button
          id={`menu-button_campaign-admins-${id}`}
          type="link"
          aria-label={I18n.t('shared.more_actions')}
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

interface ActionMenuData {
  id: Admin['id']
  userId: Admin['userId']
  currentUser: Props['currentUser']
  email: Admin['email']
  firstName: Admin['firstName']
  lastName: Admin['lastName']
  permissions: AdminPermissions
  handleResetPassword: Props['handleResetPassword']
  handleDelete: Props['handleDelete']
  handleEdit: Props['handleEdit']
}

const getActionMenuProps = ({
  id,
  email,
  firstName,
  lastName,
  permissions,
  handleResetPassword,
  handleDelete,
  handleEdit,
}: ActionMenuData): MenuProps => {
  const menuItems:MenuItem[] = []
  permissions.loginAs && menuItems.push(
    {
      key: 'loginAs',
      label: (
        <a
          href={`/api/v2/administration/memberships/${id}/spoof`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('shared.login')}
        </a>
      ),
    },
  )
  permissions.edit && menuItems.push(
    {
      key: 'edit',
      label: I18n.t('shared.edit'),
    },
  )
  permissions.resetPassword && menuItems.push(
    {
      key: 'resetPassword',
      label: I18n.t('shared.reset_password'),
    },
  )
  permissions.sendMail && menuItems.push(
    {
      key: 'sendMail',
      label: (
        <a href={`mailto:${email}`} target="_blank" rel="noreferrer noopener">
          {I18n.t('shared.send_email')}
        </a>
      ),
    },
  )
  permissions.remove && menuItems.push(
    {
      key: 'remove',
      label: I18n.t('shared.remove'),
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
      handleDelete(id, firstName, lastName, email)
    }
  }

  return ({
    id: `menu_campaign-admins-${id}`,
    'aria-labelledby': `menu-button_campaign-subjects-${id}`,
    items: menuItems,
    onClick: handleMenuClick,
  })
}
