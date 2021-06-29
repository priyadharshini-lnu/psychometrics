import React from 'react'
import { Menu } from 'antd'
import routeUtils from 'utils/route'
import RouteList from 'components/RouteList'
import { get as getCurrentUser } from 'core/currentUser'
import { connect } from 'react-redux'
import settings from '../../settings'

function Participants ({ history, routes, currentUser }) {
  const onSelect = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        <Menu.Item key="/participants">Participants</Menu.Item>
        {currentUser.permissions.manageOptions && (
          <Menu.Item key="/participants/options">Options</Menu.Item>
        )}
      </Menu>
      <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
    </div>
  )
}

export default connect(state => ({
  currentUser: getCurrentUser(state),
}), {})(Participants)
