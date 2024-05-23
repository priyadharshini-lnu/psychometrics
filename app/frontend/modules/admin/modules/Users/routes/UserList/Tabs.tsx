import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  ShopOutlined,
} from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import settings from '../../settings'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }), {},
)

type Props = ConnectedProps<typeof connecter>
const TabsComponent: React.FC<Props> = ({ currentUser }) => {
  const { pathname } = useLocation()
  const history = useHistory()
  const handleOnSelect = ({ key }) => {
    history.push(`${settings.urlPrefix}/${key}`)
  }

  const menuItems: ItemType[] = [
    { key: 'users', icon: <ShopOutlined />, label: I18n.t('users.users') },
  ]

  isSuperAdmin(currentUser) && (
    menuItems.push(
      { key: 'admins', icon: <ShopOutlined />, label: I18n.t('users.admins') },
      { key: 'superadmins', icon: <ShopOutlined />, label: I18n.t('users.superadmins') },
      { key: 'global-assessors', icon: <ShopOutlined />, label: I18n.t('users.global_assessors') },
    )
  )

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/superadmins')) {
      return ['superadmins']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/global-assessors')) {
      return ['global-assessors']
    }
    if (pathname.includes('/users')) {
      return ['users']
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

export const Tabs = connecter(TabsComponent)
