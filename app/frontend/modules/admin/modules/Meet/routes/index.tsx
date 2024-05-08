import { lazy } from 'react'

const routes = [
  { redirect: true, from: '/meet', to: '/meet/create' },
  {
    path: '/meet/create',
    component: () => <div>create</div>,
  },
  {
    path: '/meet/:roomId',
    component: lazy(() => import('./MeetingRoom')),
  },
]

export default routes
