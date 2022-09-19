import React from 'react'
import { Menu } from 'antd'
import routeUtils from 'utils/route'
import RouteList from 'components/RouteList'
import { get as getCurrentUser } from 'core/currentUser'
import { connect } from 'react-redux'
import PipedTextModal from 'components/Editor/PipedTextModal'
import settings from '../../settings'

function Messages ({ history, routes, currentUser }) {
  const onSelect = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        {currentUser.permissions.accessEmailMessages && (
          <Menu.Item key="/messages/email">
            {I18n.t('administration.threesixty_campaigns.messages.email_messages')}
          </Menu.Item>
        )}
        {currentUser.permissions.accessInstructionMessages && (
          <Menu.Item key="/messages/instructions">
            {I18n.t('administration.threesixty_campaigns.messages.instruction_messages')}
          </Menu.Item>
        )}
        {currentUser.permissions.accessEmailMessages && (
          <Menu.Item key="/messages/mail_histories">
            {I18n.t('administration.threesixty_campaigns.messages.mail_history')}
          </Menu.Item>
        )}
        {currentUser.permissions.accessMessagesOptions && (
          <Menu.Item key="/messages/options">
            {I18n.t('administration.threesixty_campaigns.messages.options')}
          </Menu.Item>
        )}
      </Menu>
      <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
      <PipedTextModal />
    </div>
  )
}

export default connect(state => ({
  currentUser: getCurrentUser(state),
}), {})(Messages)
