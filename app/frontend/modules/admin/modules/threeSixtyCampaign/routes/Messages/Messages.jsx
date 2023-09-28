import { Menu } from 'antd'
import { connect } from 'react-redux'
import RouteList from '~/components/RouteList'
import { get as getCurrentUser } from '~/core/currentUser'
import PipedTextModal from '~/components/Editor/PipedTextModal'
import routeUtils from '~/utils/route'
import settings from '../../settings'
import { PageHeader } from '../../PageHeader'

function Messages ({ history, routes, currentUser }) {
  const onSelect = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)
  const menuItems = [
    currentUser.permissions.accessEmailMessages && {
      key: '/messages/email',
      label: I18n.t('administration.threesixty_campaigns.messages.email_messages'),
    },
    currentUser.permissions.accessInstructionMessages && {
      key: '/messages/instructions',
      label: I18n.t('administration.threesixty_campaigns.messages.instruction_messages'),
    },
    currentUser.permissions.accessEmailMessages && {
      key: '/messages/mail_histories',
      label: I18n.t('administration.threesixty_campaigns.messages.mail_history'),
    },
    currentUser.permissions.accessMessagesOptions && {
      key: '/messages/options',
      label: I18n.t('administration.threesixty_campaigns.messages.options'),
    },
  ]

  return (
    <>
      <PageHeader />
      <div>
        <Menu
          items={menuItems}
          onSelect={onSelect}
          selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
          mode="horizontal"
        />
        <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
        <PipedTextModal />
      </div>
    </>
  )
}

export default connect(state => ({
  currentUser: getCurrentUser(state),
}), {})(Messages)
