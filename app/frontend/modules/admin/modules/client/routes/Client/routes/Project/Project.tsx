import { FC, useEffect, useState } from 'react'
import {
  useParams, useNavigate, useLocation, Outlet,
} from 'react-router-dom'
import { Flex, Menu, Spin } from 'antd'
import some from 'lodash/some'
import { connect, ConnectedProps } from 'react-redux'
import {
  AccountTree,
  AdminPanelSettings,
  Campaign,
  Explore,
  Key,
  ReceiptLong,
  Settings,
  Storage,
} from '@thetalententerprise/glint/icons'
import { MenuItem } from '~/interfaces/Antd'
import { getFeatures } from '~/core/config'
import { camelizeKeys } from '~/utils/object'
import {
  fetchSingle as fetchProject,
} from '~/modules/admin/modules/client/core/projects'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isSuperAdmin } from '~/core/currentUser'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
    features: getFeatures(state),
    projectIdpEnabled: state.config.project.idpEnabled,
  }),
  {
    fetchProject,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const Project: FC<Props> = ({
  currentUser, fetchProject, features, projectIdpEnabled,
}) => {
  const { projectId } = useParams() as { projectId: string }
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isProjectLoaded, setIsProjectLoaded] = useState(false)
  const {
    idpEnabled,
    skillRaterEnabled,
  } = camelizeKeys(features)

  const parsedProjectId = parseInt(projectId, 10)

  useEffect(() => {
    fetchProject(parseInt(projectId, 10))
      .then(() => {
        setIsProjectLoaded(true)
      })
  }, [])

  const handleOnSelect = ({ key }) => {
    navigate(`${settings.urlPrefix}/${parsedProjectId}/${key}`)
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    // includes only primary level tabs and not secondary tabs
    if (pathname.includes('/new_campaigns')) {
      return ['new_campaigns']
    }
    if (pathname.includes('/users')) {
      return ['users']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/datasheet')) {
      return ['datasheet']
    }
    if (pathname.includes('/settings/')) {
      return ['settings']
    }
    if (pathname.includes('/audit_reports')) {
      return ['audit_reports']
    }
    if (pathname.includes('/idp')) {
      return ['idp']
    }
    if (pathname.includes('/taxonomy')) {
      return ['taxonomy']
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
      case 'new_campaigns':
        return I18n.t('admin.campaigns')
      case 'admins':
        return I18n.t('admin.admins')
      case 'users': {
        if (pathname.includes('participants')) {
          return I18n.t('admin.participants')
        }
        if (pathname.includes('assessors')) {
          return I18n.t('admin.assessors')
        }
        return I18n.t('admin.users')
      }
      case 'datasheet':
        return I18n.t('shared.datasheet')
      case 'settings': {
        if (pathname.includes('/general')) return I18n.t('admin.project_tabs_general')
        if (pathname.includes('/smtp')) return I18n.t('admin.smtp_settings_smtp')
        if (pathname.includes('/saml')) return I18n.t('admin.sso_settings_tab')
        if (pathname.includes('/integrations')) return I18n.t('admin.integrations_integrations')
        if (pathname.includes('/security')) return I18n.t('admin.security_setting_security')
        if (pathname.includes('/design')) return I18n.t('admin.project_tabs_design')
        if (pathname.includes('/profile')) return I18n.t('admin.project_tabs_profile')
        if (pathname.includes('/registration')) return I18n.t('admin.project_tabs_registration')
        if (pathname.includes('/webhooks')) return I18n.t('admin.project_tabs_webhooks_title')
        if (pathname.includes('/privacy')) return I18n.t('admin.project_tabs_privacy')
        if (pathname.includes('/assessments')) return I18n.t('admin.project_tabs_assessments_title')
        if (pathname.includes('/features')) return I18n.t('admin.settings_tabs_feature_flags')
        if (pathname.includes('/applications')) return I18n.t('admin.applications')
        return I18n.t('admin.settings')
      }
      case 'audit_reports':
        return I18n.t('admin.audit_reports')
      case 'idp':
        return I18n.t('admin.idp_idp')
      case 'taxonomy':
        return I18n.t('admin.taxonomy_title')
      case 'licenses':
        return I18n.t('admin.project_licenses')
      default:
        return ''
    }
  }

  const canShowSettingsTab = () => {
    const permissions = [
      'manageProjectSmtpSettings', 'manageProjectSamlSetting', 'manageProjectIntegrations', 'manageProjectWebhooks',
      'manageProjectSecuritySettings', 'manageProjectGeneralSettings',
    ]
    return some(permissions, permission => currentUser.permissions[permission])
  }

  const canShowIdpTab = () => {
    if (!projectIdpEnabled) return false
    if (isSuperAdmin(currentUser)) return true

    const permissions = [
      'accessProjectDevelopmentActions', 'accessIdpTemplates', 'accessReflectionQuestions',
      'accessInterviewQuestions', 'manageIdpProjectSettings',
    ]
    return some(permissions, permission => currentUser.permissions[permission])
  }

  const menuItems: MenuItem[] = [
    {
      key: 'new_campaigns',
      icon: <Campaign />,
      label: I18n.t('admin.campaigns'),
    },
  ]
  currentUser.permissions.viewDatasheets && menuItems.push({
    key: 'datasheet',
    icon: <Storage />,
    label: I18n.t('shared.datasheet'),
  })
  currentUser.permissions.manageProjectAdmins && menuItems.push({
    key: 'admins',
    icon: <AdminPanelSettings />,
    label: I18n.t('admin.project_admins'),
  })
  canShowSettingsTab() && menuItems.push({
    key: 'settings',
    icon: <Settings />,
    label: I18n.t('admin.settings'),
  })
  currentUser.permissions.viewAuditReports && menuItems.push({
    key: 'audit_reports',
    icon: <ReceiptLong />,
    label: I18n.t('admin.audit_reports'),
  })

  idpEnabled && canShowIdpTab() && menuItems.push({
    key: 'idp',
    icon: <Explore />,
    label: I18n.t('admin.idp_idp'),
  })

  if ((idpEnabled || skillRaterEnabled) && currentUser.permissions.accessProjectTaxonomy) {
    menuItems.push(
      {
        key: 'taxonomy',
        icon: <AccountTree />,
        label: I18n.t('admin.taxonomy_title'),
      },
    )
  }

  if (currentUser.permissions.viewProjectLicenses) {
    menuItems.push({
      key: 'licenses',
      icon: <Key />,
      label: I18n.t('admin.licenses'),
    })
  }

  const getBreadcrumbRequest = () => ({
    fields: ['project', 'client'],
    data: { projectId: parseInt(projectId, 10) },
  })

  const getProjectBreadcrumbCrumbs = () => {
    const baseCrumbs = [
      {
        link: () => '/admin',
        label: () => I18n.t('admin.clients'),
      },
      {
        link: state => `/admin/clients/${state.client.id}/projects`,
        label: state => state.client.name,
      },
      {
        link: state => `/admin/projects/${state.project?.id}/new_campaigns?filters[statusEq]=active`,
        label: state => state.project?.name,
      },
    ]

    if (pathname.includes('/settings/')) {
      const settingsUrl = `${settings.urlPrefix}/${projectId}/settings`
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
        crumbs={getProjectBreadcrumbCrumbs()}
      />
      {menuItems.length > 1 && (
        <Menu
          items={menuItems}
          onSelect={handleOnSelect}
          selectedKeys={getActiveMenuKey(pathname)}
          mode="horizontal"
        />
      )}
      {isProjectLoaded ? <Outlet /> : <Flex justify="center" align="middle"><Spin /></Flex>}
    </div>
  )
}

export default connecter(Project)
