import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('~/modules/admin/modules/client/pages')

const FIRST_TAB_BY_PERMISSION = [
  { permission: 'manageProjectGeneralSettings', tab: 'general' },
  { permission: 'manageProjectSmtpSettings', tab: 'smtp' },
  { permission: 'manageProjectSamlSetting', tab: 'saml' },
  { permission: 'manageProjectIntegrations', tab: 'integrations' },
  { permission: 'manageProjectSecuritySettings', tab: 'security' },
  { permission: 'manageProjectWebhooks', tab: 'webhooks' },
  { permission: 'manageProjectPrivacySetting', tab: 'privacy' },
]

const SettingsIndex = () => {
  const permissions = useSelector((state: RootState) => state.currentUser.permissions)
  const firstTab = FIRST_TAB_BY_PERMISSION.find(({ permission }) => permissions[permission])

  return firstTab ? <Navigate to={firstTab.tab} replace /> : null
}

export const routes = [
  { index: true, element: <SettingsIndex /> },
  { path: 'smtp', lazy: lazyRoute(page, m => m.Smtp) },
  { path: 'saml', lazy: lazyRoute(page, m => m.SamlTabbed) },
  { path: 'integrations', lazy: lazyRoute(page, m => m.Integrations) },
  {
    path: 'integrations/mettl_schedule_records',
    lazy: lazyRoute(page, m => m.MettlScheduleRecords),
  },
  { path: 'security', lazy: lazyRoute(page, m => m.SecuritySettings) },
  { path: 'general', lazy: lazyRoute(page, m => m.General) },
  { path: 'webhooks', lazy: lazyRoute(page, m => m.Webhooks) },
  { path: 'design', lazy: lazyRoute(page, m => m.Design) },
  { path: 'profile', lazy: lazyRoute(page, m => m.Profile) },
  { path: 'registration', lazy: lazyRoute(page, m => m.Registration) },
  { path: 'privacy', lazy: lazyRoute(page, m => m.Privacy) },
  { path: 'assessments', lazy: lazyRoute(page, m => m.Assessments) },
  { path: 'features', lazy: lazyRoute(page, m => m.Features) },
  { path: 'applications', lazy: lazyRoute(page, m => m.Applications) },
  { path: 'applications/:applicationId', lazy: lazyRoute(page, m => m.ApplicationDetails) },
  { path: 'applications/:applicationId/*', lazy: lazyRoute(page, m => m.ApplicationDetails) },
]
