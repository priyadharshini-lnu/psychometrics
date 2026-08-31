import React, { useState } from 'react'
import { CampaignTemplate, CampaignTemplateTR } from '~/modules/admin/core/types/campaignTemplates'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { CampaignTemplatesFormModal } from './CampaignTemplatesFormModal'
import { CampaignTemplatesTable } from './CampaignTemplatesTable'
import { CampaignTemplatesFilter } from './CampaignTemplatesFilter'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

const CampaignTemplatesList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCampaignTemplate, setSelectedCampaignTemplate] = useState<CampaignTemplate>()
  const config = {
    trackUrl: true,
    responseType: CampaignTemplateTR,
    apiConfig: {
      include: ['owner', 'assessment', 'report', 'campaign'],
    },
  }
  const openModal = (campaignTemplate: CampaignTemplate) => {
    setSelectedCampaignTemplate(campaignTemplate)
    setIsModalOpen(true)
  }
  return (
    <>
      <DocumentTitle text={I18n.t('admin.campaign_templates')} />
      <Resource
        title={I18n.t('admin.campaign_templates')}
        config={config}
        name="campaign_templates"
        settingsKey={TABLE_SETTINGS_KEYS.adminCampaignTemplates}
      >
        <CampaignTemplatesFilter openModal={() => setIsModalOpen(true)} />
        <CampaignTemplatesTable openModal={openModal} />
        {isModalOpen && (
          <CampaignTemplatesFormModal
            campaignTemplate={selectedCampaignTemplate}
            close={() => {
              setSelectedCampaignTemplate(undefined)
              setIsModalOpen(false)
            }}
          />
        )}
      </Resource>
    </>
  )
}

export default CampaignTemplatesList
