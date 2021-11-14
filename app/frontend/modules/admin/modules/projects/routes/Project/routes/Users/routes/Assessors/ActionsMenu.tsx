import React, { FC, ReactElement } from 'react'
import { Button, Menu, Tooltip } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

import { Assessor } from 'modules/admin/modules/projects/core/assessors'

import ConditionalDropdown from 'components/ConditionalDropdown'

const { I18n } = window

interface Props {
  id: Assessor['id']
  email: Assessor['email']
  permissions: Assessor['permissions']
  handleEdit(id: Assessor['id']): void
  handleResetPassword(id: Assessor['id']): void
  handleDelete(id: Assessor['id']): void
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
  id: Assessor['id']
  email: Assessor['email']
  permissions: Assessor['permissions']
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
        {I18n.t('administration.project_users.edit')}
      </Menu.Item>
    )}
    {permissions.resetPassword && (
      <Menu.Item key="resetPassword" onClick={() => handleResetPassword(id)}>
        {I18n.t('administration.project_users.change_password')}
      </Menu.Item>
    )}
    {permissions.sendMail && (
      <Menu.Item key="sendMail">
        <a href={`mailto:${email}`} target="_blank" rel="noreferrer noopener">
          {I18n.t('administration.project_users.send_email')}
        </a>
      </Menu.Item>
    )}
    {permissions.remove && (
      <Menu.Item key="remove" onClick={() => handleDelete(id)}>
        {I18n.t('administration.project_users.delete')}
      </Menu.Item>
    )}
  </Menu>
)
