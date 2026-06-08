import React from 'react'
import { Tabs } from 'antd'
import { connect } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { Siem } from './Siem'
import { AdminRoles } from './AdminRoles'
import { SkillAliases } from './SkillAliases'
import { Privacy as PrivacySettings } from './Privacy'
import { Features } from './Features'
import { Sso as SsoSettings } from './Sso'
import { Smtp } from './routes/Smtp'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { User } from '~/modules/admin/modules/client/core/users'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {},
)

export const SettingsComponent: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const tabItems = [
    { label: I18n.t('admin.settings_tabs_admin_roles'), key: 'roles', children: <AdminRoles /> },
    ...(
      isSuperAdmin(currentUser)
        ? [
          { label: I18n.t('admin.smtp_settings_smtp'), key: 'smtp', children: <Smtp /> },
          {
            label: I18n.t('admin.sso_settings_tab'),
            key: 'sso_settings',
            children: <SsoSettings />,
          },
        ]
        : []
    ),
    { label: I18n.t('admin.settings_tabs_siem'), key: 'siem', children: <Siem /> },
    { label: I18n.t('admin.settings_tabs_skill_aliases'), key: 'skill_aliases', children: <SkillAliases /> },
    ...(
      isSuperAdmin(currentUser)
        ? [
          {
            label: I18n.t('admin.project_tabs_privacy'),
            key: 'privacy_settings',
            children: <PrivacySettings />,
          },
          {
            label: I18n.t('admin.settings_tabs_feature_flags'),
            key: 'features',
            children: <Features />,
          },
        ]
        : []
    ),
  ]

  return (
    <Tabs items={tabItems} tabBarStyle={{ padding: '0 20px' }} destroyOnHidden />
  )
}

export const Settings = connecter(SettingsComponent)
