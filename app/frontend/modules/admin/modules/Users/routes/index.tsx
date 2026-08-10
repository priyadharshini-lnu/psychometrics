import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('users', () => import('./UserList'))

const userList = (userTab: string) => page(({ default: UserList }) => () => <UserList userTab={userTab} />)

const RegularUsers = userList('Users::Regular')
const AdminUsers = userList('Users::Admin')
const SuperAdminUsers = userList('Users::SuperAdmin')
const GlobalAssessors = userList('Users::GlobalAssessors')

const UserRoutes = [
  {
    path: 'users',
    children: [
      { index: true, element: <Navigate to="users" replace /> },
      { path: 'users', element: <RegularUsers /> },
      { path: 'admins', element: <AdminUsers /> },
      { path: 'superadmins', element: <SuperAdminUsers /> },
      { path: 'global-assessors', element: <GlobalAssessors /> },
    ],
  },
]

export default UserRoutes
