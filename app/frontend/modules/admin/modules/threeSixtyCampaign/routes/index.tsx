import { Navigate } from 'react-router-dom'
import {
  routes as aiArtifactsRoutes,
} from '~/modules/admin/modules/campaigns/routes/Campaign/routes/AIArtifacts/routes'
import { lazyRoute } from '~/utils/lazyRoute'
import { routes as messagesRoutes } from './Messages/routes'
import { routes as participantsRoutes } from './Participants/routes'
import { routes as reportsRoutes } from './Reports/routes'

const page = () => import('../pages')

// The standalone Rails entrypoint's table; the admin SPA merges these paths into the common campaign table instead.
const routes = [
  { index: true, element: <Navigate to="participants" replace /> },
  { path: 'participants', lazy: lazyRoute(page, m => m.Participants), children: participantsRoutes },
  { path: 'messages', lazy: lazyRoute(page, m => m.Messages), children: messagesRoutes },
  { path: 'admins', lazy: lazyRoute(page, m => m.Admins) },
  { path: 'reports', lazy: lazyRoute(page, m => m.Reports), children: reportsRoutes },
  { path: 'datasheet', lazy: lazyRoute(page, m => m.Datasheet) },
  { path: 'ai_artifacts', lazy: lazyRoute(page, m => m.AIArtifacts), children: aiArtifactsRoutes },
]

export default routes
