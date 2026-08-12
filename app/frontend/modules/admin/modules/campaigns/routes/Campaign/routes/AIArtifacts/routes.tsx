import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./pages')

export const routes = [
  { index: true, element: <Navigate to="results" replace /> },
  { path: 'results', lazy: lazyRoute(page, m => m.Result) },
  { path: 'settings', lazy: lazyRoute(page, m => m.AIArtifactsSettings) },
]
