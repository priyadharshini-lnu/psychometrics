
import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'

const { I18n } = window

export const AssessmentFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter
      placeholder={I18n.t('common.actions.search')}
      name="filterable_fields"
      showTagFilter
      tagFilterConfig={{ taggable_resource_type: TaggableResourceType.Assessment }}
    >
      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('assessments.create')}
      </Button>
    </Resource.Filter>
  )
}
