import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const Maintenance = lazy(() => import('./Maintenance'))


const routes = [
  { redirect: true, from: '', to: 'maintenance' },
  { path: '/maintenance', component: <Maintenance /> },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const SettingsRoutes = [
  {
    path: 'settings/*',
    element: <Layout />,
  },
]

export default SettingsRoutes
