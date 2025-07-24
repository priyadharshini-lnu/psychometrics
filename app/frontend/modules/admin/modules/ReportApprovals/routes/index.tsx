import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const MyTasks = lazy(() => import('./MyTasks'))
const Approved = lazy(() => import('./Approved'))
const All = lazy(() => import('./All'))


const routes = [
  { redirect: true, from: '', to: 'my_tasks' },
  { path: '/my_tasks', component: <MyTasks /> },
  { path: '/approved', component: <Approved /> },
  { path: '/all', component: <All /> },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const ReportApprovalsRoutes = [
  {
    path: 'report_approvals/*',
    element: <Layout />,
  },
]

export default ReportApprovalsRoutes
