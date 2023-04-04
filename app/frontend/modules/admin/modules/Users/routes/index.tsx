import { UserList } from './UserList'

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
]

export default routes
