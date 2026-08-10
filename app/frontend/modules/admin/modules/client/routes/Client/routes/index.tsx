import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('client', () => import('~/modules/admin/modules/client/pages'))
const dataReportPage = lazyPages('dataReports', () => import('~/modules/admin/modules/DataReports/pages'))

const ProjectList = page(m => m.ProjectList)
const ClientAdmins = page(m => m.ClientAdmins)
const ClientAssessors = page(m => m.ClientAssessors)
const ClientSettings = page(m => m.ClientSettings)
const ClientDataExports = page(m => m.ClientDataExports)
const ClientLicenseList = page(m => m.ClientLicenseList)
const ClientDataReports = page(m => m.ClientDataReports)
const DataReportJobs = dataReportPage(m => m.DataReportJobs)

export const routes = [
  { index: true, element: <Navigate to="projects" replace /> },
  { path: 'projects', element: <ProjectList /> },
  { path: 'admins', element: <ClientAdmins /> },
  { path: 'assessors', element: <ClientAssessors /> },
  // Settings matches its own permission dependent tabs with useRoutes, so it keeps the splat.
  { path: 'settings/*', element: <ClientSettings /> },
  { path: 'audit_reports', element: <ClientDataExports /> },
  { path: 'licenses', element: <ClientLicenseList /> },
  { path: 'data_reports', element: <ClientDataReports /> },
  { path: 'data_reports/:id', element: <DataReportJobs /> },
]
