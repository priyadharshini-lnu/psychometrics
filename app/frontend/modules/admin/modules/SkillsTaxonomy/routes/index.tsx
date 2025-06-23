import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const SkillList = lazy(() => import('../components/SkillList'))
const JobRoles = lazy(() => import('../components/JobRoles'))
const JobRoleSkillMapping = lazy(() => import('../components/JobRoleSkillMapping'))
const Proficiency = lazy(() => import('../components/Proficiency'))

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
    path: '/skill_job_mappings',
    component: <JobRoleSkillMapping />,
  },
  {
    path: '/proficiency',
    component: <Proficiency />,
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
