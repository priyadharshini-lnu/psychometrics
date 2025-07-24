import { lazy } from 'react'

const DevelopmentActionList = lazy(() => import('../components/DevelopmentActionList/DevelopmentActionList'))
const DevelopmentActionRoutes = [
  {
    path: 'development_actions/*',
    element: <DevelopmentActionList />,
  },
]

export default DevelopmentActionRoutes
