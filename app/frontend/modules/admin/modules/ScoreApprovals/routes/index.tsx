import { lazy } from 'react'
import RouteList from '~/components/RouteList'
import { ScoreReview } from './ScoreReview'

const MyTasks = lazy(() => import('./MyTasks'))
const Approved = lazy(() => import('./Approved'))
const All = lazy(() => import('./All'))


const routes = [
  { redirect: true, from: '', to: 'my_tasks' },
  { path: '/my_tasks', component: <MyTasks /> },
  { path: '/approved', component: <Approved /> },
  { path: '/all', component: <All /> },
  { path: '/:id/review', component: <ScoreReview /> },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const ScoreApprovalsRoutes = [
  {
    path: 'ai_scoring_approvals/*',
    element: <Layout />,
  },
]

export default ScoreApprovalsRoutes
