import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const DevelopmentActionList = lazy(() => import('../components/DevelopmentActionList/DevelopmentActionList'))

export const routes = [
  {
    path: '/',
    component: <DevelopmentActionList />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const DevelopmentActionRoutes = [
  {
    path: '/development_actions/*',
    component: <Layout />,
  },
]

export default DevelopmentActionRoutes
