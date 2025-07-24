import { Menu } from 'antd'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getCurrentCampaign,
} from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import RouteList from '~/components/RouteList'
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
function Messages ({ campaignPermissions }) {
  const navigate = useNavigate()
  const selected = `/messages${routeUtils.getActiveRoutePath(routes)}`

  const onSelect = ({ key }) => {
    routeUtils.moveTo(navigate, settings.urlPrefix, key)
  }
  const menuItems = [
    campaignPermissions.accessEmailMessages && {
      key: '/messages/email',
      label: I18n.t('administration.threesixty_campaigns.messages.email_messages'),
    },
    campaignPermissions.accessInstructionMessages && {
      key: '/messages/instructions',
      label: I18n.t('administration.threesixty_campaigns.messages.instruction_messages'),
    },
    campaignPermissions.accessEmailMessages && {
      key: '/messages/mail_histories',
      label: I18n.t('administration.threesixty_campaigns.messages.mail_history'),
    },
    campaignPermissions.accessMessagesOptions && {
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
const connector = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
  }),
)

export default connector(Messages)
