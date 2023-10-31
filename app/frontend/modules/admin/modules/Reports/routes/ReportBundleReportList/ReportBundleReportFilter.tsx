
import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { ReportBundle } from 'modules/admin/modules/client/core/reports'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

export const ReportBundleReportFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<ReportBundle>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter placeholder={I18n.t('common.actions.search')} name="filterable_fields">
      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('report_bundles.reports.actions.add')}
      </Button>
    </Resource.Filter>
  )
}
