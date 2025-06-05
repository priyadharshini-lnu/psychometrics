import { Plan } from '~/modules/admin/modules/campaigns/routes/IDP/Plan'
import { InitialStepsComponent } from '~/modules/admin/modules/campaigns/routes/IDP/InitialSteps'
import { Participants } from './Participants'
import AssessmentsReports from './AssessmentsReports'
import { Stats } from './Stats'
import RegistrationCodes from './RegistrationCodes'
import { Datasheet } from './Datasheet'
import { Admins } from './Admins'
import CampaignOptions from './CampaignOptions'
import { Dashboard } from './Dashboard'
import { Scheduling, InvitesForm, AssessmentCenterForm } from './Scheduling'
import { Scoring } from './Scoring'
import { WorkshopPage } from './Scheduling/Workshop/WorkshopPage'
import { IndividualInvite } from './Scheduling/Invites/IndividualInvite'
import AssessorsDetails from './Participants/Assessors/AssessorDetails'
import { DataExports } from './DataExports'
import IdpReportPreview from './IdpReportPreview'


const routes = [
  { redirect: true, from: '', to: 'participants' },
  { redirect: true, from: '/scheduling', to: 'assessment_center' },
  { redirect: true, from: '/participants/subjects/:id', to: 'assessments' },
  { path: '/participants/assessors/:id', component: <AssessorsDetails /> },
  { path: '/participants/*', component: <Participants /> },
  { path: '/scheduling/*', component: <Scheduling /> },
  { path: '/scheduling/assessment_center/new', component: <AssessmentCenterForm /> },
  { path: '/scheduling/assessment_center/:id/*', component: <WorkshopPage /> },
  { path: '/scheduling/invites/add_invite', component: <InvitesForm /> },
  { path: '/scheduling/invites/:inviteId/:tabName', component: <IndividualInvite /> },
  { path: '/scoring/*', component: <Scoring /> },
  { path: '/assessments_reports/*', component: <AssessmentsReports /> },
  { path: '/stats', component: <Stats /> },
  { path: '/dashboard/*', component: <Dashboard /> },
  { path: '/registration_codes', component: <RegistrationCodes /> },
  { path: '/datasheet', component: <Datasheet /> },
  { path: '/admins', component: <Admins /> },
  { path: '/options', component: <CampaignOptions /> },
  { path: '/audit_reports', component: <DataExports /> },
  { path: '/audit_reports', component: <DataExports /> },
  { path: '/user_idp_reports/:id/*', component: <IdpReportPreview /> },
  { path: '/user/:user_id/idp_plan/:idp_plan_id/step/:step', component: <InitialStepsComponent /> },
  { path: '/user/:user_id/idp_plan/:idp_plan_id/plan', component: <Plan /> },
]

export default routes
