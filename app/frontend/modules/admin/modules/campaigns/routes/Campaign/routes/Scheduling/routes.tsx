import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./pages')

export const routes = [
  { index: true, element: <Navigate to="assessment_center" replace /> },
  { path: 'assessment_center', lazy: lazyRoute(page, m => m.WorkshopList) },
  // Invites reads the tab off the url, so requests and invites share one route.
  { path: ':tab', lazy: lazyRoute(page, m => m.Invites) },
]
