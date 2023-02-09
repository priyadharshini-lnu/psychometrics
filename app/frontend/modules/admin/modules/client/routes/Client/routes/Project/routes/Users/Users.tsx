import { useHistory, useLocation, useParams } from 'react-router'
import { Menu } from 'antd'

import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import RouteList from '~/components/RouteList'
import { routes } from './routes'

const { I18n } = window

export const Users = () => {
  const history = useHistory()
  const { projectId } = useParams<{ projectId: string }>()
  const { pathname } = useLocation()

  const handleOnSelect = ({ key }) => {
    history.push(`${settings.urlPrefix}/${projectId}/users/${key}`)
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
    { key: 'participants', label: I18n.t('administration.breadcrumbs.participants') },
    { key: 'assessors', label: I18n.t('administration.breadcrumbs.assessors') },
  ]

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={handleOnSelect}
        selectedKeys={handleSelectedKeys()}
        mode="horizontal"
      />
      <RouteList
        routes={routes}
        urlPrefix={`${settings.urlPrefix}/:projectId/users`}
      />
    </div>
  )
}
