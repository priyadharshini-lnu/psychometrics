import { Menu } from 'antd'
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Badge, Handyman, Lightbulb, Star,
} from '@thetalententerprise/glint/icons'
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
    '/skills', '/job_roles', '/proficiency', '/tools',
  ].find(val => pathnameWithoutBasePath.includes(val))
  const menuItems = [
    {
      key: '/skills',
      icon: <Lightbulb />,
      label: I18n.t('admin.skills'),
    },
    ...(skillRaterEnabled ? [
      {
        key: '/job_roles',
        icon: <Badge />,
        label: I18n.t('admin.job_roles'),
      },
      {
        key: '/proficiency',
        icon: <Star />,
        label: I18n.t('admin.proficiency'),
      },
      {
        key: '/tools',
        icon: <Handyman />,
        label: I18n.t('admin.tools'),
      },
    ] : []),
  ]

  if (menuItems.length < 2) return null

  return (
    <Menu
      items={menuItems}
      onSelect={onSelect}
      selectedKeys={activeMenu ? [activeMenu] : undefined}
      mode="horizontal"
    />
  )
}
