import { ReportList } from './ReportList/routes/ReportList'
import { ReportBundleList } from './ReportBundleList'
import { ReportBundleReportList } from './ReportBundleReportList'
import { EditReport } from './ReportList/routes/EditReport'

const routes = [
  { redirect: true, from: '/reports', to: '/reports/active' },
  {
    path: '/reports/active',
    component: () => <ReportList reportTab="active" />,
  },
  {
    path: '/reports/archived',
    component: () => <ReportList reportTab="archived" />,
  },
  {
    path: '/reports/trash',
    component: () => <ReportList reportTab="deleted" />,
  },
  {
    path: '/reports/:id/edit',
    component: () => <EditReport />,
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
