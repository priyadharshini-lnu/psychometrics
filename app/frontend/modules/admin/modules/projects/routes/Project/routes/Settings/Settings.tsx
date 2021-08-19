import React from 'react'
import { Menu } from 'antd'
import RouteList from 'components/RouteList'
import settings from 'modules/admin/modules/projects/settings'
import routeUtils from 'utils/route'
import { routes } from './routes'

const { I18n } = window

export const Settings = ({ history }) => {
  const prefix = `${settings.urlPrefix}/:projectId/settings`

  const onSelect = ({ key }) => {
    routeUtils.moveTo(history, prefix, key)
  }


  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        <Menu.Item key="/smtp">{I18n.t('administration.smtp_settings.smtp')}</Menu.Item>
      </Menu>
      <RouteList routes={routes} urlPrefix={prefix} />
    </div>
  )
}
