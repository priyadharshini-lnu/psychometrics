import React from 'react'
import { Menu } from 'antd'
import routeUtils from 'utils/route'
import RouteList from 'components/RouteList'
import settings from '../../../../settings'

export { default as Subjects } from './Subjects'
export { default as Assessors } from './Assessors'

export const Participants = ({ history, routes }) => {
  const prefix = `${settings.urlPrefix}/:campaignId`
  const onSelect = ({ key }) => routeUtils.moveTo(history, prefix, key)

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        <Menu.Item key="/participants/subjects">Subjects</Menu.Item>
        <Menu.Item key="/participants/assessors">Assessors</Menu.Item>
      </Menu>
      <RouteList routes={routes} urlPrefix={prefix} />
    </div>
  )
}
