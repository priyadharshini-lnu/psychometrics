import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  DeleteOutlined, CheckCircleOutlined, FolderOutlined,
} from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { history } from '~/modules/admin/store'
import settings from '../../../../settings'

const { I18n } = window

export const Tabs: React.FC = () => {
  const { pathname } = useLocation()
  const handleOnSelect = ({ key }) => {
    history.push(`${settings.urlPrefix}/reports/${key}`)
  }

  const menuItems: ItemType[] = [
    { key: 'active', icon: <CheckCircleOutlined />, label: I18n.t('reports.active') },
    { key: 'archived', icon: <FolderOutlined />, label: I18n.t('reports.archived') },
    { key: 'trash', icon: <DeleteOutlined />, label: I18n.t('reports.trash') },
  ]

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/active')) {
      return ['active']
    }
    if (pathname.includes('/archived')) {
      return ['archived']
    }
    if (pathname.includes('/trash')) {
      return ['trash']
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
