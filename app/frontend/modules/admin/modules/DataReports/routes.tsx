import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const DataReports = lazy(() => import('./DataReports'))

export const routes = [
  {
    path: '',
    component: <DataReports />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

export const DataReportsRoutes = [
  {
    path: '/data_reports',
    component: <Layout />,
  },
]
