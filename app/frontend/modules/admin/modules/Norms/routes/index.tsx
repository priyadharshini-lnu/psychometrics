import { lazy } from 'react'

const NormsList = lazy(() => import('./NormsList'))
const NormsEditorList = lazy(() => import('./NormsEditorList'))

const routes = [
  {
    path: 'norms',
    element: <NormsList />,
  },
  {
    path: 'norms/:normId/editor',
    element: <NormsEditorList />,
  },
]

export default routes
