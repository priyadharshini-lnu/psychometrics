import { Dashboard } from './Dashboard'
import { DashboardList } from './DashboardList'

export const routes = [
  {
    path: '/',
    component: DashboardList,
  },
  {
    path: '/:dashboardId',
    component: Dashboard,
  },
]
