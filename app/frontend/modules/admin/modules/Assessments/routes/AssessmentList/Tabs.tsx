import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  HourglassTop,
  Archive,
  Delete,
} from '@thetalententerprise/glint/icons'
import { MenuItem } from '~/interfaces/Antd'
import settings from '../../settings'

const { I18n } = window

export const Tabs: React.FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const handleOnSelect = ({ key }) => {
    navigate(`${settings.urlPrefix}/${key}`)
  }

  const menuItems: MenuItem[] = [
    { key: 'active', icon: <HourglassTop />, label: I18n.t('assessments.active') },
    { key: 'archived', icon: <Archive />, label: I18n.t('assessments.archived') },
    { key: 'trash', icon: <Delete />, label: I18n.t('assessments.trash') },
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
