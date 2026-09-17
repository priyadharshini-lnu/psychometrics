import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const VoiceCharacterRoutes = [
  {
    path: 'ai_voice_characters',
    children: [
      { index: true, lazy: lazyRoute(page, m => m.VoiceCharacterList) },
      { path: 'create', lazy: lazyRoute(page, m => m.CreateVoiceCharacter) },
      { path: ':voiceCharacterId/edit', lazy: lazyRoute(page, m => m.EditVoiceCharacter) },
    ],
  },
]

export default VoiceCharacterRoutes
