import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

export const routes = [
  { index: true, element: <Navigate to="manage" replace /> },
  { path: 'manage', lazy: lazyRoute(page, m => m.Manage) },
  { path: 'manage/:tab', lazy: lazyRoute(page, m => m.Manage) },
  { path: 'sequencing', lazy: lazyRoute(page, m => m.Sequencing) },
  { path: 'report_approval', lazy: lazyRoute(page, m => m.ReportApprovalSetting) },
  { path: 'ai_scoring_approval', lazy: lazyRoute(page, m => m.AIScoringApprovalSetting) },
]
