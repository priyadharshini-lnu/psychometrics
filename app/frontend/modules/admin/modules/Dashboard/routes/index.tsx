import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const DashboardList = lazy(() => import('./DashboardList'))
const Dashboard = lazy(() => import('./Dashboard'))

export const routes = [
  {
    path: '/',
    component: <DashboardList />,
  },
  {
    path: '/:dashboardId',
    component: <Dashboard />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const DashboardRoutes = [
  {
    path: '/dashboards/*',
    component: <Layout />,
  },
]

export default DashboardRoutes
