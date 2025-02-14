import { CampaignList } from '~/modules/admin/modules/campaigns/routes/CampaignList'
import { Users } from './Users'
import { Settings } from './Settings'
import { Datasheet } from './Datasheet'
import { Admins } from './Admins'
import { DataExports } from './DataExports'
import { Idp } from './Idp'

export const routes = [
  { redirect: true, from: '/', to: 'new_campaigns' },
  {
    path: '/new_campaigns',
    component: <CampaignList />,
  },
  {
    path: '/admins',
    component: <Admins />,
  },
  {
    path: '/users',
    component: <Users />,
  },
  {
    path: '/users/*',
    component: <Users />,
  },
  {
    path: '/datasheet',
    component: <Datasheet />,
  },
  {
    path: '/settings/*',
    component: <Settings />,
  },
  {
    path: '/audit_reports',
    component: <DataExports />,
  },
  {
    path: '/idp/*',
    component: <Idp />,
  },
]
