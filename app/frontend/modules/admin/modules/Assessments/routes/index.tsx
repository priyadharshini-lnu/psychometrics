import { lazy } from 'react'

const EditAssessment = lazy(() => import('./EditAssessment'))
const AssessmentList = lazy(() => import('./AssessmentList'))


const routes = [
  { redirect: true, from: '/assessments', to: '/assessments/active' },
  {
    path: '/assessments/active',
    component: () => <AssessmentList assessmentTab="active" />,
  },
  {
    path: '/assessments/archived',
    component: () => <AssessmentList assessmentTab="archived" />,
  },
  {
    path: '/assessments/trash',
    component: () => <AssessmentList assessmentTab="deleted" />,
  },
  {
    path: '/assessments/:id/edit',
    component: () => <EditAssessment />,
  },
]

export default routes
