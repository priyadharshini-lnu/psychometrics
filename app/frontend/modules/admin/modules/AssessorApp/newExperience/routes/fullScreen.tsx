import { lazy } from 'react'

// Routes that own the full viewport — no AdminShell, no sider, no top bar.
// Paths must be absolute because these are mounted beside the shell route, not under it.

const ModerateScoring = lazy(() => import('./ModerateScoring/ModerateScoring'))
const Evaluation = lazy(() => import('./Evaluation/Evaluation'))

const fullScreenRoutes = [
  {
    path: '/assessors/evaluation/campaigns/:campaignId/moderate_scoring/:userId',
    element: <ModerateScoring />,
  },
  {
    path: '/assessors/evaluation/campaigns/:campaignId/evaluations/:userId',
    element: <Evaluation />,
  },
]

export default fullScreenRoutes
