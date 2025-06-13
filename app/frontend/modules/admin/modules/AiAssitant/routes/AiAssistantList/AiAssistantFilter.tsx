import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { AiAssistant } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const AiAssistantsFilter: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<AiAssistant>()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateSkillModal = () => {
    openModal('AiAssistantFormModal')
  }

  return (
    <Resource.Filter
      name="filterable_fields"
    >
      <Button type="primary" disabled={tableLoading} onClick={handleCreateSkillModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
