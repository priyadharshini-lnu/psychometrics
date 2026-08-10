import {
  useNavigate, useLocation, useParams, Outlet,
} from 'react-router'
import { Menu } from 'antd'

import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'

const { I18n } = window

export const Users = () => {
  const navigate = useNavigate()
  const { projectId } = useParams() as { projectId: string }
  const { pathname } = useLocation()

  const handleOnSelect = ({ key }) => {
    navigate(`${settings.urlPrefix}/${projectId}/users/${key}`)
  }

  const handleSelectedKeys = (): string[] => {
    if (pathname.includes('/users/participants')) {
      return ['participants']
    }
    if (pathname.includes('/users/assessors')) {
      return ['assessors']
    }
    return [pathname]
  }

  const menuItems = [
    { key: 'participants', label: I18n.t('admin.participants') },
    { key: 'assessors', label: I18n.t('admin.assessors') },
  ]

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={handleOnSelect}
        selectedKeys={handleSelectedKeys()}
        mode="horizontal"
      />
      <Outlet />
    </div>
  )
}
