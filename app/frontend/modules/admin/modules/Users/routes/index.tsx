import { UserList } from './UserList'
import { APIKeysList } from './APIKeysList'

const routes = [
  { redirect: true, from: '', to: '/users' },
  {
    path: '/users',
    component: () => <UserList userTab="Users::Regular" />,
  },
  {
    path: '/admins',
    component: () => <UserList userTab="Users::Admin" />,
  },
  {
    path: '/superadmins',
    component: () => <UserList userTab="Users::SuperAdmin" />,
  },
  {
    path: '/admins/:adminId/api_keys',
    component: () => <APIKeysList />,
  },
]

export default routes
