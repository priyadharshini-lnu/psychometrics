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
import {
  Scheduling, WorkshopList, Invites, InvitesForm, AssessmentCenterForm,
} from './Scheduling'
import {
  Scoring,
  ScoringGroups,
  SubjectScoresList,
} from './Scoring'
import { WorkshopPage } from './Scheduling/Workshop/WorkshopPage'
import { IndividualInvite } from './Scheduling/Invites/IndividualInvite'
import AssessorsDetails
  from '~/modules/admin/modules/campaigns/routes/Campaign/routes/Participants/Assessors/AssessorDetails'
import { Weightages } from './Scoring/Weigthages'
import UserDetails from './Participants/Subjects/UserDetails'

const routes = [
  { redirect: true, from: '', to: '/participants/subjects' },
  { redirect: true, from: '/participants', to: '/participants/subjects' },
  { redirect: true, from: '/scheduling', to: '/scheduling/assessment_center' },
  { redirect: true, from: '/participants/users/:id', to: '/participants/users/:id/assessments' },
  {
    path: '/participants',
    component: Participants,
    routes: [
      { path: '/participants/subjects', component: Subjects },
      { path: '/participants/assessors', component: Assessors },
      { path: '/participants/sms/:tab', component: SmsInvites },
    ],
  },
  {
    path: '/scheduling',
    component: Scheduling,
    routes: [
      { path: '/scheduling/assessment_center', component: WorkshopList },
      { path: '/scheduling/:tab', component: Invites },
      { path: '/scheduling/invites/add_invite', component: InvitesForm },
    ],
  },
  { path: '/scheduling/assessment_center/new', component: AssessmentCenterForm },
  { path: '/scheduling/assessment_center/:id', component: WorkshopPage },
  { path: '/scheduling/assessment_center/:id/:tab', component: WorkshopPage },
  { path: '/scheduling/invites/add_invite', component: InvitesForm },
  { path: '/scheduling/invites/:inviteId/:tabName', component: IndividualInvite },
  {
    path: '/scoring',
    component: Scoring,
    routes: [
      { redirect: true, from: '/scoring', to: '/scoring/subject_scores' },
      { path: '/scoring/subject_scores', component: SubjectScoresList },
      { path: '/scoring/settings', component: ScoringGroups },
      { path: '/scoring/settings/weightages', component: Weightages },

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
  { path: '/participants/users/:id/:tab', component: UserDetails },
  { path: '/participants/assessors/:id', component: AssessorsDetails },
]

export default routes
