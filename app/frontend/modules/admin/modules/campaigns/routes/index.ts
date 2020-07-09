import CampaignList from './CampaignList'
import Campaign from './Campaign'

const routes = [
  {
    path: '/:campaignId',
    component: Campaign,
  },
  {
    path: '/:campaignId/*',
    component: Campaign,
  },
  {
    path: '/',
    component: CampaignList,
  },
]

export default routes
