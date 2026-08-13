import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const routes = [
  {
    path: '',
    lazy: lazyRoute(page, m => m.CampaignList),
  },
  {
    path: 'assessment_centers',
    element: <Navigate to="campaigns" replace />,
  },
  {
    path: 'assessment_centers/:tab',
    lazy: lazyRoute(page, m => m.WorkshopList),
  },
  {
    path: 'campaigns/:campaignId/users/:userId',
    lazy: lazyRoute(page, m => m.UserDetails),
  },
  {
    path: 'campaigns/:campaignId/users',
    lazy: lazyRoute(page, m => m.UserList),
  },
  {
    path: 'campaigns/:campaignId/user_reports/:id',
    lazy: lazyRoute(page, m => m.ReportPreview),
  },
  {
    path: 'campaigns/:campaignId/external_user_report/:id',
    lazy: lazyRoute(page, m => m.ExternalReportPreview),
  },
  {
    path: 'campaigns/:campaignId/evaluations/:userId',
    lazy: lazyRoute(page, m => m.Evaluation),
  },
  {
    path: 'campaigns/:campaignId/moderate_scoring/:userId',
    lazy: lazyRoute(page, m => m.ModerateScoring),
  },
]

export default routes
