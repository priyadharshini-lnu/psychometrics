
import React from 'react'
import { Button } from 'antd'
import { ReportBundle } from 'modules/admin/modules/client/core/reports'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

export const ReportBundleFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<ReportBundle>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter
      placeholder={I18n.t('common.actions.search')}
      name="filterable_fields"
    >
      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
