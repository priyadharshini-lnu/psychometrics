import { lazy } from 'react'

const Profile = lazy(() => import('./Details'))
const ChangePassword = lazy(() => import('./ChangePassword'))

const routes = [
  { redirect: true, from: '/profile', to: '/profile/details' },
  {
    path: '/profile/details',
    component: Profile,
  },
  {
    path: '/profile/change_password',
    component: ChangePassword,
  },
]

export default routes
