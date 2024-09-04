import React, { useState } from 'react'
import { CampaignTemplate, CampaignTemplateTR } from '~/modules/admin/core/types/campaignTemplates'
import { Resource } from '~/modules/admin/components/Resource'
import { CampaignTemplatesBreadcrumb } from './CampaignTemplatesBreadcrumb'
import { CampaignTemplatesFormModal } from './CampaignTemplatesFormModal'
import { CampaignTemplatesTable } from './CampaignTemplatesTable'
import { CampaignTemplatesFilter } from './CampaignTemplatesFilter'

const CampaignTemplatesList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCampaignTemplate, setSelectedCampaignTemplate] = useState<CampaignTemplate>()
  const config = {
    trackUrl: true,
    responseType: CampaignTemplateTR,
    apiConfig: {
      include: ['owner', 'assessment', 'report'],
    },
  }
  const openModal = (campaignTemplate: CampaignTemplate) => {
    setSelectedCampaignTemplate(campaignTemplate)
    setIsModalOpen(true)
  }
  return (
    <>
      <Resource config={config} name="campaign_templates">
        <CampaignTemplatesBreadcrumb />
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
