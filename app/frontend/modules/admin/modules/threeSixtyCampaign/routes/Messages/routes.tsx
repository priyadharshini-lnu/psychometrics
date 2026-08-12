import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getCurrentCampaign,
} from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('~/modules/admin/modules/threeSixtyCampaign/pages')

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
  { path: 'options', lazy: lazyRoute(page, m => m.MessagesOptions) },
  { path: 'email', lazy: lazyRoute(page, m => m.EmailList) },
  { path: 'email/:id', lazy: lazyRoute(page, m => m.EmailList) },
  { path: 'instructions', lazy: lazyRoute(page, m => m.InstructionList) },
  { path: 'instructions/:id', lazy: lazyRoute(page, m => m.InstructionList) },
  { path: 'mail_histories', lazy: lazyRoute(page, m => m.MailHistories) },
]
