import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('client', () => import('~/modules/admin/modules/client/pages'))

const ProjectParticipants = page(m => m.ProjectParticipants)
const ProjectAssessors = page(m => m.ProjectAssessors)

export const routes = [
  { index: true, element: <Navigate to="participants" replace /> },
  { path: 'participants', element: <ProjectParticipants /> },
  { path: 'assessors', element: <ProjectAssessors /> },
]
