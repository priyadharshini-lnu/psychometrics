import { UserList } from './UserList'
import { APIKeysList } from './APIKeysList'

const routes = [
  { redirect: true, from: '/users', to: '/users/users' },
  {
    path: '/users/users',
    component: () => <UserList userTab="Users::Regular" />,
  },
  {
    path: '/users/admins',
    component: () => <UserList userTab="Users::Admin" />,
  },
  {
    path: '/users/superadmins',
    component: () => <UserList userTab="Users::SuperAdmin" />,
  },
  {
    path: '/users/global-assessors',
    component: () => <UserList userTab="Users::GlobalAssessors" />,
  },
  {
    path: '/users/admins/:adminId/api_keys',
    component: () => <APIKeysList />,
  },
]

export default routes
