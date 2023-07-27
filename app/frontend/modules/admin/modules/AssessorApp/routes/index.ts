import CampaignList from './CampaignList'
import UserList from './UserList'
import UserDetails from './UserDetails'
import Evaluation from './Evaluation'
import ReportPreview from './ReportPreview'
import { ExternalReportPreview } from './ExternalReportPreview'
import { AssessorAvailability } from './AssessorAvailability'

const routes = [
  {
    path: '/',
    component: CampaignList,
  },
  {
    path: '/availability',
    component: AssessorAvailability,
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
