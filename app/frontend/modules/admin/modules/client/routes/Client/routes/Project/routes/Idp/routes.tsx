import IdpList from './IdpList'

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
]
