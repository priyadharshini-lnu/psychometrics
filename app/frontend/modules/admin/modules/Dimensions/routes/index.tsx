import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const DimensionsList = lazy(() => import('./DimensionsList'))
const DimensionComponent = lazy(() => import('./Dimension'))
const SubFactorsList = lazy(() => import('./SubFactorsList'))
const OccupationConditionSetsList = lazy(() => import('./OccupationConditionSetsList'))

const routes = [
  {
    path: '/',
    component: <DimensionsList />,
  },
  {
    path: '/:dimensionId/:slug/:tagId/factors',
    component: <SubFactorsList />,
  },
  {
    path: '/:dimensionId/occupations/condition_sets',
    component: <OccupationConditionSetsList />,
  },
  {
    path: '/:dimensionId/*',
    component: <DimensionComponent />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const DimensionsRoutes = [
  {
    path: 'dimensions/*',
    element: <Layout />,
  },
]


export default DimensionsRoutes
