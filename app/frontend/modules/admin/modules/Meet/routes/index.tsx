import { lazy } from 'react'


const MeetingRoom = lazy(() => import('./MeetingRoom'))
const routes = [
  {
    path: 'meet/create',
    element: <div>create</div>,
  },
  {
    path: 'meet/:roomId',
    element: <MeetingRoom />,
  },
]

export default routes
