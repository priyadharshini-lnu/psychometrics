import IdpList from './IdpList'
import Settings from './Settings'

export const routes = [
  {
    redirect: true,
    from: '/',
    to: 'templates',
  },
  {
    path: '/templates',
    component: <IdpList />,
  },
  {
    path: '/settings',
    component: <Settings />,
  },
]
