import { FC } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import { Menu } from 'antd'
import {
  ShopOutlined, UserOutlined, SettingOutlined,
} from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { connect, ConnectedProps } from 'react-redux'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'

import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import settings from '~/modules/admin/modules/client/settings'
import RouteList from '~/components/RouteList'
import { routes } from './routes'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const ClientComponent: FC<Props> = ({ currentUser }) => {
  const { clientId } = useParams<{ clientId: string }>()
  const history = useHistory()
  const { pathname } = useLocation()

  const handleOnSelect = ({ key }) => {
    history.push(`${settings.urlPrefix}/clients/${clientId}/${key}`)
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/projects')) {
      return ['projects']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/settings')) {
      return ['settings']
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
      case 'admins':
        return I18n.t('administration.breadcrumbs.admins')
      case 'settings':
        return I18n.t('administration.breadcrumbs.settings')
      default:
        return ''
    }
  }
  const menuItems: ItemType[] = [
    { key: 'projects', icon: <ShopOutlined />, label: I18n.t('administration.breadcrumbs.projects') },
  ]

  isSuperAdmin(currentUser) && menuItems.push({
    key: 'admins',
    icon: <UserOutlined />,
    label: I18n.t('administration.breadcrumbs.client_admins'),
  })

  isSuperAdmin(currentUser) && menuItems.push({
    key: 'settings',
    icon: <SettingOutlined />,
    label: I18n.t('administration.breadcrumbs.settings'),
  })

  return (
    <div>
      <Breadcrumb
        request={{
          fields: ['client'],
          data: {
            clientId: parseInt(clientId, 10),
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
        items={menuItems}
        onSelect={handleOnSelect}
        selectedKeys={getActiveMenuKey(pathname)}
        mode="horizontal"
      />
      <RouteList
        routes={routes}
        urlPrefix={`${settings.urlPrefix}`}
      />
    </div>
  )
}

export const Client = connecter(ClientComponent)
