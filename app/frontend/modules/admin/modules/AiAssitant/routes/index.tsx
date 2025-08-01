import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const AiAssistantList = lazy(() => import('./AiAssistantList'))
const AiAssistantPlayground = lazy(() => import('./AiAssistantPlayground'))
const CreateAiAssistant = lazy(() => import('./AiAssistantList/CreateAiAssistant'))
const EditAiAssistant = lazy(() => import('./AiAssistantList/EditAiAssistant'))

export const routes = [
  {
    path: '',
    component: <AiAssistantList />,
  },
  {
    path: '/:aiAssistantId/playground',
    component: <AiAssistantPlayground />,
  },
  {
    path: '/create',
    component: <CreateAiAssistant />,
  },
  {
    path: '/:aiAssistantId/edit',
    component: <EditAiAssistant />,
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
