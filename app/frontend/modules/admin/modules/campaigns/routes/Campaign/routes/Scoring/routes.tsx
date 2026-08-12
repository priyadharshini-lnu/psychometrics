import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./pages')

export const routes = [
  { index: true, element: <Navigate to="subject_scores" replace /> },
  { path: 'subject_scores', lazy: lazyRoute(page, m => m.SubjectScoresList) },
  { path: 'settings', lazy: lazyRoute(page, m => m.ScoringGroups) },
  { path: 'settings/weightages', lazy: lazyRoute(page, m => m.Weightages) },
]
