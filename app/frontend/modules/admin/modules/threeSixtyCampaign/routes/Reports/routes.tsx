import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('~/modules/admin/modules/threeSixtyCampaign/pages')

export const TABS = ['options', 'report_approval']

export const routes = [
  { index: true, element: <Navigate to="options" replace /> },
  { path: 'options', lazy: lazyRoute(page, m => m.ReportsOptions) },
  { path: 'report_approval', lazy: lazyRoute(page, m => m.ReportApprovalSetting) },
]
