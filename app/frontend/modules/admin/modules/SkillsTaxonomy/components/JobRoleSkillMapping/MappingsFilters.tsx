import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const MappingsFilters: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateMappingModal = () => {
    openModal('MappingModal')
  }

  return (
    <Resource.Filter
      name="skill_name_or_job_role_name_cont"
    >
      <Button type="primary" disabled={tableLoading} onClick={handleCreateMappingModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
