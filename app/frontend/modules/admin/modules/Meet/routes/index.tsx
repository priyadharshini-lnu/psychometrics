import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./MeetingRoom')

const routes = [
  {
    path: 'meet/create',
    element: <div>create</div>,
  },
  {
    path: 'meet/:roomId',
    lazy: lazyRoute(page, m => m.default),
  },
]

export default routes
