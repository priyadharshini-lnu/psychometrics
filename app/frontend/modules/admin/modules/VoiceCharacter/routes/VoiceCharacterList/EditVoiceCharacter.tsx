import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Spin } from '@thetalententerprise/glint'
import { useResources } from '~/hooks/useResources/useResources'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { VoiceCharacterTR, VoiceCharacter } from '../../core/voiceCharacter'
import VoiceCharacterForm from './VoiceCharacterForm'

const { I18n } = window

const EditVoiceCharacter = () => {
  const { voiceCharacterId } = useParams() as { voiceCharacterId: string }
  const config = {
    basePath: '/ai',
    responseType: VoiceCharacterTR,
    apiConfig: {
      include: ['tenant'],
    },
  }
  const { getResource, fetchSingle, isLoading } = useResources<VoiceCharacter>('voice_characters', config)

  useEffect(() => {
    if (voiceCharacterId) {
      fetchSingle({ id: voiceCharacterId })
    }
  }, [voiceCharacterId])

  const voiceCharacter = getResource(voiceCharacterId)

  return (
    isLoading('fetch') || !voiceCharacter ? <Spin size="large" />
      : (
        <>
          <Breadcrumb
            crumbs={[
              {
                link: () => '/admin',
                label: () => I18n.t('admin.dashboard'),
              },
              {
                link: () => '/admin/ai_voice_characters',
                label: () => I18n.t('admin.voice_characters'),
              },
              {
                label: () => voiceCharacter?.name,
              },
              {
                label: () => I18n.t('admin.edit_voice_character'),
              },
            ]}
          />
          <VoiceCharacterForm voiceCharacter={voiceCharacter} />
        </>
      )
  )
}

export default EditVoiceCharacter
