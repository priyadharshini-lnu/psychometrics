import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const UserList = lazy(() => import('./UserList'))

const RegularUserList = () => <UserList userTab="Users::Regular" />
const AdminUserList = () => <UserList userTab="Users::Admin" />
const SuperAdminUserList = () => <UserList userTab="Users::SuperAdmin" />
const GlobalAssessorUserList = () => <UserList userTab="Users::GlobalAssessors" />

export const routes = [
  { redirect: true, from: '', to: 'users' },
  {
    path: '/users',
    component: <RegularUserList />,
  },
  {
    path: '/admins',
    component: <AdminUserList />,
  },
  {
    path: '/superadmins',
    component: <SuperAdminUserList />,
  },
  {
    path: '/global-assessors',
    component: <GlobalAssessorUserList />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const UserRoutes = [
  {
    path: 'users/*',
    element: <Layout />,
  },
]

export default UserRoutes
