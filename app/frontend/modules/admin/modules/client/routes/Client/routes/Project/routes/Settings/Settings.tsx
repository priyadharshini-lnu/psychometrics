import { FC, ReactNode } from 'react'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AccountBox, Apps, Assignment, Extension, Flag, HowToReg,
  Lock, Login, Palette, Send, Settings as SettingsIcon, VisibilityOff, Webhook,
} from '@thetalententerprise/glint/icons'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import routeUtils from '~/utils/route'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isSuperAdmin } from '~/core/currentUser'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const SettingsComponent: FC<Props> = ({ currentUser }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prefix = `${settings.urlPrefix}/:projectId/settings`
  const { permissions } = currentUser

  const onSelect = ({ key }) => {
    routeUtils.moveTo(navigate, prefix, key)
  }
  const menuItems: { key: string, icon: ReactNode, label: string }[] = []

  permissions.manageProjectGeneralSettings && menuItems.push({
    key: '/general',
    icon: <SettingsIcon />,
    label: I18n.t('admin.project_tabs_general'),
  })
  isSuperAdmin(currentUser) && menuItems.push({
    key: '/applications',
    icon: <Apps />,
    label: I18n.t('admin.applications'),
  })
  permissions.manageProjectSmtpSettings && menuItems.push({
    key: '/smtp',
    icon: <Send />,
    label: I18n.t('admin.smtp_settings_smtp'),
  })
  permissions.manageProjectSamlSetting && menuItems.push({
    key: '/saml',
    icon: <Login />,
    label: I18n.t('admin.sso_settings_tab'),
  })
  permissions.manageProjectIntegrations && menuItems.push({
    key: '/integrations',
    icon: <Extension />,
    label: I18n.t('admin.integrations_integrations'),
  })
  permissions.manageProjectSecuritySettings && menuItems.push({
    key: '/security',
    icon: <Lock />,
    label: I18n.t('admin.security_setting_security'),
  })
  permissions.manageDesignSettings && menuItems.push({
    key: '/design',
    icon: <Palette />,
    label: I18n.t('admin.project_tabs_design'),
  })
  permissions.manageProfileSettings && menuItems.push({
    key: '/profile',
    icon: <AccountBox />,
    label: I18n.t('admin.project_tabs_profile'),
  })
  permissions.manageProfileSettings && menuItems.push({
    key: '/registration',
    icon: <HowToReg />,
    label: I18n.t('admin.project_tabs_registration'),
  })
  permissions.manageProjectWebhooks && menuItems.push({
    key: '/webhooks',
    icon: <Webhook />,
    label: I18n.t('admin.project_tabs_webhooks_title'),
  })
  permissions.manageProjectPrivacySetting && menuItems.push({
    key: '/privacy',
    icon: <VisibilityOff />,
    label: I18n.t('admin.project_tabs_privacy'),
  })
  permissions.manageProjectAssessments && menuItems.push({
    key: '/assessments',
    icon: <Assignment />,
    label: I18n.t('admin.project_tabs_assessments_title'),
  })
  permissions.manageProjectFeatureFlags && menuItems.push({
    key: '/features',
    icon: <Flag />,
    label: I18n.t('admin.settings_tabs_feature_flags'),
  })

  const activeTab = menuItems.find(({ key }) => pathname.includes(key))

  return (
    <div>
      {menuItems.length > 1 && (
        <Menu
          items={menuItems}
          onSelect={onSelect}
          selectedKeys={activeTab ? [activeTab.key] : []}
          mode="horizontal"
        />
      )}
      <Outlet />
    </div>
  )
}

export const Settings = connecter(SettingsComponent)
