import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const EditAssessment = lazy(() => import('./EditAssessment'))
const AssessmentList = lazy(() => import('./AssessmentList'))

const ActiveAssessment = () => <AssessmentList assessmentTab="active" />
const ArchivedAssessment = () => <AssessmentList assessmentTab="archived" />
const TrashAssessment = () => <AssessmentList assessmentTab="deleted" />

const routes = [
  { redirect: true, from: '', to: 'active' },
  {
    path: '/active',
    component: <ActiveAssessment />,
  },
  {
    path: '/archived',
    component: <ArchivedAssessment />,
  },
  {
    path: '/trash',
    component: <TrashAssessment />,
  },
  {
    path: '/:id/edit',
    component: <EditAssessment />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const AssessmentRoutes = [
  {
    path: 'assessments/*',
    element: <Layout />,
  },
]

export default AssessmentRoutes
