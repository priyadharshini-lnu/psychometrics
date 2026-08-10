import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const WorkshopList = page(m => m.WorkshopList)
const Invites = page(m => m.Invites)

export const routes = [
  { index: true, element: <Navigate to="assessment_center" replace /> },
  { path: 'assessment_center', element: <WorkshopList /> },
  // Invites reads the tab off the url, so requests and invites share one route.
  { path: ':tab', element: <Invites /> },
]
