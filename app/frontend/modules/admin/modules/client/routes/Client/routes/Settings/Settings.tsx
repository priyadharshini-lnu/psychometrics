import React from 'react'
import { Menu } from 'antd'
import { connect } from 'react-redux'
import {
  Navigate, useNavigate, useLocation, useParams, useRoutes,
} from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import {
  AdminPanelSettings, Apps, Flag, Label, Login,
  Monitoring, Palette, Send, VisibilityOff,
} from '@thetalententerprise/glint/icons'
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
import { LoginPageDesign } from './LoginPageDesign'

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
      { path: 'login_page_design', element: <LoginPageDesign /> },
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
    if (pathname.includes('/login_page_design')) return 'login_page_design'
    if (pathname.includes('/siem')) return 'siem'
    if (pathname.includes('/skill_aliases')) return 'skill_aliases'
    if (pathname.includes('/privacy_settings')) return 'privacy_settings'
    if (pathname.includes('/features')) return 'features'
    return 'roles'
  }

  const onSelect = ({ key }) => {
    navigate(`${settingsBase}/${key}`)
  }

  const menuItems: { key: string, icon: React.ReactNode, label: string }[] = [
    {
      key: 'roles',
      icon: <AdminPanelSettings />,
      label: I18n.t('admin.settings_tabs_admin_roles'),
    },
    ...(isSuperAdmin(currentUser)
      ? [
        {
          key: 'applications',
          icon: <Apps />,
          label: I18n.t('admin.applications'),
        },
        {
          key: 'smtp',
          icon: <Send />,
          label: I18n.t('admin.smtp_settings_smtp'),
        },
        {
          key: 'sso_settings',
          icon: <Login />,
          label: I18n.t('admin.sso_settings_tab'),
        },
        {
          key: 'login_page_design',
          icon: <Palette />,
          label: I18n.t('admin.login_page_design_tab'),
        },
      ]
      : []
    ),
    {
      key: 'siem',
      icon: <Monitoring />,
      label: I18n.t('admin.settings_tabs_siem'),
    },
    {
      key: 'skill_aliases',
      icon: <Label />,
      label: I18n.t('admin.settings_tabs_skill_aliases'),
    },
    ...(isSuperAdmin(currentUser)
      ? [
        {
          key: 'privacy_settings',
          icon: <VisibilityOff />,
          label: I18n.t('admin.project_tabs_privacy'),
        },
        {
          key: 'features',
          icon: <Flag />,
          label: I18n.t('admin.settings_tabs_feature_flags'),
        },
      ]
      : []
    ),
  ]

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={[getActiveKey()]}
        mode="horizontal"
      />
      {routeContent}
    </div>
  )
}

export const Settings = connecter(SettingsComponent)
