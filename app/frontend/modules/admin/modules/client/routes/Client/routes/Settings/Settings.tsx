import React from 'react'
import { Tabs } from 'antd'
import { Siem } from './Siem'
import { AdminRoles } from './AdminRoles'
import { SkillAliases } from './SkillAliases'

const { I18n } = window
const tabItems = [
  { label: I18n.t('administration.settings.tabs.admin_roles'), key: 'roles', children: <AdminRoles /> },
  { label: I18n.t('administration.settings.tabs.siem'), key: 'siem', children: <Siem /> },
  { label: I18n.t('administration.settings.tabs.skill_aliases'), key: 'skill_aliases', children: <SkillAliases /> },
]

export const Settings: React.FC = () => (
  <Tabs items={tabItems} tabBarStyle={{ padding: '0 20px' }} destroyInactiveTabPane />
)
