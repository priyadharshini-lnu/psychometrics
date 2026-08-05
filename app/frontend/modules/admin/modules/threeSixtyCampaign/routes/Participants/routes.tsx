import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('threeSixtyCampaign', () => import('~/modules/admin/modules/threeSixtyCampaign/pages'))

const ParticipantsOptions = page(m => m.ParticipantsOptions)
const SubjectList = page(m => m.SubjectList)
const EvaluatorList = page(m => m.EvaluatorList)
const ManagerList = page(m => m.ManagerList)

// The tab bar and the redux tab key both read these.
export const TABS = ['subjects', 'evaluators', 'managers', 'options']

export const routes = [
  { index: true, element: <Navigate to="subjects" replace /> },
  { path: 'options', element: <ParticipantsOptions /> },
  { path: 'subjects', element: <SubjectList /> },
  { path: 'evaluators', element: <EvaluatorList /> },
  { path: 'managers', element: <ManagerList /> },
]
