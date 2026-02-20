import { Menu } from 'antd'
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import routeUtils from '~/utils/route'
import { settings } from '../../settings'

const { I18n } = window

export const Tabs: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const onSelect = ({ key }) => routeUtils.moveTo(navigate, settings.urlPrefix, key)
  const activeMenu = ['/maintenance'].find(val => pathname.includes(val))
  const menuItems = [
    { key: '/maintenance', label: I18n.t('admin.maintenance') },
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
