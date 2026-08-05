import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('scoreApprovals', () => import('../pages'))

const MyTasks = page(m => m.MyTasks)
const Approved = page(m => m.Approved)
const All = page(m => m.All)
const ScoreReview = page(m => m.ScoreReview)

const ScoreApprovalsRoutes = [
  {
    path: 'ai_scoring_approvals',
    children: [
      { index: true, element: <Navigate to="my_tasks" replace /> },
      { path: 'my_tasks', element: <MyTasks /> },
      { path: 'approved', element: <Approved /> },
      { path: 'all', element: <All /> },
      { path: ':id/review', element: <ScoreReview /> },
    ],
  },
]

export default ScoreApprovalsRoutes
