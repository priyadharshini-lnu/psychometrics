import { CampaignList } from '~/modules/admin/modules/campaigns/routes/CampaignList'
import { Users } from './Users'
import { Settings } from './Settings'
import { Datasheet } from './Datasheet'
import { Admins } from './Admins'

export const routes = [
  {
    path: '/new_campaigns',
    component: CampaignList,
  },
  {
    path: '/admins',
    component: Admins,
  },
  {
    path: '/users',
    component: Users,
  },
  {
    path: '/users*',
    component: Users,
  },
  {
    path: '/datasheet',
    component: Datasheet,
  },
  {
    path: '/settings',
    component: Settings,
  },
  {
    path: '/settings/*',
    component: Settings,
  },
]
