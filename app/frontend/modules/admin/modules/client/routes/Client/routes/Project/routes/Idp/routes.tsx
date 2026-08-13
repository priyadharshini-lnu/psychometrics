import { ComponentType, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'
import User from '~/modules/admin/modules/campaigns/interfaces/User'

const page = () => import('~/modules/admin/modules/client/pages')
const developmentActionsPage = () => (
  import('~/modules/admin/modules/DevelopmentActions/components/DevelopmentActionList')
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

const permittedPage = (permission: IdpTab['permission'], pick: (module: Pages) => ComponentType) => async () => {
  const Page = pick(await page())

  return { Component: () => <Permitted permission={permission}><Page /></Permitted> }
}

const developmentActions = async () => {
  const { default: DevelopmentActionList } = await developmentActionsPage()

  return {
    Component: () => (
      <Permitted permission="accessProjectDevelopmentActions"><DevelopmentActionList /></Permitted>
    ),
  }
}

export const routes = [
  { index: true, element: <IdpIndex /> },
  { path: 'templates', lazy: permittedPage('accessIdpTemplates', m => m.IdpList) },
  { path: 'templates/:id', lazy: permittedPage('accessIdpTemplates', m => m.IdpDetails) },
  { path: 'settings', lazy: permittedPage('manageIdpProjectSettings', m => m.IdpSettings) },
  { path: 'development_actions', lazy: developmentActions },
  { path: 'reflection_questions', lazy: permittedPage('accessReflectionQuestions', m => m.ReflectionQuestions) },
  { path: 'interview_questions', lazy: permittedPage('accessInterviewQuestions', m => m.InterviewQuestions) },
]
