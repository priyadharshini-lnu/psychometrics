/* eslint-disable max-len */
import React from 'react'
import { Button, message } from 'antd'
import { useParams } from 'react-router'
import * as t from 'io-ts'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ToolsDropdown } from './ToolsDropdown'
import { User } from '~/modules/admin/modules/client/core/users'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

export const DevelopmentActionsFilter: React.FC<Props> = ({
  openModal,
}) => {
  const { projectId: projectIdParam } = useParams()
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  const handleDevelopmentActionImport = (data:FormData, projectId: number|null, successCallback:()=>void, failureCallback:(error)=>void) => {
    const action = projectId ? `development_actions/import?project_id=${projectId}` : 'development_actions/import_global'

    resource.uploadFileAction(action, data).then(() => {
      successCallback()
      message.info(I18n.t('admin.development_actions_import_info_msg'))
    })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleDevelopmentActionTranslationsImport = (data:FormData, projectId: number | null, successCallback:()=>void, failureCallback:(error)=>void) => {
    const action = projectId ? `development_actions/import_translations?project_id=${projectId}` : 'development_actions/import_global_translations'

    resource.uploadFileAction(action, data).then(() => {
      successCallback()
      message.info(I18n.t('admin.development_actions_import_info_msg'))
    })
      .catch((error) => {
        message.error(I18n.t('admin.development_actions_import_failure_msg'))
        failureCallback(error)
      })
  }

  const handleDevelopmentActionExport = (projectId: number) => {
    resource.collectionAction({
      action: `export?project_id=${projectId}`,
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('admin.development_actions_export_success_msg'))
    })
      .catch(() => {
        message.error(I18n.t('admin.development_actions_export_failure_msg'))
      })
  }

  const handleDevelopmentActionTranslationExport = (projectId: number) => {
    resource.collectionAction({
      action: `export_translations?project_id=${projectId}`,
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('admin.development_actions_export_success_msg'))
    }).catch(() => {
      message.error(I18n.t('admin.development_actions_export_failure_msg'))
    })
  }

  const handleToolAction = (action: string) => {
    if (action === 'import_development_actions') {
      openModal('DevelopmentActionsImportModal', {
        handleImport: handleDevelopmentActionImport,
        csvFilePath: '/example_csv/development-actions-sample.csv',
        title: I18n.t('admin.development_actions_import_action_development_actions_title'),
        allowGlobalImport: resource.meta.permissions?.importGlobal,
      })
    }

    if (action === 'import_translations') {
      openModal('DevelopmentActionsImportModal', {
        handleImport: handleDevelopmentActionTranslationsImport,
        csvFilePath: '/example_csv/development-action-translations-sample.csv',
        title: I18n.t('admin.development_actions_import_action_development_actions_translations_title'),
        allowGlobalImport: resource.meta.permissions?.importGlobalTranslations,
      })
    }


    if (action === 'export_development_action') {
      if (projectIdParam) {
        handleDevelopmentActionExport(Number(projectIdParam))
      }
    }

    if (action === 'export_development_action_translations') {
      if (projectIdParam) {
        handleDevelopmentActionTranslationExport(Number(projectIdParam))
      }
    }

    if (action === 'export_global_development_actions') {
      resource.collectionAction({
        action: 'export_global',
        method: 'post',
        body: {},
        responseType: t.literal('ok'),
      }).then(() => {
        message.info(I18n.t('admin.development_actions_export_success_msg'))
      })
        .catch(() => {
          message.error(I18n.t('admin.development_actions_export_failure_msg'))
        })
    }

    if (action === 'export_global_development_actions_translations') {
      resource.collectionAction({
        action: 'export_global_translations',
        method: 'post',
        body: {},
        responseType: t.literal('ok'),
      }).then(() => {
        message.info(I18n.t('admin.development_actions_export_success_msg'))
      })
        .catch(() => {
          message.error(I18n.t('admin.development_actions_export_failure_msg'))
        })
    }
  }

  const handleCreateDevelopmentActionModal = () => {
    openModal('DevelopmentActionsFormModal')
  }

  return (
    <Resource.Filter name="filterable_fields">
      <ToolsDropdown
        onClick={handleToolAction}
        permissions={resource.meta.permissions}
      />
      {
        resource.meta.permissions?.create && (
          <Button type="primary" disabled={tableLoading} onClick={handleCreateDevelopmentActionModal}>
            <PlusOutlined />
            {I18n.t('shared.create')}
          </Button>
        )
      }
    </Resource.Filter>
  )
}
