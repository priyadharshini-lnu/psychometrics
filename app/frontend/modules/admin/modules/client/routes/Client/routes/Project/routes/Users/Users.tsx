import React from 'react'
import { useHistory, useLocation, useParams } from 'react-router'
import { Menu } from 'antd'

import settings from 'modules/admin/modules/client/routes/Client/routes/Project/settings'
import RouteList from 'components/RouteList'
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

  return (
    <div>
      <Menu
        onSelect={handleOnSelect}
        selectedKeys={handleSelectedKeys()}
        mode="horizontal"
      >
        <Menu.Item key="participants">
          {I18n.t('administration.breadcrumbs.participants')}
        </Menu.Item>
        <Menu.Item key="assessors">
          {I18n.t('administration.breadcrumbs.assessors')}
        </Menu.Item>
      </Menu>
      <RouteList
        routes={routes}
        urlPrefix={`${settings.urlPrefix}/:projectId/users`}
      />
    </div>
  )
}
