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
        message.info(I18n.t('administration.job_role.import.success_msg'))
      })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleExportTranslations = (selectedProjectId?: number) => {
    let action = 'export_translations'
    if (params.projectId || selectedProjectId) {
      action += `?project_id=${params.projectId ?? selectedProjectId}`
    }
    resource.collectionAction({
      action,
      method: 'post',
    }).then(() => {
      message.info(I18n.t('administration.job_role.export.success_msg'))
    }).catch(() => {
      message.error(I18n.t('administration.job_role.export.failure_msg'))
    })
  }

  const handleToolAction = (action: string) => {
    if (action === 'import_translations') {
      openModal('JobRolesImportModal', {
        handleImport: handleTranslationsImport,
        csvFilePath: '/example_csv/job-roles-sample.csv',
        title: I18n.t('administration.job_role.import_action.translations'),
        allowGlobalImport: resource.meta.permissions?.importGlobalTranslations,
      })
    } else if (action === 'export_translations') {
      if (params.projectId) {
        handleExportTranslations()
      } else {
        openModal('JobRolesExportModal', {
          handleExport: handleExportTranslations,
          title: I18n.t('administration.job_role.export_action.translations'),
        })
      }
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
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
