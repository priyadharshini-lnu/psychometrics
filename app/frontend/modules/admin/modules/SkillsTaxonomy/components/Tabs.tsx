import { Menu } from 'antd'
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import routeUtils from '~/utils/route'
import { settings } from '../settings'

const { I18n } = window

export const Tabs: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const onSelect = ({ key }) => routeUtils.moveTo(navigate, settings.urlPrefix, key)
  const pathnameWithoutBasePath = pathname.replace(settings.urlPrefix, '')
  const activeMenu = ['/skills', '/jobs'].find(val => pathnameWithoutBasePath.includes(val))
  const menuItems = [
    { key: '/skills', label: I18n.t('administration.skills_taxonomy.tabs.skills') },
    { key: '/proficiency', label: I18n.t('administration.skills_taxonomy.tabs.proficiency') },
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
