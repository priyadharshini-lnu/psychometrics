import { lazy } from 'react'

const CommunicationCenter = lazy(() => import('./CommunicationCenter'))

const CommunicationCenterRoutes = [
  {
    path: 'communication_center',
    element: <CommunicationCenter />,
  },
]

export default CommunicationCenterRoutes
