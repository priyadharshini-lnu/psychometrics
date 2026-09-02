import { lazyRoute } from '~/utils/lazyRoute'
import { settings } from '../settings'

const page = () => import('../pages')

export const DashboardFullScreenRoutes = [
  {
    path: `${settings.urlPrefix}/:dashboardId`,
    lazy: lazyRoute(page, m => m.Dashboard),
  },
]

const DashboardRoutes = [
  {
    path: 'dashboards/*',
    lazy: lazyRoute(page, m => m.DashboardList),
  },
]

export default DashboardRoutes
