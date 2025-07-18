import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const AiAssistantList = lazy(() => import('./AiAssistantList'))
const AiAssistantPlayground = lazy(() => import('./AiAssistantPlayground'))

export const routes = [
  {
    path: '',
    component: <AiAssistantList />,
  },
  {
    path: '/:aiAssistantId/playground',
    component: <AiAssistantPlayground />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const AiAssistantRoutes = [
  {
    path: 'ai_assistants/*',
    element: <Layout />,
  },
]

export default AiAssistantRoutes
