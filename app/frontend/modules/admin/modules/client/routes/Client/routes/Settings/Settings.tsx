import React from 'react'
import { Tabs } from 'antd'
import { connect } from 'react-redux'
import {
  Navigate, useNavigate, useLocation, useParams, useRoutes,
} from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import { Siem } from './Siem'
import { AdminRoles } from './AdminRoles'
import { SkillAliases } from './SkillAliases'
import { Privacy as PrivacySettings } from './Privacy'
import { Features } from './Features'
import { Sso as SsoSettings } from './Sso'
import { Smtp } from './routes/Smtp'
import { Applications, ApplicationDetails } from './Applications'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { User } from '~/modules/admin/modules/client/core/users'
import settings from '~/modules/admin/modules/client/settings'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {},
)

export const SettingsComponent: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { clientId } = useParams() as { clientId: string }

  const settingsBase = `${settings.urlPrefix}/clients/${clientId}/settings`

  const superAdminRoutes = isSuperAdmin(currentUser)
    ? [
      { path: 'smtp', element: <Smtp /> },
      { path: 'sso_settings', element: <SsoSettings /> },
      { path: 'privacy_settings', element: <PrivacySettings /> },
      { path: 'features', element: <Features /> },
      { path: 'applications', element: <Applications /> },
      { path: 'applications/:applicationId/*', element: <ApplicationDetails /> },
    ]
    : []

  const routeContent = useRoutes([
    { index: true, element: <Navigate to={`${settingsBase}/roles`} replace /> },
    { path: 'roles', element: <AdminRoles /> },
    { path: 'siem', element: <Siem /> },
    { path: 'skill_aliases', element: <SkillAliases /> },
    ...superAdminRoutes,
  ])

  const getActiveKey = (): string => {
    if (pathname.includes('/applications')) return 'applications'
    if (pathname.includes('/smtp')) return 'smtp'
    if (pathname.includes('/sso_settings')) return 'sso_settings'
    if (pathname.includes('/siem')) return 'siem'
    if (pathname.includes('/skill_aliases')) return 'skill_aliases'
    if (pathname.includes('/privacy_settings')) return 'privacy_settings'
    if (pathname.includes('/features')) return 'features'
    return 'roles'
  }

  const handleTabChange = (key: string) => {
    navigate(`${settingsBase}/${key}`)
  }

  const tabItems = [
    { key: 'roles', label: I18n.t('admin.settings_tabs_admin_roles'), children: routeContent },
    ...(isSuperAdmin(currentUser)
      ? [
        { key: 'applications', label: I18n.t('admin.applications'), children: routeContent },
        { key: 'smtp', label: I18n.t('admin.smtp_settings_smtp'), children: routeContent },
        { key: 'sso_settings', label: I18n.t('admin.sso_settings_tab'), children: routeContent },
      ]
      : []
    ),
    { key: 'siem', label: I18n.t('admin.settings_tabs_siem'), children: routeContent },
    { key: 'skill_aliases', label: I18n.t('admin.settings_tabs_skill_aliases'), children: routeContent },
    ...(isSuperAdmin(currentUser)
      ? [
        { key: 'privacy_settings', label: I18n.t('admin.project_tabs_privacy'), children: routeContent },
        { key: 'features', label: I18n.t('admin.settings_tabs_feature_flags'), children: routeContent },
      ]
      : []
    ),
  ]

  return (
    <Tabs
      activeKey={getActiveKey()}
      items={tabItems}
      onChange={handleTabChange}
      tabBarStyle={{ padding: '0 20px' }}
      destroyOnHidden
    />
  )
}

export const Settings = connecter(SettingsComponent)
