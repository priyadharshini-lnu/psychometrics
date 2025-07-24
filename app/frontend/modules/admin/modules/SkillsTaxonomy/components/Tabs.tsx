import { Menu } from 'antd'
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import routeUtils from '~/utils/route'
import { settings } from '../settings'
import { camelizeKeys } from '~/utils/object'

const { I18n } = window

export const Tabs: React.FC<{ featureFlags?: Record<string, boolean> }> = ({ featureFlags }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const skillRaterEnabled = camelizeKeys(featureFlags ?? {})?.skillRaterEnabled

  const onSelect = ({ key }) => routeUtils.moveTo(navigate, settings.urlPrefix, key)
  const pathnameWithoutBasePath = pathname.replace(settings.urlPrefix, '')
  const activeMenu = [
    '/skills', '/job_roles', '/proficiency', '/settings',
  ].find(val => pathnameWithoutBasePath.includes(val))
  const menuItems = [
    {
      key: '/skills',
      label: I18n.t('administration.skills_taxonomy.tabs.skills'),
    },
    skillRaterEnabled ? {
      key: '/job_roles',
      label: I18n.t('administration.skills_taxonomy.tabs.job_roles'),
    } : null,
    skillRaterEnabled ? {
      key: '/proficiency',
      label: I18n.t('administration.skills_taxonomy.tabs.proficiency'),
    } : null,
    skillRaterEnabled ? {
      key: '/settings',
      label: I18n.t('administration.breadcrumbs.settings'),
    } : null,
  ]

  return (
    <Menu
      items={menuItems}
      onSelect={onSelect}
      selectedKeys={activeMenu ? [activeMenu] : undefined}
      mode="horizontal"
    />
  )
}
