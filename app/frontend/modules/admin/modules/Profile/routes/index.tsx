import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const Profile = lazy(() => import('./Details'))
const ChangePassword = lazy(() => import('./ChangePassword'))

const routes = [
  { redirect: true, from: '/', to: 'details' },
  {
    path: '/details',
    component: <Profile />,
  },
  {
    path: '/change_password',
    component: <ChangePassword />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const ProfileRoutes = [
  {
    path: '/profile/*',
    component: <Layout />,
  },
]

export default ProfileRoutes
