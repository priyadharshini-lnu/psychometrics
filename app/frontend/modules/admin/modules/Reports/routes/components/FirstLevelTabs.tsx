import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  FileOutlined, FolderOpenOutlined,
} from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { useSelector } from 'react-redux'
import { isSuperAdmin, get as getCurrentUser } from '~/core/currentUser'
import settings from '../../settings'

const { I18n } = window

export const FirstLevelTabs: React.FC = () => {
  const { pathname } = useLocation()
  const history = useHistory()
  const handleOnSelect = ({ key }) => {
    history.push(`${settings.urlPrefix}/${key}`)
  }

  const currentUser = useSelector(getCurrentUser)

  const menuItems: ItemType[] = [
    { key: 'reports', icon: <FileOutlined />, label: I18n.t('reports.reports') },
  ]

  currentUser && isSuperAdmin(currentUser) && menuItems.push(
    { key: 'report_families', icon: <FolderOpenOutlined />, label: I18n.t('report_bundles.report_bundles') },
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

  return (
    <Menu
      items={menuItems}
      onSelect={handleOnSelect}
      selectedKeys={getActiveMenuKey(pathname)}
      mode="horizontal"
    />
  )
}
