import { ComponentType, lazy } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useParams } from 'react-router-dom'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getCampaignId } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import {
  routes as threeSixtyMessagesRoutes,
} from '~/modules/admin/modules/threeSixtyCampaign/routes/Messages/routes'
import {
  routes as threeSixtyReportsRoutes,
} from '~/modules/admin/modules/threeSixtyCampaign/routes/Reports/routes'
import { lazyRoute } from '~/utils/lazyRoute'
import { routes as aiArtifactsRoutes } from './AIArtifacts/routes'
import { routes as assessmentsReportsRoutes } from './AssessmentsReports/routes'
import { routes as dashboardRoutes } from './Dashboard/routes'
import { routes as schedulingRoutes } from './Scheduling/routes'
import { routes as scoringRoutes } from './Scoring/routes'

// One specifier per sub-area: routes sharing a specifier share a chunk, so opening a tab fetches only its own.
const page = () => import('~/modules/admin/modules/campaigns/pages')
const aiArtifacts = () => import('./AIArtifacts/pages')
const assessmentsReports = () => import('./AssessmentsReports/pages')
const dashboard = () => import('./Dashboard/pages')
const idp = () => import('~/modules/admin/modules/campaigns/routes/IDP/pages')
const idpReportPreview = () => import('./IdpReportPreview/pages')
const participants = () => import('./Participants/pages')
const scheduling = () => import('./Scheduling/pages')
const scoring = () => import('./Scoring/pages')
const threeSixty = () => import('~/modules/admin/modules/threeSixtyCampaign/pages')

// A threesixty campaign and a common one answer the same urls, so the pages that differ are picked at render time.
// The parent route holds its children back until the fetched campaign is in redux, so this is never read empty.
const variant = (ThreeSixtyPage: ComponentType, CommonPage: ComponentType): ComponentType => () => {
  const { campaignId } = useParams()
  const isThreeSixty = useSelector((state: RootState) => String(getCampaignId(state)) === campaignId)

  return isThreeSixty ? <ThreeSixtyPage /> : <CommonPage />
}

const Participants = variant(
  lazy(async () => ({ default: (await threeSixty()).Participants })),
  lazy(async () => ({ default: (await participants()).Participants })),
)
const Subjects = variant(
  lazy(async () => ({ default: (await threeSixty()).SubjectList })),
  lazy(async () => ({ default: (await participants()).Subjects })),
)
const AIArtifacts = variant(
  lazy(async () => ({ default: (await threeSixty()).AIArtifacts })),
  lazy(async () => ({ default: (await aiArtifacts()).AIArtifacts })),
)
const Datasheet = variant(
  lazy(async () => ({ default: (await threeSixty()).Datasheet })),
  lazy(async () => ({ default: (await page()).Datasheet })),
)
const Admins = variant(
  lazy(async () => ({ default: (await threeSixty()).Admins })),
  lazy(async () => ({ default: (await page()).Admins })),
)

const participantsRoutes = [
  { index: true, element: <Navigate to="subjects" replace /> },
  { path: 'subjects', Component: Subjects },
  { path: 'subjects/:id', element: <Navigate to="assessments" replace /> },
  { path: 'subjects/:id/:tab', lazy: lazyRoute(participants, m => m.UserDetails) },
  { path: 'assessors', lazy: lazyRoute(participants, m => m.Assessors) },
  { path: 'sms/:tab', lazy: lazyRoute(participants, m => m.SmsInvites) },
  { path: 'options', lazy: lazyRoute(threeSixty, m => m.ParticipantsOptions) },
  { path: 'evaluators', lazy: lazyRoute(threeSixty, m => m.EvaluatorList) },
  { path: 'managers', lazy: lazyRoute(threeSixty, m => m.ManagerList) },
]

export const routes = [
  { index: true, element: <Navigate to="participants" replace /> },
  { path: 'participants', Component: Participants, children: participantsRoutes },
  { path: 'participants/assessors/:id', lazy: lazyRoute(participants, m => m.AssessorDetails) },
  {
    path: 'participants/subjects/:userId/idp/:idpPlanId/step/:step',
    lazy: lazyRoute(idp, m => m.InitialStepsComponent),
  },
  { path: 'participants/subjects/:userId/idp/:idpPlanId/plan', lazy: lazyRoute(idp, m => m.Plan) },
  { path: 'scheduling', lazy: lazyRoute(scheduling, m => m.Scheduling), children: schedulingRoutes },
  { path: 'scheduling/assessment_center/new', lazy: lazyRoute(scheduling, m => m.AssessmentCenterForm) },
  // WorkshopPage swaps its own tabs under this url, so it keeps the splat.
  { path: 'scheduling/assessment_center/:id/*', lazy: lazyRoute(scheduling, m => m.WorkshopPage) },
  { path: 'scheduling/invites/add_invite', lazy: lazyRoute(scheduling, m => m.InvitesForm) },
  { path: 'scheduling/invites/:inviteId/:tabName', lazy: lazyRoute(scheduling, m => m.IndividualInvite) },
  { path: 'scoring', lazy: lazyRoute(scoring, m => m.Scoring), children: scoringRoutes },
  { path: 'ai_artifacts', Component: AIArtifacts, children: aiArtifactsRoutes },
  {
    path: 'assessments_reports',
    lazy: lazyRoute(assessmentsReports, m => m.AssessmentsReports),
    children: assessmentsReportsRoutes,
  },
  { path: 'stats', lazy: lazyRoute(page, m => m.Stats) },
  { path: 'dashboard', lazy: lazyRoute(dashboard, m => m.Dashboard), children: dashboardRoutes },
  { path: 'registration_codes', lazy: lazyRoute(page, m => m.RegistrationCodes) },
  { path: 'datasheet', Component: Datasheet },
  { path: 'admins', Component: Admins },
  { path: 'options', lazy: lazyRoute(page, m => m.CampaignOptions) },
  { path: 'audit_reports', lazy: lazyRoute(page, m => m.DataExports) },
  { path: 'user_idp_reports/:id/*', lazy: lazyRoute(idpReportPreview, m => m.IdpReportPreview) },
  // CommunicationCenter mounts its own nested router via RouteList, so it keeps the splat.
  { path: 'communication_center/*', lazy: lazyRoute(page, m => m.CommunicationCenter) },
  { path: 'messages', lazy: lazyRoute(threeSixty, m => m.Messages), children: threeSixtyMessagesRoutes },
  { path: 'reports', lazy: lazyRoute(threeSixty, m => m.Reports), children: threeSixtyReportsRoutes },
]
