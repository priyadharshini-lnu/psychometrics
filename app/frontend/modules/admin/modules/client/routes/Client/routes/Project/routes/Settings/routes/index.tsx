import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('client', () => import('~/modules/admin/modules/client/pages'))

const Smtp = page(m => m.Smtp)
const SamlTabbed = page(m => m.SamlTabbed)
const Integrations = page(m => m.Integrations)
const MettlScheduleRecords = page(m => m.MettlScheduleRecords)
const SecuritySettings = page(m => m.SecuritySettings)
const General = page(m => m.General)
const Webhooks = page(m => m.Webhooks)
const Design = page(m => m.Design)
const Profile = page(m => m.Profile)
const Registration = page(m => m.Registration)
const Privacy = page(m => m.Privacy)
const Assessments = page(m => m.Assessments)
const Features = page(m => m.Features)
const Applications = page(m => m.Applications)
const ApplicationDetails = page(m => m.ApplicationDetails)

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
  { path: 'smtp', element: <Smtp /> },
  { path: 'saml', element: <SamlTabbed /> },
  { path: 'integrations', element: <Integrations /> },
  { path: 'integrations/mettl_schedule_records', element: <MettlScheduleRecords /> },
  { path: 'security', element: <SecuritySettings /> },
  { path: 'general', element: <General /> },
  { path: 'webhooks', element: <Webhooks /> },
  { path: 'design', element: <Design /> },
  { path: 'profile', element: <Profile /> },
  { path: 'registration', element: <Registration /> },
  { path: 'privacy', element: <Privacy /> },
  { path: 'assessments', element: <Assessments /> },
  { path: 'features', element: <Features /> },
  { path: 'applications', element: <Applications /> },
  { path: 'applications/:applicationId', element: <ApplicationDetails /> },
  { path: 'applications/:applicationId/*', element: <ApplicationDetails /> },
]
