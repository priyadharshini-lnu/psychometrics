import { lazy } from 'react'

const routes = [
  { redirect: true, from: '/reports', to: '/reports/active' },
  {
    path: '/reports/active',
    component: lazy(() => import('./ReportList/routes/ReportList')),
  },
  {
    path: '/reports/archived',
    component: lazy(() => import('./ReportList/routes/ReportList')),
  },
  {
    path: '/reports/trash',
    component: lazy(() => import('./ReportList/routes/ReportList')),
  },
  {
    path: '/reports/:id/edit',
    component: lazy(() => import('./ReportList/routes/EditReport')),
  },
  {
    path: '/report_families',
    component: lazy(() => import('./ReportBundleList')),
  },
  {
    path: '/report_families/:id/reports',
    component: lazy(() => import('./ReportBundleReportList')),
  },
]

export default routes
