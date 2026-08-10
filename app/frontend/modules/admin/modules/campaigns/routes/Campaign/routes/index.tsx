import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'
import { routes as aiArtifactsRoutes } from './AIArtifacts/routes'
import { routes as assessmentsReportsRoutes } from './AssessmentsReports/routes'
import { routes as dashboardRoutes } from './Dashboard/routes'
import { routes as participantsRoutes } from './Participants/routes'
import { routes as schedulingRoutes } from './Scheduling/routes'
import { routes as scoringRoutes } from './Scoring/routes'

const page = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const Participants = page(m => m.Participants)
const AssessorDetails = page(m => m.AssessorDetails)
const InitialStepsComponent = page(m => m.InitialStepsComponent)
const Plan = page(m => m.Plan)
const Scheduling = page(m => m.Scheduling)
const AssessmentCenterForm = page(m => m.AssessmentCenterForm)
const WorkshopPage = page(m => m.WorkshopPage)
const InvitesForm = page(m => m.InvitesForm)
const IndividualInvite = page(m => m.IndividualInvite)
const Scoring = page(m => m.Scoring)
const AIArtifacts = page(m => m.AIArtifacts)
const AssessmentsReports = page(m => m.AssessmentsReports)
const Stats = page(m => m.Stats)
const Dashboard = page(m => m.Dashboard)
const RegistrationCodes = page(m => m.RegistrationCodes)
const Datasheet = page(m => m.Datasheet)
const Admins = page(m => m.Admins)
const CampaignOptions = page(m => m.CampaignOptions)
const DataExports = page(m => m.DataExports)
const IdpReportPreview = page(m => m.IdpReportPreview)

export const routes = [
  { index: true, element: <Navigate to="participants" replace /> },
  { path: 'participants', element: <Participants />, children: participantsRoutes },
  { path: 'participants/assessors/:id', element: <AssessorDetails /> },
  {
    path: 'participants/subjects/:userId/idp/:idpPlanId/step/:step',
    element: <InitialStepsComponent />,
  },
  { path: 'participants/subjects/:userId/idp/:idpPlanId/plan', element: <Plan /> },
  { path: 'scheduling', element: <Scheduling />, children: schedulingRoutes },
  { path: 'scheduling/assessment_center/new', element: <AssessmentCenterForm /> },
  // WorkshopPage swaps its own tabs under this url, so it keeps the splat.
  { path: 'scheduling/assessment_center/:id/*', element: <WorkshopPage /> },
  { path: 'scheduling/invites/add_invite', element: <InvitesForm /> },
  { path: 'scheduling/invites/:inviteId/:tabName', element: <IndividualInvite /> },
  { path: 'scoring', element: <Scoring />, children: scoringRoutes },
  { path: 'ai_artifacts', element: <AIArtifacts />, children: aiArtifactsRoutes },
  {
    path: 'assessments_reports',
    element: <AssessmentsReports />,
    children: assessmentsReportsRoutes,
  },
  { path: 'stats', element: <Stats /> },
  { path: 'dashboard', element: <Dashboard />, children: dashboardRoutes },
  { path: 'registration_codes', element: <RegistrationCodes /> },
  { path: 'datasheet', element: <Datasheet /> },
  { path: 'admins', element: <Admins /> },
  { path: 'options', element: <CampaignOptions /> },
  { path: 'audit_reports', element: <DataExports /> },
  { path: 'user_idp_reports/:id/*', element: <IdpReportPreview /> },
]
