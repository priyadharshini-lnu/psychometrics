import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./UserList')

const UserRoutes = [
  {
    path: 'users',
    children: [
      { index: true, element: <Navigate to="users" replace /> },
      {
        lazy: lazyRoute(page, m => m.UsersLayout),
        children: [
          { path: 'users', lazy: lazyRoute(page, m => m.RegularUsers) },
          { path: 'admins', lazy: lazyRoute(page, m => m.AdminUsers) },
          { path: 'superadmins', lazy: lazyRoute(page, m => m.SuperAdminUsers) },
          { path: 'global-assessors', lazy: lazyRoute(page, m => m.GlobalAssessorUsers) },
        ],
      },
    ],
  },
]

export default UserRoutes
