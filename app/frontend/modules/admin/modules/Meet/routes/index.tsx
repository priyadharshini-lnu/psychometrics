import MeetingRoom from './MeetingRoom'

const routes = [
  { redirect: true, from: '/meet', to: '/meet/create' },
  {
    path: '/meet/create',
    component: () => <div>create</div>,
  },
  {
    path: '/meet/:roomId',
    component: () => <MeetingRoom />,
  },
]

export default routes
