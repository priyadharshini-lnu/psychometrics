import React from 'react'
import { Menu } from 'antd'

import routeUtils from 'utils/route'
import RouteList from 'components/RouteList'

import settings from '../../settings'

export default function Reports ({
  history, routes,
}) {
  const onSelect = ({ key }) => {
    routeUtils.moveTo(history, settings.urlPrefix, key)
  }

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        <Menu.Item key="/reports/options">
          {I18n.t('administration.threesixty_campaigns.menu.report.menu.report_options.title')}
        </Menu.Item>
      </Menu>
      <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
    </div>
  )
}
