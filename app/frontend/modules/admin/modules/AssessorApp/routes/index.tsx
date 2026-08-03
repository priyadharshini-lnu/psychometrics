import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const CampaignList = lazy(() => import('./CampaignList'))
const UserList = lazy(() => import('./UserList'))
const UserDetails = lazy(() => import('./UserDetails'))
const Evaluation = lazy(() => import('./Evaluation'))
const ReportPreview = lazy(() => import('./ReportPreview'))
const ExternalReportPreview = lazy(
  () => import('./ExternalReportPreview').then(({ ExternalReportPreview: component }) => ({ default: component })),
)
const WorkshopList = lazy(
  () => import('./AssessmentCenter').then(({ WorkshopList: component }) => ({ default: component })),
)
const ModerateScoring = lazy(
  () => import('./ModerateScoring').then(({ ModerateScoring: component }) => ({ default: component })),
)

const routes = [
  {
    path: '',
    element: <CampaignList />,
  },
  {
    path: 'assessment_centers',
    element: <Navigate to="campaigns" replace />,
  },
  {
    path: 'assessment_centers/:tab',
    element: <WorkshopList />,
  },
  {
    path: 'campaigns/:campaignId/users/:userId',
    element: <UserDetails />,
  },
  {
    path: 'campaigns/:campaignId/users',
    element: <UserList />,
  },
  {
    path: 'campaigns/:campaignId/user_reports/:id',
    element: <ReportPreview />,
  },
  {
    path: 'campaigns/:campaignId/external_user_report/:id',
    element: <ExternalReportPreview />,
  },
  {
    path: 'campaigns/:campaignId/evaluations/:userId',
    element: <Evaluation />,
  },
  {
    path: 'campaigns/:campaignId/moderate_scoring/:userId',
    element: <ModerateScoring />,
  },
]

export default routes
