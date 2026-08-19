import React from 'react'
import { Button } from '@thetalententerprise/glint'
import { Add } from '@thetalententerprise/glint/icons'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { CampaignTemplate } from '~/modules/admin/core/types/campaignTemplates'

const { I18n } = window

export const CampaignTemplatesFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<CampaignTemplate>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter name="filterable_fields">
      <Button type="primary" disabled={tableLoading} onClick={openModal} icon={<Add />}>
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
