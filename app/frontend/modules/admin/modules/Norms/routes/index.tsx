import { lazy } from 'react'

const NormsList = lazy(() => import('./NormsList'))

const routes = [
  {
    path: 'norms',
    element: <NormsList />,
  },
]

export default routes
