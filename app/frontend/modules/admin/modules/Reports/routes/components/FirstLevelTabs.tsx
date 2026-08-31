import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import { useSelector } from 'react-redux'
import { Description, FolderOpen } from '@thetalententerprise/glint/icons'
import { MenuItem } from '~/interfaces/Antd'
import { isSuperAdmin, get as getCurrentUser } from '~/core/currentUser'
import settings from '../../settings'

const { I18n } = window

export const FirstLevelTabs: React.FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const handleOnSelect = ({ key }) => {
    navigate(`${settings.urlPrefix}/${key}`)
  }

  const currentUser = useSelector(getCurrentUser)

  const menuItems: MenuItem[] = [
    { key: 'reports', icon: <Description />, label: I18n.t('reports.reports') },
  ]

  currentUser && isSuperAdmin(currentUser) && menuItems.push(
    { key: 'report_families', icon: <FolderOpen />, label: I18n.t('report_bundles.report_bundles') },
  )

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/report_families')) {
      return ['report_families']
    }
    if (pathname.includes('/reports')) {
      return ['reports']
    }
    return undefined
  }

  if (menuItems.length < 2) return null

  return (
    <Menu
      items={menuItems}
      onSelect={handleOnSelect}
      selectedKeys={getActiveMenuKey(pathname)}
      mode="horizontal"
    />
  )
}
