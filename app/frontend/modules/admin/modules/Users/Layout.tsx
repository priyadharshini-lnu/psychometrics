import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  ShopOutlined,
} from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import RouteList from '~/components/RouteList'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { history } from '~/modules/admin/store'
import routes from './routes'
import settings from './settings'

const { I18n } = window

const Layout: React.FC = () => {
  const { pathname } = useLocation()
  const handleOnSelect = ({ key }) => {
    history.push(`${settings.urlPrefix}/${key}`)
  }

  const menuItems: ItemType[] = [
    { key: 'users', icon: <ShopOutlined />, label: I18n.t('users.users') },
    { key: 'admins', icon: <ShopOutlined />, label: I18n.t('users.admins') },
    { key: 'superadmins', icon: <ShopOutlined />, label: I18n.t('users.superadmins') },
  ]

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/superadmins')) {
      return ['superadmins']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/users')) {
      return ['users']
    }
    return undefined
  }

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/administration',
            label: () => I18n.t('users.dashboard'),
          },
          {
            label: () => I18n.t('users.users'),
          },
        ]}
      />
      <Menu
        items={menuItems}
        onSelect={handleOnSelect}
        selectedKeys={getActiveMenuKey(pathname)}
        mode="horizontal"
      />
      <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
    </>
  )
}

export default Layout
