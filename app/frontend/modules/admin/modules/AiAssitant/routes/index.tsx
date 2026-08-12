import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const AiAssistantRoutes = [
  {
    path: 'ai_assistants',
    children: [
      { index: true, lazy: lazyRoute(page, m => m.AiAssistantList) },
      { path: 'create', lazy: lazyRoute(page, m => m.CreateAiAssistant) },
      { path: ':aiAssistantId/playground', lazy: lazyRoute(page, m => m.AiAssistantPlayground) },
      { path: ':aiAssistantId/edit', lazy: lazyRoute(page, m => m.EditAiAssistant) },
    ],
  },
]

export default AiAssistantRoutes
