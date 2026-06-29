import { useMemo } from 'react'
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
  { path: '/options', component: <Options /> },
  { path: '/email', component: <EmailList /> },
  { path: '/email/:id', component: <EmailList /> },
  { path: '/instructions', component: <InstructionList /> },
  { path: '/instructions/:id', component: <InstructionList /> },
  { path: '/mail_histories', component: <MailHistories /> },
]
function Messages ({ campaignPermissions }) {
  const navigate = useNavigate()
  const menuItems = useMemo(() => [
    campaignPermissions.accessEmailMessages && {
      id: 'email',
      key: '/messages/email',
      label: I18n.t('admin.email_messages'),
    },
    campaignPermissions.accessInstructionMessages && {
      id: 'instructions',
      key: '/messages/instructions',
      label: I18n.t('admin.instruction_messages'),
    },
    campaignPermissions.accessEmailMessages && {
      id: 'mail_histories',
      key: '/messages/mail_histories',
      label: I18n.t('admin.mail_history'),
    },
    campaignPermissions.accessMessagesOptions && {
      id: 'options',
      key: '/messages/options',
      label: I18n.t('admin.options'),
    },
  ].filter(Boolean), [campaignPermissions])

  const defaultRoute = { redirect: true, from: '', to: menuItems[0]?.id || '' }
  const allRoutes = [defaultRoute, ...routes]

  const selected = `/messages${routeUtils.getActiveRoutePath(allRoutes)}`

  const onSelect = ({ key }) => {
    routeUtils.moveTo(navigate, settings.urlPrefix, key)
  }

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
        <RouteList routes={allRoutes} urlPrefix="" />
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
