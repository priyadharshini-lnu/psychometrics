import React from 'react'
import { Menu } from 'antd'
import routeUtils from 'utils/routeUtils'
import RouteList from 'components/RouteList'
import settings from '../../settings'

export default function Reports ({ history, routes }) {
  const onSelect = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        <Menu.Item key="/reports">Edit Subject Report</Menu.Item>
        <Menu.Item key="/reports/options">Report Options</Menu.Item>
        <Menu.Item key="/reports/my_reports">My Reports</Menu.Item>
      </Menu>
      <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
    </div>
  )
}
