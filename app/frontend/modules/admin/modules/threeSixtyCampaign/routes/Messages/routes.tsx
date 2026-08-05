import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getCurrentCampaign,
} from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('threeSixtyCampaign', () => import('~/modules/admin/modules/threeSixtyCampaign/pages'))

const MessagesOptions = page(m => m.MessagesOptions)
const EmailList = page(m => m.EmailList)
const InstructionList = page(m => m.InstructionList)
const MailHistories = page(m => m.MailHistories)

type MessagesTab = {
  id: string,
  labelKey: string,
  permission: string,
}

// Menu order; the tab bar and the index redirect both read this.
const TABS: MessagesTab[] = [
  { id: 'email', labelKey: 'admin.email_messages', permission: 'accessEmailMessages' },
  { id: 'instructions', labelKey: 'admin.instruction_messages', permission: 'accessInstructionMessages' },
  { id: 'mail_histories', labelKey: 'admin.mail_history', permission: 'accessEmailMessages' },
  { id: 'options', labelKey: 'admin.options', permission: 'accessMessagesOptions' },
]

export const permittedMessagesTabs = (permissions): MessagesTab[] => (
  TABS.filter(({ permission }) => permissions[permission])
)

const MessagesIndex = () => {
  const permissions = useSelector((state: RootState) => getCurrentCampaign(state).permissions)
  const [firstTab] = permittedMessagesTabs(permissions)

  return firstTab ? <Navigate to={firstTab.id} replace /> : null
}

export const routes = [
  { index: true, element: <MessagesIndex /> },
  { path: 'options', element: <MessagesOptions /> },
  { path: 'email', element: <EmailList /> },
  { path: 'email/:id', element: <EmailList /> },
  { path: 'instructions', element: <InstructionList /> },
  { path: 'instructions/:id', element: <InstructionList /> },
  { path: 'mail_histories', element: <MailHistories /> },
]
