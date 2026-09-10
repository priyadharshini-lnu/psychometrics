import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('~/modules/admin/modules/client/pages')
const dataReportPage = () => import('~/modules/admin/modules/DataReports/pages')

export const routes = [
  { index: true, element: <Navigate to="projects" replace /> },
  { path: 'projects', lazy: lazyRoute(page, m => m.ProjectList) },
  { path: 'admins', lazy: lazyRoute(page, m => m.ClientAdmins) },
  { path: 'assessors', lazy: lazyRoute(page, m => m.ClientAssessors) },
  // Settings matches its own permission dependent tabs with useRoutes, so it keeps the splat.
  { path: 'settings/*', lazy: lazyRoute(page, m => m.ClientSettings) },
  { path: 'communication_center', lazy: lazyRoute(page, m => m.ClientCommunicationCenter) },
  { path: 'audit_reports', lazy: lazyRoute(page, m => m.ClientDataExports) },
  { path: 'licenses', lazy: lazyRoute(page, m => m.ClientLicenseList) },
  { path: 'data_reports', lazy: lazyRoute(page, m => m.ClientDataReports) },
  { path: 'data_reports/:id', lazy: lazyRoute(dataReportPage, m => m.DataReportJobs) },
]
