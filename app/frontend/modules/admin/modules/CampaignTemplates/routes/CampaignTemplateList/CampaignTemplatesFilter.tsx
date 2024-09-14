import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
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
      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
