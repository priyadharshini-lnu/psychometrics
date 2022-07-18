import { CampaignList } from './CampaignList'
import Campaign from './Campaign'

const routes = [
  {
    path: '/',
    main: CampaignList,
    exact: true,
  },
  {
    path: '/dashboard',
    main: CampaignList,
    exact: true,
  },
  {
    path: '/campaigns/:campaignId',
    main: Campaign,
    exact: true,
  },
  {
    path: '/threesixty_campaigns/:campaignId',
    main: Campaign,
    exact: true,
  },
]

export default routes
