import CampaignList from 'modules/admin/modules/campaigns/routes/CampaignList'
import { Datasheet } from './Datasheet'

export const routes = [
  {
    path: '/new_campaigns',
    component: CampaignList,
  },
  {
    path: '/datasheet',
    component: Datasheet,
  },
]
