import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const ReportApprovalsRoutes = [
  {
    path: 'report_approvals',
    children: [
      { index: true, element: <Navigate to="my_tasks" replace /> },
      { path: 'my_tasks', lazy: lazyRoute(page, m => m.MyTasks) },
      { path: 'approved', lazy: lazyRoute(page, m => m.Approved) },
      { path: 'all', lazy: lazyRoute(page, m => m.All) },
    ],
  },
]

export default ReportApprovalsRoutes
