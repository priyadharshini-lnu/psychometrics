import Users from './Users'
import AssessmentsReports from './AssessmentsReports'
import RegistrationCodes from './RegistrationCodes'
import CampaignOptions from './CampaignOptions'

const routes = [
  { redirect: true, from: '/', to: '/users' },
  { path: '/users', component: Users },
  { path: '/assessments_reports/*', component: AssessmentsReports },
  { path: '/assessments_reports', component: AssessmentsReports },
  { path: '/registration_codes', component: RegistrationCodes },
  { path: '/options', component: CampaignOptions },
]

export default routes
