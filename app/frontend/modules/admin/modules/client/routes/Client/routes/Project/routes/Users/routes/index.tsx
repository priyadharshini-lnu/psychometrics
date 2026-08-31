import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('~/modules/admin/modules/client/pages')

export const routes = [
  { index: true, element: <Navigate to="participants" replace /> },
  { path: 'participants', lazy: lazyRoute(page, m => m.ProjectParticipants) },
  { path: 'assessors', lazy: lazyRoute(page, m => m.ProjectAssessors) },
]
