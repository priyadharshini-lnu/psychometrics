import { lazy } from 'react'

const DashboardList = lazy(() => import('./DashboardList'))
const Dashboard = lazy(() => import('./Dashboard'))
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
