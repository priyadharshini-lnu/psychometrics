import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const Result = page(m => m.Result)
const AIArtifactsSettings = page(m => m.AIArtifactsSettings)

export const routes = [
  { index: true, element: <Navigate to="results" replace /> },
  { path: 'results', element: <Result /> },
  { path: 'settings', element: <AIArtifactsSettings /> },
]
