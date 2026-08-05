import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('skillsTaxonomy', () => import('../pages'))

const SkillList = page(m => m.SkillList)
const JobRoles = page(m => m.JobRoles)
const Proficiency = page(m => m.Proficiency)
const Settings = page(m => m.Settings)

const SkillsRoutes = [
  {
    path: 'skills_taxonomy',
    children: [
      { index: true, element: <Navigate to="skills" replace /> },
      { path: 'skills', element: <SkillList /> },
      { path: 'job_roles', element: <JobRoles /> },
      { path: 'proficiency', element: <Proficiency /> },
      { path: 'tools', element: <Settings /> },
    ],
  },
]

export default SkillsRoutes
