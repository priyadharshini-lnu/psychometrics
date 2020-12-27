import Users from './Users'
import AssessmentsReports from './AssessmentsReports'
import RegistrationCodes from './RegistrationCodes'
import CampaignOptions from './CampaignOptions'
import Datasheet from './Datasheet'

const routes = [
  { redirect: true, from: '/', to: '/users' },
  { path: '/users', component: Users },
  { path: '/assessments_reports/*', component: AssessmentsReports },
  { path: '/assessments_reports', component: AssessmentsReports },
  { path: '/registration_codes', component: RegistrationCodes },
  { path: '/datasheet', component: Datasheet },
  { path: '/options', component: CampaignOptions },
]

export default routes
