import { ReportApprovals } from './ReportApprovals'
import { MyTasks } from './MyTasks'
import { Approved } from './Approved'
import { All } from './All'

export const routes = [
  {
    path: '/',
    component: ReportApprovals,
    routes: [
      { path: '/my_tasks', component: MyTasks },
      { path: '/approved', component: Approved },
      { path: '/all', component: All },
    ],
  },
]
