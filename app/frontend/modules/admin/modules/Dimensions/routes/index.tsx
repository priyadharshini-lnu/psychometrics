import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const DimensionsRoutes = [
  {
    path: 'dimensions',
    children: [
      { index: true, lazy: lazyRoute(page, m => m.DimensionsList) },
      { path: ':dimensionId/:slug/:tagId/factors', lazy: lazyRoute(page, m => m.SubFactorsList) },
      {
        path: ':dimensionId/occupations/condition_sets',
        lazy: lazyRoute(page, m => m.OccupationConditionSetsList),
      },
      {
        path: ':dimensionId',
        lazy: lazyRoute(page, m => m.Dimension),
        children: [
          { index: true, element: <Navigate to="factors" replace /> },
          { path: 'factors', lazy: lazyRoute(page, m => m.FactorsList) },
          { path: 'occupations', lazy: lazyRoute(page, m => m.OccupationsList) },
          { path: 'innovation_styles', lazy: lazyRoute(page, m => m.InnovationStylesList) },
        ],
      },
    ],
  },
]

export default DimensionsRoutes
