import React from 'react'
import { VoiceCharacterTR } from '~/modules/admin/modules/VoiceCharacter/core/voiceCharacter'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { DocumentTitle } from '~/components/DocumentTitle'
import { VoiceCharactersTable } from './VoiceCharactersTable'
import { VoiceCharactersFilter } from './VoiceCharacterFilter'

const { I18n } = window

const VoiceCharacterList: React.FC = () => {
  const config = {
    basePath: '/ai',
    responseType: VoiceCharacterTR,
    apiConfig: {
      include: ['tenant'],
    },
  }

  return (
    <>
      <DocumentTitle text={I18n.t('admin.voice_characters')} />
      <Resource
        title={I18n.t('admin.voice_characters')}
        config={config}
        name="voice_characters"
        settingsKey={TABLE_SETTINGS_KEYS.adminVoiceCharacters}
      >
        <VoiceCharactersFilter />
        <VoiceCharactersTable />
      </Resource>
    </>
  )
}

export default VoiceCharacterList
