import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { AiAssistant } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const AiAssistantsFilter: React.FC<Props> = () => {
  const { resource } = useResourceContext<AiAssistant>()

  const navigate = useNavigate()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateSkillModal = () => {
    navigate('/admin/ai_assistants/create')
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
