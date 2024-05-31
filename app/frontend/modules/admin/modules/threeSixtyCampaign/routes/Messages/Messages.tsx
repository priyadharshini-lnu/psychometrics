import { Menu } from 'antd'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import RouteList from '~/components/RouteList'
import { get as getCurrentUser } from '~/core/currentUser'
import PipedTextModal from '~/components/Editor/PipedTextModal'
import routeUtils from '~/utils/route'
import settings from '../../settings'
import { PageHeader } from '../../PageHeader'
import Options from './Options'
import EmailList from './EmailList'
import InstructionList from './InstructionList'
import MailHistories from './MailHistories'

const { I18n } = window

const routes = [
  { redirect: true, from: '', to: 'options' },
  { path: '/options', component: <Options /> },
  { path: '/email', component: <EmailList /> },
  { path: '/email/:id', component: <EmailList /> },
  { path: '/instructions', component: <InstructionList /> },
  { path: '/instructions/:id', component: <InstructionList /> },
  { path: '/mail_histories', component: <MailHistories /> },
]
function Messages ({ currentUser }) {
  const [selected, setSelected] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setSelected(`/messages${routeUtils.getActiveRoutePath(routes)}`)
  }, [])
  const onSelect = ({ key }) => {
    setSelected(key)
    routeUtils.moveTo(navigate, settings.urlPrefix, key)
  }
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
          selectedKeys={[selected]}
          mode="horizontal"
        />
        <RouteList routes={routes} urlPrefix="" />
        <PipedTextModal />
      </div>
    </>
  )
}

export default connect(state => ({
  currentUser: getCurrentUser(state),
}), {})(Messages)
