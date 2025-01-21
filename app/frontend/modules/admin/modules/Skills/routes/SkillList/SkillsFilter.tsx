import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'

const { I18n } = window

export const SkillsFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter
      hideSearch
      name="filterable_fields"
      showTagFilter
      tagFilterConfig={{ taggable_resource_type: TaggableResourceType.Skill }}
    >

      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
