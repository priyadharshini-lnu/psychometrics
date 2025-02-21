import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { Button, message } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ToolsDropdown } from './ToolsDropdown'
import { User } from '~/modules/admin/modules/client/core/users'
import { exportDevelopmentActions } from '../../core/development_actions'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

export const DevelopmentActionsFilter: React.FC<Props> = ({
  openModal,
}) => {
  const dispatch = useDispatch()
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  const handleToolAction = (action: string) => {
    if (action === 'import_development_actions') {
      openModal('DevelopmentActionsImportModal')
    }

    if (action === 'export_global_development_actions') {
      dispatch(exportDevelopmentActions()).then(() => {
        message.info(I18n.t('administration.development_actions.export.success_msg'))
      })
    }

    if (action === 'export_development_action') {
      openModal('DevelopmentActionsExportModal')
    }
  }

  const handleCreateDevelopmentActionModal = () => {
    openModal('DevelopmentActionsFormModal')
  }

  return (
    <Resource.Filter name="filterable_fields">
      <ToolsDropdown
        onClick={handleToolAction}
        permissions={{ import: true, export_global: true, export: true }}
      />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateDevelopmentActionModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
