import {
  Participants, Subjects, Assessors, SmsInvites,
} from './Participants'
import AssessmentsReports from './AssessmentsReports'
import { Stats } from './Stats'
import RegistrationCodes from './RegistrationCodes'
import { Datasheet } from './Datasheet'
import { Admins } from './Admins'
import CampaignOptions from './CampaignOptions'
import { Dashboard } from './Dashboard'

const routes = [
  { redirect: true, from: '', to: '/participants/subjects' },
  { redirect: true, from: '/participants', to: '/participants/subjects' },
  {
    path: '/participants',
    component: Participants,
    routes: [
      { path: '/participants/subjects', component: Subjects },
      { path: '/participants/assessors', component: Assessors },
      { path: '/participants/sms_invites', component: SmsInvites },
    ],
  },
  { path: '/assessments_reports/*', component: AssessmentsReports },
  { path: '/assessments_reports', component: AssessmentsReports },
  { path: '/stats', component: Stats },
  { path: '/dashboard/*', component: Dashboard },
  { path: '/dashboard', component: Dashboard },
  { path: '/registration_codes', component: RegistrationCodes },
  { path: '/datasheet', component: Datasheet },
  { path: '/admins', component: Admins },
  { path: '/options', component: CampaignOptions },
]

export default routes
