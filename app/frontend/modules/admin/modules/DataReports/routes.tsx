import { lazy } from 'react'
import { DataReportJobs } from '~/modules/admin/modules/client/routes/Client/routes/DataReports/DataReportJobs'

const DataReports = lazy(() => import('./DataReports'))


export const DataReportsRoutes = [
  {
    path: 'data_reports',
    element: <DataReports />,
  },
  {
    path: 'data_reports/:id',
    element: <DataReportJobs />,
  },
]
