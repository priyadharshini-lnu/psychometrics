import { FC, ReactElement } from 'react'
import { Button, Menu, Tooltip } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { Participant } from '~/modules/admin/modules/client/core/participants'

import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

interface Props {
  id: Participant['id']
  email: Participant['email']
  permissions: Participant['permissions']
  handleEdit(id: Participant['id']): void
  handleResetPassword(id: Participant['id']): void
  handleDelete(id: Participant['id']): void
}

export const ActionsMenu: FC<Props> = ({
  id,
  email,
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
        permissions,
        handleEdit,
        handleResetPassword,
        handleDelete,
      }) as ReactElement<MenuProps>
    }
    innerElement={(
      <Tooltip title={I18n.t('administration.table.more_actions')}>
        <Button
          id={`menu-button_projects-assessors-${id}`}
          type="link"
          aria-label={I18n.t('administration.table.more_actions')}
          aria-controls={`menu_projects-assessors-${id}`}
          aria-haspopup
        >
          <MoreOutlined />
        </Button>
      </Tooltip>
    )}
    hideForEmptyMenu
  />
)

interface MenuProps {
  id: Participant['id']
  email: Participant['email']
  permissions: Participant['permissions']
  handleEdit: Props['handleEdit']
  handleResetPassword: Props['handleResetPassword']
  handleDelete: Props['handleDelete']
}

const MenuDropdown: FC<MenuProps> = ({
  id,
  email,
  permissions,
  handleEdit,
  handleResetPassword,
  handleDelete,
}) => {
  const menuItems: ItemType[] = []
  permissions.edit && menuItems.push({
    key: 'edit',
    label: I18n.t('administration.project_participants.edit'),
  })
  permissions.resetPassword && menuItems.push({
    key: 'resetPassword',
    label: I18n.t('administration.project_participants.reset_password'),
  })
  permissions.sendMail && menuItems.push({
    key: 'sendMail',
    label: (
      <a href={`mailto:${email}`} target="_blank" rel="noreferrer noopener">
        {I18n.t('administration.project_participants.send_email')}
      </a>
    ),
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('administration.project_participants.delete'),
  })
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
      items={menuItems}
      onClick={handleMenuClick}
      id={`menu_projects-assessors-${id}`}
      aria-labelledby={`menu-button_projects-assessors-${id}`}
    />
  )
}
