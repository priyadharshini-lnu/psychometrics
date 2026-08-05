import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const SubjectScoresList = page(m => m.SubjectScoresList)
const ScoringGroups = page(m => m.ScoringGroups)
const Weightages = page(m => m.Weightages)

export const routes = [
  { index: true, element: <Navigate to="subject_scores" replace /> },
  { path: 'subject_scores', element: <SubjectScoresList /> },
  { path: 'settings', element: <ScoringGroups /> },
  { path: 'settings/weightages', element: <Weightages /> },
]
