import React from 'react'
import * as t from 'io-ts'
import { App, Button } from 'antd'
import { useParams } from 'react-router-dom'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { ToolsDropdown } from './ToolsDropdown'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const ProficiencyFilters: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()
  const params = useParams()

  const tableLoading = resource.isLoading('fetch')

  const { message } = App.useApp()

  const handleProficiencyImport = (data:FormData,
    projectId: number, successCallback:()=>void, failureCallback:(error)=>void) => {
    let action = 'proficiency_levels/import'
    if (projectId) {
      action += `?project_id=${projectId}`
    }
    resource.uploadFileAction(action, data)
      .then(() => {
        successCallback()
        message.info(I18n.t('admin.import_job_queued'))
      })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleTranslationsImport = (data:FormData,
    projectId: number, successCallback:()=>void, failureCallback:(error)=>void) => {
    let action = 'proficiency_levels/import_translations'
    if (projectId) {
      action += `?project_id=${projectId}`
    }
    resource.uploadFileAction(action, data)
      .then(() => {
        successCallback()
        message.info(I18n.t('admin.import_job_queued'))
      })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleProficiencyExport = () => {
    let action = 'export'
    if (params.projectId) {
      action += `?project_id=${params.projectId}`
    }
    resource.collectionAction({
      action,
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('admin.export_success_msg'))
    }).catch(() => {
      message.error(I18n.t('admin.export_failure_msg'))
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
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('admin.translations_export_success_msg'))
    }).catch(() => {
      message.error(I18n.t('admin.translations_export_failure_msg'))
    })
  }

  const handleToolAction = (action: string) => {
    switch (action) {
      case 'import_proficiency':
        openModal('ProficiencyImportModal', {
          handleImport: handleProficiencyImport,
          title: I18n.t('admin.import_actions_proficiency'),
          csvFilePath: '/example_csv/proficiency-sample.csv',
          allowGlobalImport: resource.meta.permissions?.importGlobal,
        })
        break
      case 'import_translations':
        openModal('ProficiencyImportModal', {
          handleImport: handleTranslationsImport,
          title: I18n.t('admin.import_actions_translations'),
          allowGlobalImport: resource.meta.permissions?.importGlobalTranslations,
        })
        break
      case 'export_proficiency':
        handleProficiencyExport()
        break
      case 'export_translations':
        handleExportTranslations()
        break
      default:
    }
  }

  const handleCreateMappingModal = () => {
    openModal('ProficiencyModal')
  }

  return (
    <Resource.Filter
      name="filterable_fields"
    >
      <ToolsDropdown
        onClick={handleToolAction}
      />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateMappingModal}>
        <PlusOutlined />
        {I18n.t('shared.create')}
      </Button>
    </Resource.Filter>
  )
}
