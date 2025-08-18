import React from 'react'
import { useParams } from 'react-router'
import { Resource } from '~/modules/admin/components/Resource'
import { SettingsTable } from './SettingsTable'
import { SettingsFilter } from './SettingsFilter'
import { SettingsFormDrawer } from './SettingsFormDrawer'
import { AiArtifact } from '~/modules/admin/modules/campaigns/core/aiArtifacts'


const Settings: React.FC = () => {
  const { campaignId } = useParams()
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [selectedAiArtifact, setSelectedAiArtifact] = React.useState<AiArtifact | undefined>(undefined)

  const config = {
    trackUrl: true,
    apiConfig: {
      include: ['ai_assistant'],
    },
    basePath: `/campaigns/${campaignId}`,
  }

  const handleOpenDrawer = (aiArtifact?: AiArtifact) => {
    setIsDrawerOpen(true)
    if (aiArtifact) {
      setSelectedAiArtifact(aiArtifact)
    }
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedAiArtifact(undefined)
  }

  return (
    <>
      <Resource config={config} name="ai_artifacts">
        <SettingsFilter onCreateAIArtifact={handleOpenDrawer} />
        <SettingsTable onEditAIArtifact={handleOpenDrawer} />
        <SettingsFormDrawer
          onClose={handleCloseDrawer}
          isOpen={isDrawerOpen}
          aiArtifact={selectedAiArtifact}
        />
      </Resource>
    </>
  )
}

export default Settings
