import { FC } from 'react'
import {
  Button, MenuProps, Tooltip,
} from 'antd'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { MenuItem } from '~/interfaces/Antd'
import { Assessor } from '~/modules/admin/modules/client/core/assessors'

import ConditionalDropdown from '~/components/ConditionalDropdown'

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
      getMenuDropdownProps({
        id,
        email,
        permissions,
        handleEdit,
        handleResetPassword,
        handleDelete,
      })
    }
    innerElement={(
      <Tooltip title={I18n.t('admin.table_more_actions')}>
        <Button
          id={`menu-button_projects-assessors-${id}`}
          type="link"
          aria-label={I18n.t('admin.table_more_actions')}
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

interface MenuData {
  id: Assessor['id']
  email: Assessor['email']
  permissions: Assessor['permissions']
  handleEdit: Props['handleEdit']
  handleResetPassword: Props['handleResetPassword']
  handleDelete: Props['handleDelete']
}

const getMenuDropdownProps = ({
  id,
  email,
  permissions,
  handleEdit,
  handleResetPassword,
  handleDelete,
}: MenuData):MenuProps => {
  const menuItems: MenuItem[] = []
  permissions.edit && menuItems.push({
    key: 'edit',
    label: I18n.t('shared.edit'),
  })
  permissions.resetPassword && menuItems.push({
    key: 'resetPassword',
    label: I18n.t('admin.project_users_change_password'),
  })
  permissions.sendMail && menuItems.push({
    key: 'sendMail',
    label: (
      <a href={`mailto:${email}`} target="_blank" rel="noreferrer noopener">
        {I18n.t('admin.project_users_send_email')}
      </a>
    ),
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('shared.delete'),
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

  return ({
    items: menuItems,
    onClick: handleMenuClick,
    id: `menu_projects-assessors-${id}`,
    'aria-labelledby': `menu-button_projects-assessors-${id}`,
  })
}
