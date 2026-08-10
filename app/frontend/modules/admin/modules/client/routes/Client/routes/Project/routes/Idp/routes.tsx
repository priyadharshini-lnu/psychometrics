import { ComponentType, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'
import User from '~/modules/admin/modules/campaigns/interfaces/User'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('client', () => import('~/modules/admin/modules/client/pages'))
const developmentActionsPage = lazyPages(
  'developmentActions',
  () => import('~/modules/admin/modules/DevelopmentActions/components/DevelopmentActionList'),
)

type Pages = typeof import('~/modules/admin/modules/client/pages')

type IdpTab = {
  key: string,
  labelKey: string,
  permission: keyof User['permissions'],
}

// Menu order; the tab bar and the index redirect both read this.
const TABS: IdpTab[] = [
  { key: 'templates', labelKey: 'admin.idp_tab_templates', permission: 'accessIdpTemplates' },
  { key: 'settings', labelKey: 'admin.idp_tab_settings', permission: 'manageIdpProjectSettings' },
  {
    key: 'development_actions',
    labelKey: 'admin.idp_tab_development_actions',
    permission: 'accessProjectDevelopmentActions',
  },
  {
    key: 'reflection_questions',
    labelKey: 'admin.idp_tab_reflection_questions',
    permission: 'accessReflectionQuestions',
  },
  {
    key: 'interview_questions',
    labelKey: 'admin.idp_tab_interview_questions',
    permission: 'accessInterviewQuestions',
  },
]

export const permittedIdpTabs = (currentUser: User): IdpTab[] => (
  TABS.filter(({ permission }) => currentUser.permissions[permission])
)

const IdpIndex = () => {
  const currentUser = useSelector((state: RootState) => getCurrentUser(state))
  const [firstTab] = permittedIdpTabs(currentUser)

  return firstTab ? <Navigate to={firstTab.key} replace /> : null
}

const Permitted = ({ permission, children }: { permission: IdpTab['permission'], children: ReactNode }) => {
  const currentUser = useSelector((state: RootState) => getCurrentUser(state))

  return currentUser.permissions[permission] ? <>{children}</> : null
}

const permittedPage = (permission: IdpTab['permission'], pick: (module: Pages) => ComponentType) => (
  page((module) => {
    const Page = pick(module)

    return () => <Permitted permission={permission}><Page /></Permitted>
  })
)

const IdpList = permittedPage('accessIdpTemplates', m => m.IdpList)
const IdpDetails = permittedPage('accessIdpTemplates', m => m.IdpDetails)
const IdpSettings = permittedPage('manageIdpProjectSettings', m => m.IdpSettings)
const ReflectionQuestions = permittedPage('accessReflectionQuestions', m => m.ReflectionQuestions)
const InterviewQuestions = permittedPage('accessInterviewQuestions', m => m.InterviewQuestions)

const DevelopmentActions = developmentActionsPage(({ default: DevelopmentActionList }) => () => (
  <Permitted permission="accessProjectDevelopmentActions"><DevelopmentActionList /></Permitted>
))

export const routes = [
  { index: true, element: <IdpIndex /> },
  { path: 'templates', element: <IdpList /> },
  { path: 'templates/:id', element: <IdpDetails /> },
  { path: 'settings', element: <IdpSettings /> },
  { path: 'development_actions', element: <DevelopmentActions /> },
  { path: 'reflection_questions', element: <ReflectionQuestions /> },
  { path: 'interview_questions', element: <InterviewQuestions /> },
]
