import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('reportApprovals', () => import('../pages'))

const MyTasks = page(m => m.MyTasks)
const Approved = page(m => m.Approved)
const All = page(m => m.All)

const ReportApprovalsRoutes = [
  {
    path: 'report_approvals',
    children: [
      { index: true, element: <Navigate to="my_tasks" replace /> },
      { path: 'my_tasks', element: <MyTasks /> },
      { path: 'approved', element: <Approved /> },
      { path: 'all', element: <All /> },
    ],
  },
]

export default ReportApprovalsRoutes
