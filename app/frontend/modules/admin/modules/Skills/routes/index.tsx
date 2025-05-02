import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const SkillList = lazy(() => import('../components/SkillList'))

export const routes = [
  {
    path: '/',
    component: <SkillList />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const SkillsRoutes = [
  {
    path: '/skills/*',
    component: <Layout />,
  },
]

export default SkillsRoutes
