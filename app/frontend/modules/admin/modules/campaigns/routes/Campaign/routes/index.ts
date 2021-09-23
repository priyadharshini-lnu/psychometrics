import {
  Participants, Subjects, Assessors, SmsInvites,
} from './Participants'
import AssessmentsReports from './AssessmentsReports'
import RegistrationCodes from './RegistrationCodes'
import { Datasheet } from './Datasheet'
import CampaignOptions from './CampaignOptions'

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
  { path: '/registration_codes', component: RegistrationCodes },
  { path: '/datasheet', component: Datasheet },
  { path: '/options', component: CampaignOptions },
]

export default routes
