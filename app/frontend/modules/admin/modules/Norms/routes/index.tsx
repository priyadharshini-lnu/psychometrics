import { lazy } from 'react'

const NormsList = lazy(() => import('./NormsList'))

const routes = [
  { redirect: true, from: '/', to: '/norms' },
  {
    path: '/norms',
    component: <NormsList />,
  },
]

export default routes
