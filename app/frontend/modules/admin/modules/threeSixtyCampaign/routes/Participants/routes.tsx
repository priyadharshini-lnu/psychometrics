import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('~/modules/admin/modules/threeSixtyCampaign/pages')

// The tab bar and the redux tab key both read these.
export const TABS = ['subjects', 'evaluators', 'managers', 'options']

export const routes = [
  { index: true, element: <Navigate to="subjects" replace /> },
  { path: 'options', lazy: lazyRoute(page, m => m.ParticipantsOptions) },
  { path: 'subjects', lazy: lazyRoute(page, m => m.SubjectList) },
  { path: 'evaluators', lazy: lazyRoute(page, m => m.EvaluatorList) },
  { path: 'managers', lazy: lazyRoute(page, m => m.ManagerList) },
]
