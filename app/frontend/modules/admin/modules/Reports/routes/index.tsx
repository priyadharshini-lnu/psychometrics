import { ReportList } from './ReportList'
import { ReportBundleList } from './ReportBundleList'
import { ReportBundleReportList } from './ReportBundleReportList'

const routes = [
  {
    path: '/reports/*',
    component: () => <ReportList />,
  },
  {
    path: '/reports',
    component: () => <ReportList />,
  },
  {
    path: '/report_families',
    component: () => <ReportBundleList />,
  },
  {
    path: '/report_families/:id/reports',
    component: () => <ReportBundleReportList />,
  },
]

export default routes
