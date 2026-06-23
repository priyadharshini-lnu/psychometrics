import React from 'react'
import { App, Button } from 'antd'
import { useParams } from 'react-router-dom'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { ToolsDropdown } from './ToolsDropdown'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const JobRolesFilters: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()
  const params = useParams()

  const tableLoading = resource.isLoading('fetch')

  const { message } = App.useApp()

  const handleCreateJobRoleModal = () => {
    openModal('JobRolesFormModal')
  }

  const handleTranslationsImport = (data:FormData,
    projectId: number, successCallback:()=>void, failureCallback:(error)=>void) => {
    let action = 'job_roles/import_translations'
    if (projectId) {
      action += `?project_id=${projectId}`
    }
    resource.uploadFileAction(action, data)
      .then(() => {
        successCallback()
        message.info(I18n.t('admin.job_role_import_success_msg'))
      })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleExportTranslations = () => {
    let action = 'export_translations'
    if (params.projectId) {
      action += `?project_id=${params.projectId}`
    }
    resource.collectionAction({
      action,
      method: 'post',
    }).then(() => {
      message.info(I18n.t('admin.job_role_export_success_msg'))
    }).catch(() => {
      message.error(I18n.t('admin.job_role_export_failure_msg'))
    })
  }

  const handleToolAction = (action: string) => {
    if (action === 'import_translations') {
      openModal('JobRolesImportModal', {
        handleImport: handleTranslationsImport,
        title: I18n.t('admin.job_role_import_action_translations'),
        allowGlobalImport: resource.meta.permissions?.importGlobalTranslations,
      })
    } else if (action === 'export_translations') {
      handleExportTranslations()
    }
  }

  return (
    <Resource.Filter
      name="name_or_code_cont"
    >
      <ToolsDropdown
        onClick={handleToolAction}
      />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateJobRoleModal}>
        <PlusOutlined />
        {I18n.t('shared.create')}
      </Button>
    </Resource.Filter>
  )
}
