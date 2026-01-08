
import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'

const { I18n } = window

export const ReportFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Report>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter
      placeholder={I18n.t('common.actions.search')}
      name="filterable_fields"
      showTagFilter
      tagFilterConfig={{ taggable_resource_type: TaggableResourceType.Report }}
    >
      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('reports.create')}
      </Button>
    </Resource.Filter>
  )
}
