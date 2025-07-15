import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const SkillList = lazy(() => import('../components/SkillList'))
const JobRoles = lazy(() => import('../components/JobRoles'))
const Proficiency = lazy(() => import('../components/Proficiency'))
const Settings = lazy(() => import('../components/Settings'))

export const routes = [
  { redirect: true, from: '/', to: 'skills' },
  {
    path: '/skills',
    component: <SkillList />,
  },
  {
    path: '/job_roles',
    component: <JobRoles />,
  },
  {
    path: '/proficiency',
    component: <Proficiency />,
  },
  {
    path: '/settings',
    component: <Settings />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const SkillsRoutes = [
  {
    path: 'skills_taxonomy/*',
    element: <Layout />,
  },
]

export default SkillsRoutes
