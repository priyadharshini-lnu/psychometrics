import { FC, useEffect } from 'react'
import {
  useParams, useNavigate, useLocation,
} from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import {
  ShopOutlined, UserOutlined, SettingOutlined, SolutionOutlined, ExportOutlined, DatabaseOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { useResources } from '~/hooks/useResources'
import { Client as ClientType, ClientTR } from '~/modules/admin/modules/client/core/clients'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'

import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import settings from '~/modules/admin/modules/client/settings'
import RouteList from '~/components/RouteList'
import { routes } from './routes'
import { ClientContext } from './ClientContext'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const Client: FC<Props> = ({ currentUser }) => {
  const { clientId } = useParams() as { clientId: string }
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const baseApiConfig = {
    include: ['project_manager'],
    fields: { users: ['name', 'email'] },
    include_resource_meta: ['permissions'],
  }

  const {
    fetchSingle,
    getResource,
  } = useResources<ClientType>(
    'clients',
    {
      trackUrl: true,
      responseType: ClientTR,
      apiConfig: baseApiConfig,
    },
  )

  const client = getResource(clientId)

  useEffect(() => {
    fetchSingle({
      id: clientId,
      responseType: ClientTR,
      apiConfig: baseApiConfig,
    })
  }, [clientId])

  const handleOnSelect = ({ key }) => {
    navigate(`${settings.urlPrefix}/clients/${clientId}/${key}`)
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
    if (pathname.includes('/data_reports')) {
      return ['data_reports']
    }
    if (pathname.includes('/audit_reports')) {
      return ['audit_reports']
    }
    if (pathname.includes('/licenses')) {
      return ['licenses']
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
        return I18n.t('admin.projects')
      case 'admins':
        return I18n.t('admin.admins')
      case 'settings':
        return I18n.t('admin.settings')
      case 'data_reports':
        return I18n.t('admin.data_reports')
      case 'audit_reports':
        return I18n.t('admin.audit_reports')
      case 'licenses':
        return I18n.t('admin.licenses')
      default:
        return ''
    }
  }
  const menuItems: MenuItem[] = [
    {
      key: 'projects',
      icon: <ShopOutlined />,
      label: I18n.t('administration.breadcrumbs.projects'),
    },
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

  client?.meta.permissions.viewDataReports && menuItems.push({
    key: 'data_reports',
    icon: <DatabaseOutlined />,
    label: I18n.t('administration.breadcrumbs.data_reports'),
  })

  client?.meta.permissions.viewAuditReports && menuItems.push({
    key: 'audit_reports',
    icon: <ExportOutlined />,
    label: I18n.t('administration.breadcrumbs.audit_reports'),
  })
  client?.meta.permissions.viewLicenses && menuItems.push(
    {
      key: 'licenses',
      icon: <SolutionOutlined />,
      label: I18n.t('administration.breadcrumbs.licenses'),
    },
  )

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
            link: window.PsyGlobalState?.clientContextData ? undefined : () => '/admin',
            label: () => I18n.t('administration.clients.clients'),
          },
          {
            link: state => `/admin/clients/${state.client.id}/projects`,
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
      <ClientContext.Provider value={{ client }}>
        <RouteList
          routes={routes}
          urlPrefix=""
        />
      </ClientContext.Provider>
    </div>
  )
}

export default connecter(Client)
