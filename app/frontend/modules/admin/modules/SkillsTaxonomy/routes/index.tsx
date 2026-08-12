import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const SkillsRoutes = [
  {
    path: 'skills_taxonomy',
    children: [
      { index: true, element: <Navigate to="skills" replace /> },
      { path: 'skills', lazy: lazyRoute(page, m => m.SkillList) },
      { path: 'job_roles', lazy: lazyRoute(page, m => m.JobRoles) },
      { path: 'proficiency', lazy: lazyRoute(page, m => m.Proficiency) },
      { path: 'tools', lazy: lazyRoute(page, m => m.Settings) },
    ],
  },
]

export default SkillsRoutes
