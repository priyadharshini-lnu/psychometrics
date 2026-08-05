import { Navigate } from 'react-router-dom'
import {
  routes as aiArtifactsRoutes,
} from '~/modules/admin/modules/campaigns/routes/Campaign/routes/AIArtifacts/routes'
import { lazyPages } from '~/utils/lazyPages'
import { routes as messagesRoutes } from './Messages/routes'
import { routes as participantsRoutes } from './Participants/routes'
import { routes as reportsRoutes } from './Reports/routes'

const page = lazyPages('threeSixtyCampaign', () => import('../pages'))

const Participants = page(m => m.Participants)
const Messages = page(m => m.Messages)
const Admins = page(m => m.Admins)
const Reports = page(m => m.Reports)
const Datasheet = page(m => m.Datasheet)
const AIArtifacts = page(m => m.AIArtifacts)

const routes = [
  { index: true, element: <Navigate to="participants" replace /> },
  { path: 'participants', element: <Participants />, children: participantsRoutes },
  { path: 'messages', element: <Messages />, children: messagesRoutes },
  { path: 'admins', element: <Admins /> },
  { path: 'reports', element: <Reports />, children: reportsRoutes },
  { path: 'datasheet', element: <Datasheet /> },
  // The page is shared with the common campaign module, so it is mounted with the same children.
  { path: 'ai_artifacts', element: <AIArtifacts />, children: aiArtifactsRoutes },
]

export default routes
