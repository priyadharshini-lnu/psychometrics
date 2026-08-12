import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const ProfileRoutes = [
  {
    path: 'profile',
    children: [
      { index: true, element: <Navigate to="details" replace /> },
      { path: 'details', lazy: lazyRoute(page, m => m.Details) },
      { path: 'change_password', lazy: lazyRoute(page, m => m.ChangePassword) },
    ],
  },
]

export default ProfileRoutes
