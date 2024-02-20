
import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Report } from '~/modules/admin/modules/client/core/reports'

const { I18n } = window

export const ReportFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Report>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter placeholder={I18n.t('common.actions.search')} name="filterable_fields">
      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('reports.create')}
      </Button>
    </Resource.Filter>
  )
}
