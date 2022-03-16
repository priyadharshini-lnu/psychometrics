import React, { FC } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  ShopOutlined,
} from '@ant-design/icons'

import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import settings from 'modules/admin/modules/client/settings'
import RouteList from 'components/RouteList'
import { routes } from './routes'

const { I18n } = window

type Props = {}

export const Client: FC<Props> = () => {
  const { clientId } = useParams<{ clientId: string }>()
  const history = useHistory()
  const { pathname } = useLocation()

  const handleOnSelect = ({ key }) => {
    if (key === 'client_admins') {
      window.location.pathname = `/administration/clients/${clientId}/client_admins`
    } else {
      history.push(`${settings.urlPrefix}/clients/374/${key}`)
    }
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/projects')) {
      return ['projects']
    }
    if (pathname.includes('/client_admins')) {
      return ['client_admins']
    }
    return undefined
  }

  const getPageTitle = (pathname: string): string => {
    const primaryLevelTab = getActiveMenuKey(pathname)
    if (primaryLevelTab === undefined) {
      return ''
    }

    const [primaryTab] = primaryLevelTab
    switch (primaryTab) {
      case 'projects':
        return I18n.t('common.model.projects')
      default:
        return ''
    }
  }

  return (
    <div>
      <Breadcrumb
        request={{
          fields: ['project', 'client'],
          data: {
            projectId: parseInt(clientId, 10),
          },
        }}
        crumbs={[
          {
            link: () => '/administration',
            label: () => I18n.t('administration.clients.tenancies'),
          },
          {
            link: state => `/administration/clients/${state.client.id}/projects`,
            label: state => state.client.name,
          },
          {
            label: () => getPageTitle(pathname),
          },
        ]}
      />
      <Menu
        onSelect={handleOnSelect}
        selectedKeys={getActiveMenuKey(pathname)}
        mode="horizontal"
      >
        <Menu.Item key="projects" icon={<ShopOutlined />}>
          {I18n.t('administration.breadcrumbs.projects')}
        </Menu.Item>
        <Menu.Item key="client_admins" icon={<ShopOutlined />}>
          {I18n.t('administration.breadcrumbs.clientAdmins')}
        </Menu.Item>
      </Menu>
      <RouteList
        routes={routes}
        urlPrefix={`${settings.urlPrefix}`}
      />
    </div>
  )
}
