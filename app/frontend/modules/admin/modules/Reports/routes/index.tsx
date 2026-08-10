import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('reports', () => import('../pages'))

const reportList = (reportTab: string) => page(({ ReportList }) => () => <ReportList reportTab={reportTab} />)

const ActiveReports = reportList('active')
const ArchivedReports = reportList('archived')
const TrashedReports = reportList('deleted')
const EditReport = page(m => m.EditReport)
const ReportBundleReportList = page(m => m.ReportBundleReportList)
const ReportBundleList = page(m => m.ReportBundleList)

const ReportRoutes = [
  {
    path: 'reports',
    children: [
      { index: true, element: <Navigate to="active" replace /> },
      { path: 'active', element: <ActiveReports /> },
      { path: 'archived', element: <ArchivedReports /> },
      { path: 'trash', element: <TrashedReports /> },
      { path: ':id/edit', element: <EditReport /> },
    ],
  },
  {
    path: 'report_families/:id/reports',
    element: <ReportBundleReportList />,
  },
  {
    path: 'report_families',
    element: <ReportBundleList />,
  },
]

export default ReportRoutes
