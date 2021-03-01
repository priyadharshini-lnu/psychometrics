import CampaignList from './CampaignList'
import UserList from './UserList'
import UserDetails from './UserDetails'
import Evaluation from './Evaluation'
import ReportPreview from './ReportPreview'

const routes = [
  {
    path: '/',
    component: CampaignList,
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
    path: '/campaigns/:campaignId/evaluations/:userId',
    component: Evaluation,
  },
]

export default routes
