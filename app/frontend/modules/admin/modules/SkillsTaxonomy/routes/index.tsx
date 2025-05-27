import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const SkillList = lazy(() => import('../components/SkillList'))

export const routes = [
  { redirect: true, from: '/', to: 'skills' },
  {
    path: '/skills',
    component: <SkillList />,
  },
  {
    path: '/proficiency',
    component: <div>Proficiency</div>,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const SkillsRoutes = [
  {
    path: '/skills_taxonomy/*',
    component: <Layout />,
  },
]

export default SkillsRoutes
