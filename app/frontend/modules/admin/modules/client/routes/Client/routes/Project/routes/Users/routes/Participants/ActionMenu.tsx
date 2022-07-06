import React, { FC, ReactElement } from 'react'
import { Button, Menu, Tooltip } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

import { Participant } from 'modules/admin/modules/client/core/participants'

import ConditionalDropdown from 'components/ConditionalDropdown'

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
}) => (
  <Menu
    id={`menu_projects-assessors-${id}`}
    aria-labelledby={`menu-button_projects-assessors-${id}`}
  >
    {permissions.edit && (
      <Menu.Item key="edit" onClick={() => handleEdit(id)}>
        {I18n.t('administration.project_participants.edit')}
      </Menu.Item>
    )}
    {permissions.resetPassword && (
      <Menu.Item key="resetPassword" onClick={() => handleResetPassword(id)}>
        {I18n.t('administration.project_participants.reset_password')}
      </Menu.Item>
    )}
    {permissions.sendMail && (
      <Menu.Item key="sendMail">
        <a href={`mailto:${email}`} target="_blank" rel="noreferrer noopener">
          {I18n.t('administration.project_participants.send_email')}
        </a>
      </Menu.Item>
    )}
    {permissions.remove && (
      <Menu.Item key="remove" onClick={() => handleDelete(id)}>
        {I18n.t('administration.project_participants.delete')}
      </Menu.Item>
    )}
  </Menu>
)
