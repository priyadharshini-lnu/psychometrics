import CampaignList from './CampaignList'
import UserList from './UserList'
import UserDetails from './UserDetails'
import Evaluation from './Evaluation'
import ReportPreview from './ReportPreview'
import { ExternalReportPreview } from './ExternalReportPreview'
import { WorkshopList } from './AssessmentCenter'

const routes = [
  {
    path: '/',
    component: CampaignList,
  },
  {
    redirect: true,
    from: '/assessment_centers',
    to: '/assessment_centers/current',
  },
  {
    path: '/assessment_centers/:tab',
    component: WorkshopList,
  },
  {
    path: '/campaigns/:campaignId/users/:userId',
    component: UserDetails,
  },
  {
    path: '/campaigns/:campaignId/users',
    component: UserList,
  },
  {
    path: '/campaigns/:campaignId/user_reports/:id',
    component: ReportPreview,
  },
  {
    path: '/campaigns/:campaignId/external_user_report/:id',
    component: ExternalReportPreview,
  },
  {
    path: '/campaigns/:campaignId/evaluations/:userId',
    component: Evaluation,
  },
]

export default routes
