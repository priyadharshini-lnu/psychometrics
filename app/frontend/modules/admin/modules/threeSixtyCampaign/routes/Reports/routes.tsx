import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('threeSixtyCampaign', () => import('~/modules/admin/modules/threeSixtyCampaign/pages'))

const ReportsOptions = page(m => m.ReportsOptions)
const ReportApprovalSetting = page(m => m.ReportApprovalSetting)

export const TABS = ['options', 'report_approval']

export const routes = [
  { index: true, element: <Navigate to="options" replace /> },
  { path: 'options', element: <ReportsOptions /> },
  { path: 'report_approval', element: <ReportApprovalSetting /> },
]
