import { Menu } from 'antd'
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FactCheck, List, PendingActions } from '@thetalententerprise/glint/icons'
import routeUtils from '~/utils/route'
import { settings } from '../settings'

const { I18n } = window

export const Tabs: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const onSelect = ({ key }) => routeUtils.moveTo(navigate, settings.urlPrefix, key)
  const activeMenu = ['/my_tasks', '/approved', '/all'].find(val => pathname.includes(val))
  const menuItems = [
    { key: '/my_tasks', icon: <PendingActions />, label: I18n.t('report_approvals.tabs.my_tasks') },
    { key: '/approved', icon: <FactCheck />, label: I18n.t('report_approvals.tabs.approved') },
    { key: '/all', icon: <List />, label: I18n.t('report_approvals.tabs.all') },
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
