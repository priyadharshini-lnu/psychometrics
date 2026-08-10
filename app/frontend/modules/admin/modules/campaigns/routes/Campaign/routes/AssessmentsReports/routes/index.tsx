import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const Manage = page(m => m.Manage)
const Sequencing = page(m => m.Sequencing)
const ReportApprovalSetting = page(m => m.ReportApprovalSetting)
const AIScoringApprovalSetting = page(m => m.AIScoringApprovalSetting)

export const routes = [
  { index: true, element: <Navigate to="manage" replace /> },
  { path: 'manage', element: <Manage /> },
  { path: 'manage/:tab', element: <Manage /> },
  { path: 'sequencing', element: <Sequencing /> },
  { path: 'report_approval', element: <ReportApprovalSetting /> },
  { path: 'ai_scoring_approval', element: <AIScoringApprovalSetting /> },
]
