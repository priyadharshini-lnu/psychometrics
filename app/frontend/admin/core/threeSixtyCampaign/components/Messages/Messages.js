import React from 'react'
import { Menu } from 'antd'
import routeUtils from 'utils/routeUtils'
import RouteList from 'components/RouteList'
import PipedTextModal from 'components/Editor/PipedTextModal'
import settings from '../../settings'

export default function Messages ({ history, routes }) {
  const onSelect = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        <Menu.Item key="/messages/email">Email Messages</Menu.Item>
        <Menu.Item key="/messages/instructions">Instruction Messages</Menu.Item>
        <Menu.Item key="/messages/options">Options</Menu.Item>
      </Menu>
      <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
      <PipedTextModal />
    </div>
  )
}
