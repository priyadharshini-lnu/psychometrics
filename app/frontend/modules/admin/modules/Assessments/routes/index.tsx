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
      { path: ':id/agiles', lazy: lazyRoute(page, m => m.AgileAssessmentBuilder) },
      {
        path: ':id',
        lazy: lazyRoute(page, m => m.BuilderLayout),
        children: [
          { index: true, lazy: lazyRoute(page, m => m.BuilderDashboard) },
          { path: 'scoring', lazy: lazyRoute(page, m => m.BuilderScoring) },
          { path: 'resources', lazy: lazyRoute(page, m => m.BuilderResources) },
        ],
      },
    ],
  },
]

export default AssessmentRoutes
