import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('~/modules/admin/modules/SkillsTaxonomy/pages')

export const routes = [
  { index: true, element: <Navigate to="skills" replace /> },
  { path: 'skills', lazy: lazyRoute(page, m => m.SkillList) },
  { path: 'job_roles', lazy: lazyRoute(page, m => m.JobRoles) },
  { path: 'proficiency', lazy: lazyRoute(page, m => m.Proficiency) },
  { path: 'settings', lazy: lazyRoute(page, m => m.Settings) },
]
