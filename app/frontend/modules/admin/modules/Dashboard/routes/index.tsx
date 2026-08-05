import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('dashboard', () => import('../pages'))

const Dashboard = page(m => m.Dashboard)
const DashboardList = page(m => m.DashboardList)

const DashboardRoutes = [
  {
    path: 'dashboards/:dashboardId',
    element: <Dashboard />,
  },
  {
    path: 'dashboards/*',
    element: <DashboardList />,
  },
]

export default DashboardRoutes
