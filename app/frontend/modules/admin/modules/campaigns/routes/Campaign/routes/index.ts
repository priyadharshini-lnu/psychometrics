import { Participants, Subjects, Assessors } from './Participants'
import AssessmentsReports from './AssessmentsReports'
import RegistrationCodes from './RegistrationCodes'
import CampaignOptions from './CampaignOptions'
import Datasheet from './Datasheet'

const routes = [
  { redirect: true, from: '', to: '/participants/subjects' },
  { redirect: true, from: '/participants', to: '/participants/subjects' },
  {
    path: '/participants',
    component: Participants,
    routes: [
      { path: '/participants/subjects', component: Subjects },
      { path: '/participants/assessors', component: Assessors },
    ],
  },
  { path: '/assessments_reports/*', component: AssessmentsReports },
  { path: '/assessments_reports', component: AssessmentsReports },
  { path: '/registration_codes', component: RegistrationCodes },
  { path: '/datasheet', component: Datasheet },
  { path: '/options', component: CampaignOptions },
]

export default routes
