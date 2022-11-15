import { Menu } from 'antd'
import React from 'react'
import routeUtils from 'utils/route'
import { useHistory, useLocation } from 'react-router-dom'
import RouteList from 'components/RouteList'
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

  return (
    <div className="p4">
      <Menu
        onSelect={onSelect}
        selectedKeys={activeMenu ? [activeMenu] : undefined}
        mode="horizontal"
      >
        <Menu.Item key="/my_tasks">
          {I18n.t('report_approvals.tabs.my_tasks')}
        </Menu.Item>
        <Menu.Item key="/approved">
          {I18n.t('report_approvals.tabs.approved')}
        </Menu.Item>
        <Menu.Item key="/all">
          {I18n.t('report_approvals.tabs.all')}
        </Menu.Item>
      </Menu>
      <div>
        <RouteList
          routes={routes}
          urlPrefix={`${settings.urlPrefix}`}
        />
      </div>
    </div>
  )
}
