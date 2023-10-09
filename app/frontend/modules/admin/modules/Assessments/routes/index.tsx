import { AssessmentList } from './AssessmentList'
import { EditAssessment } from './EditAssessment'

const routes = [
  { redirect: true, from: '', to: '/active' },
  {
    path: '/active',
    component: () => <AssessmentList assessmentTab="active" />,
  },
  {
    path: '/archived',
    component: () => <AssessmentList assessmentTab="archived" />,
  },
  {
    path: '/trash',
    component: () => <AssessmentList assessmentTab="deleted" />,
  },
  {
    path: '/:id/edit',
    component: () => <EditAssessment />,
  },
]

export default routes
