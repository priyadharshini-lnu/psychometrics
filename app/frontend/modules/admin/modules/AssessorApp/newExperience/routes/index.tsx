import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const AssessorEvaluation = lazy(() => import('./AssessorEvaluation/AssessorEvaluation'))
const AssessmentCenter = lazy(() => import('./AssessmentCenter/AssessmentCenter'))
const CampaignUsers = lazy(() => import('./CampaignUsers/CampaignUsers'))
const UserDetails = lazy(() => import('./UserDetails/UserDetails'))

const routes = [
  {
    path: '',
    element: <Navigate to="evaluation" replace />,
  },
  {
    path: 'evaluation',
    element: <AssessorEvaluation />,
  },
  {
    path: 'assessment_centers',
    element: <AssessmentCenter />,
  },
  {
    path: 'evaluation/campaigns/:campaignId/users',
    element: <CampaignUsers />,
  },
  {
    path: 'evaluation/campaigns/:campaignId/users/:userId',
    element: <UserDetails />,
  },
]

export default routes
