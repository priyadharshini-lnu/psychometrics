import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('dataReports', () => import('./pages'))

const DataReports = page(m => m.DataReports)
const DataReportJobs = page(m => m.DataReportJobs)

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
