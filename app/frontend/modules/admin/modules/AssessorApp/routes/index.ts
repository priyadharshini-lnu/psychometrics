import CampaignList from './CampaignList'
import UserList from './UserList'

const routes = [
  {
    path: '/',
    component: CampaignList,
  },
  {
    path: '/campaigns/:campaignId/users',
    component: UserList,
  },
]

export default routes
