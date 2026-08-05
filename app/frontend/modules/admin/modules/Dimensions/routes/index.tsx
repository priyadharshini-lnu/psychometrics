import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('dimensions', () => import('../pages'))

const DimensionsList = page(m => m.DimensionsList)
const SubFactorsList = page(m => m.SubFactorsList)
const OccupationConditionSetsList = page(m => m.OccupationConditionSetsList)
const Dimension = page(m => m.Dimension)
const FactorsList = page(m => m.FactorsList)
const OccupationsList = page(m => m.OccupationsList)
const InnovationStylesList = page(m => m.InnovationStylesList)

const DimensionsRoutes = [
  {
    path: 'dimensions',
    children: [
      { index: true, element: <DimensionsList /> },
      { path: ':dimensionId/:slug/:tagId/factors', element: <SubFactorsList /> },
      {
        path: ':dimensionId/occupations/condition_sets',
        element: <OccupationConditionSetsList />,
      },
      {
        path: ':dimensionId',
        element: <Dimension />,
        children: [
          { index: true, element: <Navigate to="factors" replace /> },
          { path: 'factors', element: <FactorsList /> },
          { path: 'occupations', element: <OccupationsList /> },
          { path: 'innovation_styles', element: <InnovationStylesList /> },
        ],
      },
    ],
  },
]

export default DimensionsRoutes
