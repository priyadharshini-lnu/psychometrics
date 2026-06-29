import React from 'react'
import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'
import { MenuItem } from '~/interfaces/Antd'
import RouteList from '~/components/RouteList'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'
import { Result } from './Results'
import Settings from './Settings'

const { I18n } = window

const routes = [
  { redirect: true, from: '', to: 'results' },
  { path: '/results', component: <Result /> },
  { path: '/settings', component: <Settings /> },
]

export const AIArtifacts: React.FC = () => {
  const navigate = useNavigate()
  const prefix = `${settings.urlPrefix}/:campaignId/ai_artifacts`
  const onSelect = ({ key }) => routeUtils.moveTo(navigate, prefix, key)

  const menuItems: MenuItem[] = [
    {
      key: '/results',
      label: I18n.t('admin.tabs_results'),
    },
    {
      key: '/settings',
      label: I18n.t('admin.tabs_settings'),
    }]
  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
      />
      <RouteList
        routes={routes}
        urlPrefix=""
      />
    </div>
  )
}
