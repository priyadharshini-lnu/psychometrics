import CampaignList from './CampaignList'
import UserList from './UserList'
import UserDetails from './UserDetails'

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
]

export default routes
