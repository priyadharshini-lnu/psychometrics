import Users from './Users'
import AssessmentsReports from './AssessmentsReports'
import RegistrationCodes from './RegistrationCodes'
import Options from './Options'

const routes = [
  { redirect: true, from: '/', to: '/users' },
  { path: '/users', component: Users },
  { path: '/assessments_reports', component: AssessmentsReports },
  { path: '/registration_codes', component: RegistrationCodes },
  { path: '/options', component: Options },
]

export default routes
