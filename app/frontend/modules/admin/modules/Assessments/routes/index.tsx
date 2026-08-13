import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const AssessmentRoutes = [
  {
    path: 'assessments',
    children: [
      { index: true, element: <Navigate to="active" replace /> },
      {
        lazy: lazyRoute(page, m => m.AssessmentsLayout),
        children: [
          { path: 'active', lazy: lazyRoute(page, m => m.ActiveAssessments) },
          { path: 'archived', lazy: lazyRoute(page, m => m.ArchivedAssessments) },
          { path: 'trash', lazy: lazyRoute(page, m => m.DeletedAssessments) },
        ],
      },
      { path: ':id/edit', lazy: lazyRoute(page, m => m.EditAssessment) },
    ],
  },
]

export default AssessmentRoutes
