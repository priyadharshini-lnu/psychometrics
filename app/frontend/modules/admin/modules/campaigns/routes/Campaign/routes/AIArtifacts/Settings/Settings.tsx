import React from 'react'
import { useParams } from 'react-router'
import Modals from '~/modules/admin/components/Modals'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { SettingsTable } from './SettingsTable'
import { SettingsFilter } from './SettingsFilter'
import { SettingsDrawer } from './SettingsDrawer'
import { AiArtifact } from '~/modules/admin/modules/campaigns/core/aiArtifacts'
import { AIArtifactsImportModal } from './AIArtifactsImportModal'

const { I18n } = window

const MODALS = {
  AIArtifactsImportModal,
}
const Settings: React.FC = () => {
  const { campaignId } = useParams()
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [selectedAiArtifact, setSelectedAiArtifact] = React.useState<AiArtifact | undefined>(undefined)

  const config = {
    trackUrl: true,
    apiConfig: {
      include: ['ai_assistant'],
      include_meta: ['permissions'],
      include_resource_meta: ['permissions'],
    },
    basePath: `campaigns/${campaignId}`,
  }

  const handleOpenDrawer = (aiArtifact?: AiArtifact) => {
    setIsDrawerOpen(true)
    if (aiArtifact) {
      setSelectedAiArtifact(aiArtifact)
    }
  }

  const handleCloseDrawer = () => {
    setSelectedAiArtifact(undefined)
    setIsDrawerOpen(false)
  }

  return (
    <>
      <Resource
        title={I18n.t('admin.tabs_settings')}
        config={config}
        name="ai_artifacts"
        settingsKey={TABLE_SETTINGS_KEYS.campaignAiArtifactsSettings}
      >
        <SettingsFilter onCreateAIArtifact={handleOpenDrawer} />
        <SettingsTable onEditAIArtifact={handleOpenDrawer} />
        <SettingsDrawer
          onClose={handleCloseDrawer}
          isOpen={isDrawerOpen}
          aiArtifact={selectedAiArtifact}
        />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default Settings
