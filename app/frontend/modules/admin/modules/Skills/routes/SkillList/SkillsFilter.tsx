import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'
import { ToolsDropdown } from './ToolsDropdown'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const SkillsFilter: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  const handleToolAction = (action: string) => {
    if (action === 'import_skills') {
      openModal('SkillsImportModal')
    }
  }

  const handleCreateSkillModal = () => {
    openModal('SkillsFormModal')
  }

  return (
    <Resource.Filter
      name="filterable_fields"
      showTagFilter
      tagFilterConfig={{ taggable_resource_type: TaggableResourceType.Skill }}
    >
      <ToolsDropdown onClick={handleToolAction} permissions={{ import: true }} />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateSkillModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
