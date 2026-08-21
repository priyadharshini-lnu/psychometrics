import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./pages')

export const DataReportsRoutes = [
  {
    path: 'data_reports',
    lazy: lazyRoute(page, m => m.DataReports),
  },
  {
    path: 'data_reports/:id',
    lazy: lazyRoute(page, m => m.DataReportJobs),
  },
]
