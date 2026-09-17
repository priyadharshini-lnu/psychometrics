import React from 'react'
import { Button } from '@thetalententerprise/glint'
import { useNavigate } from 'react-router-dom'
import { Add } from '@thetalententerprise/glint/icons'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { VoiceCharacter } from '~/modules/admin/modules/VoiceCharacter/core/voiceCharacter'

const { I18n } = window

export const VoiceCharactersFilter: React.FC = () => {
  const { resource } = useResourceContext<VoiceCharacter>()
  const navigate = useNavigate()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter name="filterable_fields">
      <Button
        type="primary"
        disabled={tableLoading}
        onClick={() => navigate('/admin/ai_voice_characters/create')}
        icon={<Add />}
      >
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
