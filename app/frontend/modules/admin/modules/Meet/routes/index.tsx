import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./MeetingRoom')

const routes = [
  {
    path: '/admin/meet/create',
    element: <div>create</div>,
  },
  {
    path: '/admin/meet/:roomId',
    lazy: lazyRoute(page, m => m.default),
  },
]

export default routes
