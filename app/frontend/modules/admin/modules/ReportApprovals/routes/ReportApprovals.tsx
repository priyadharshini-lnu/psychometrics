import { Menu } from 'antd'
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import routeUtils from '~/utils/route'
import RouteList from '~/components/RouteList'
import { settings } from '../settings'

const { I18n } = window

interface OwnProps {
  routes: Array<{ path: string, components: JSX.Element }>,
}

export const ReportApprovals: React.FC<OwnProps> = ({ routes }) => {
  const history = useHistory()
  const { pathname } = useLocation()

  const onSelect = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)
  const activeMenu = ['/my_tasks', '/approved', '/all'].find(val => pathname.includes(val))
  const menuItems = [
    { key: '/my_tasks', label: I18n.t('report_approvals.tabs.my_tasks') },
    { key: '/approved', label: I18n.t('report_approvals.tabs.approved') },
    { key: '/all', label: I18n.t('report_approvals.tabs.all') },
  ]

  return (
    <div className="p4">
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={activeMenu ? [activeMenu] : undefined}
        mode="horizontal"
      />
      <div>
        <RouteList
          routes={routes}
          urlPrefix={`${settings.urlPrefix}`}
        />
      </div>
    </div>
  )
}
