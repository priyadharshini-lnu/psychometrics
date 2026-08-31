import React from 'react'
import { Menu } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Insights, Settings } from '@thetalententerprise/glint/icons'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'

const { I18n } = window

export const AIArtifacts: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prefix = `${settings.urlPrefix}/:campaignId/ai_artifacts`
  const onSelect = ({ key }) => routeUtils.moveTo(navigate, prefix, key)

  const menuItems = [
    {
      key: '/results',
      icon: <Insights />,
      label: I18n.t('admin.tabs_results'),
    },
    {
      key: '/settings',
      icon: <Settings />,
      label: I18n.t('admin.tabs_settings'),
    }]

  const activeTab = menuItems.find(({ key }) => pathname.includes(key))

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={activeTab ? [activeTab.key] : []}
        mode="horizontal"
      />
      <Outlet />
    </div>
  )
}
