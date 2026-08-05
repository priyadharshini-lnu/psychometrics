import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('aiAssitant', () => import('../pages'))

const AiAssistantList = page(m => m.AiAssistantList)
const CreateAiAssistant = page(m => m.CreateAiAssistant)
const AiAssistantPlayground = page(m => m.AiAssistantPlayground)
const EditAiAssistant = page(m => m.EditAiAssistant)

const AiAssistantRoutes = [
  {
    path: 'ai_assistants',
    children: [
      { index: true, element: <AiAssistantList /> },
      { path: 'create', element: <CreateAiAssistant /> },
      { path: ':aiAssistantId/playground', element: <AiAssistantPlayground /> },
      { path: ':aiAssistantId/edit', element: <EditAiAssistant /> },
    ],
  },
]

export default AiAssistantRoutes
