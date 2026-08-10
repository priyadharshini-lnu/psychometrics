import { FC, useEffect } from 'react'
import {
  useParams, useNavigate, useLocation, Outlet,
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
    if (pathname.includes('/assessors')) {
      return ['assessors']
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
      case 'assessors':
        return I18n.t('admin.assessors')
      case 'settings': {
        if (pathname.includes('/smtp')) return I18n.t('admin.smtp_settings_smtp')
        if (pathname.includes('/sso_settings')) return I18n.t('admin.sso_settings_tab')
        if (pathname.includes('/login_page_design')) return I18n.t('admin.login_page_design_tab')
        if (pathname.includes('/siem')) return I18n.t('admin.settings_tabs_siem')
        if (pathname.includes('/skill_aliases')) return I18n.t('admin.settings_tabs_skill_aliases')
        if (pathname.includes('/privacy_settings')) return I18n.t('admin.project_tabs_privacy')
        if (pathname.includes('/features')) return I18n.t('admin.settings_tabs_feature_flags')
        if (pathname.includes('/roles')) return I18n.t('admin.settings_tabs_admin_roles')
        if (pathname.includes('/applications')) return I18n.t('admin.applications')
        return I18n.t('admin.settings')
      }
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
      label: I18n.t('admin.projects'),
    },
  ]

  isSuperAdmin(currentUser) && menuItems.push({
    key: 'admins',
    icon: <UserOutlined />,
    label: I18n.t('admin.client_admins'),
  })

  isSuperAdmin(currentUser) && menuItems.push({
    key: 'assessors',
    icon: <UserOutlined />,
    label: I18n.t('admin.assessors'),
  })

  isSuperAdmin(currentUser) && menuItems.push({
    key: 'settings',
    icon: <SettingOutlined />,
    label: I18n.t('admin.settings'),
  })

  client?.meta.permissions.viewDataReports && menuItems.push({
    key: 'data_reports',
    icon: <DatabaseOutlined />,
    label: I18n.t('admin.data_reports'),
  })

  client?.meta.permissions.viewAuditReports && menuItems.push({
    key: 'audit_reports',
    icon: <ExportOutlined />,
    label: I18n.t('admin.audit_reports'),
  })
  client?.meta.permissions.viewLicenses && menuItems.push(
    {
      key: 'licenses',
      icon: <SolutionOutlined />,
      label: I18n.t('admin.licenses'),
    },
  )

  const getBreadcrumbRequest = () => ({
    fields: ['client'],
    data: { clientId: parseInt(clientId, 10) },
  })

  const getBreadcrumbCrumbs = () => {
    const baseCrumbs = [
      {
        link: window.PsyGlobalState?.clientContextData ? undefined : () => '/admin',
        label: () => I18n.t('admin.clients'),
      },
      {
        link: state => `/admin/clients/${state.client.id}/projects`,
        label: state => state.client.name,
      },
    ]

    if (pathname.includes('/settings/')) {
      const settingsUrl = `${settings.urlPrefix}/clients/${clientId}/settings`
      const applicationsListUrl = `${settingsUrl}/applications`
      const isOnApplicationDetails = /\/settings\/applications\/\d+/.test(pathname)

      return [
        ...baseCrumbs,
        {
          link: () => settingsUrl,
          label: () => I18n.t('admin.settings'),
        },
        ...(isOnApplicationDetails ? [
          {
            link: () => applicationsListUrl,
            label: () => I18n.t('admin.applications'),
          },
          {
            label: state => state.application?.name,
          },
        ] : [
          {
            label: () => getPageTitle(pathname),
          },
        ]),
      ]
    }

    return [
      ...baseCrumbs,
      {
        label: () => getPageTitle(pathname),
      },
    ]
  }

  return (
    <div>
      <Breadcrumb
        request={getBreadcrumbRequest()}
        crumbs={getBreadcrumbCrumbs()}
      />
      <Menu
        items={menuItems}
        onSelect={handleOnSelect}
        selectedKeys={getActiveMenuKey(pathname)}
        mode="horizontal"
      />
      <ClientContext.Provider value={{ client }}>
        <Outlet />
      </ClientContext.Provider>
    </div>
  )
}

export default connecter(Client)
