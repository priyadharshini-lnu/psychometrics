import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const ReportRoutes = [
  {
    path: 'reports',
    children: [
      { index: true, element: <Navigate to="active" replace /> },
      {
        lazy: lazyRoute(page, m => m.ReportsLayout),
        children: [
          { path: 'active', lazy: lazyRoute(page, m => m.ActiveReports) },
          { path: 'archived', lazy: lazyRoute(page, m => m.ArchivedReports) },
          { path: 'trash', lazy: lazyRoute(page, m => m.DeletedReports) },
        ],
      },
      { path: ':id/edit', lazy: lazyRoute(page, m => m.EditReport) },
    ],
  },
  {
    path: 'report_families/:id/reports',
    lazy: lazyRoute(page, m => m.ReportBundleReportList),
  },
  {
    path: 'report_families',
    lazy: lazyRoute(page, m => m.ReportBundleList),
  },
]

export default ReportRoutes
