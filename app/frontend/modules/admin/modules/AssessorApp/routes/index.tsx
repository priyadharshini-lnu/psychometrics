import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('assessorApp', () => import('../pages'))

const CampaignList = page(m => m.CampaignList)
const WorkshopList = page(m => m.WorkshopList)
const UserDetails = page(m => m.UserDetails)
const UserList = page(m => m.UserList)
const ReportPreview = page(m => m.ReportPreview)
const ExternalReportPreview = page(m => m.ExternalReportPreview)
const Evaluation = page(m => m.Evaluation)
const ModerateScoring = page(m => m.ModerateScoring)

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
