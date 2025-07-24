import { lazy } from 'react'

const DataReports = lazy(() => import('./DataReports'))


export const DataReportsRoutes = [
  {
    path: 'data_reports',
    element: <DataReports />,
  },
]
