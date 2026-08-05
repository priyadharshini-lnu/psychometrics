import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('profile', () => import('../pages'))

const Details = page(m => m.Details)
const ChangePassword = page(m => m.ChangePassword)

const ProfileRoutes = [
  {
    path: 'profile',
    children: [
      { index: true, element: <Navigate to="details" replace /> },
      { path: 'details', element: <Details /> },
      { path: 'change_password', element: <ChangePassword /> },
    ],
  },
]

export default ProfileRoutes
