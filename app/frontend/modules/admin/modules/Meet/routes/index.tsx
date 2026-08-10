import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('meet', () => import('./MeetingRoom'))

const MeetingRoom = page(m => m.default)

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
