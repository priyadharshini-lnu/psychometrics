import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const DashboardRoutes = [
  {
    path: 'dashboards/:dashboardId',
    lazy: lazyRoute(page, m => m.Dashboard),
  },
  {
    path: 'dashboards/*',
    lazy: lazyRoute(page, m => m.DashboardList),
  },
]

export default DashboardRoutes
