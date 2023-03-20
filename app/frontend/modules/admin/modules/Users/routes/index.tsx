import { UserList } from './UserList'

const routes = [
  { redirect: true, from: '', to: '/users' },
  {
    path: '/users',
    component: () => <UserList userRole="Users::Regular" />,
  },
  {
    path: '/admins',
    component: () => <UserList userRole="Users::Admin" />,
  },
  {
    path: '/superadmins',
    component: () => <UserList userRole="Users::SuperAdmin" />,
  },
]

export default routes
