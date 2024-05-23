import { lazy } from 'react'

const MyTasks = lazy(() => import('./MyTasks'))
const Approved = lazy(() => import('./Approved'))
const All = lazy(() => import('./All'))


const routes = [
  { redirect: true, from: '/', to: '/report_approvals' },
  { path: '/report_approvals/my_tasks', component: MyTasks },
  { path: '/report_approvals/approved', component: Approved },
  { path: '/report_approvals/all', component: All },
]

export default routes
