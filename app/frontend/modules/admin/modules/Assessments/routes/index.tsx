import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('assessments', () => import('../pages'))

const assessmentList = (assessmentTab: string) => (
  page(({ AssessmentList }) => () => <AssessmentList assessmentTab={assessmentTab} />)
)

const ActiveAssessments = assessmentList('active')
const ArchivedAssessments = assessmentList('archived')
const TrashedAssessments = assessmentList('deleted')
const EditAssessment = page(m => m.EditAssessment)

const AssessmentRoutes = [
  {
    path: 'assessments',
    children: [
      { index: true, element: <Navigate to="active" replace /> },
      { path: 'active', element: <ActiveAssessments /> },
      { path: 'archived', element: <ArchivedAssessments /> },
      { path: 'trash', element: <TrashedAssessments /> },
      { path: ':id/edit', element: <EditAssessment /> },
    ],
  },
]

export default AssessmentRoutes
