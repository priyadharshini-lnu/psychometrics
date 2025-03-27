/* eslint-disable max-len */
import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import * as t from 'io-ts'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ToolsDropdown } from './ToolsDropdown'
import { User } from '~/modules/admin/modules/client/core/users'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

const CSVDevelopmentAction = `ID,SkillID,Name,Description,Type,Category,CourseURL,CourseStartDate,CourseEndDate,CourseImage
1,11000000001,Leadership,About Leadership qualities,structured_learning,Course,www.google.com,2025-01-01,2025-12-31,https://picsum.photos/200`

const CSVDevelopmentActionTranslations = `ID,Locale,Name,Description
1,fr,French Name,French Description`

export const DevelopmentActionsFilter: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  const handleDevelopmentActionImport = (data:FormData, projectId: number|null, successCallback:()=>void, failureCallback:(error)=>void) => {
    const action = projectId ? `development_actions/import?project_id=${projectId}` : 'development_actions/import_global'

    resource.uploadFileAction(action, data).then(() => {
      successCallback()
      message.info(I18n.t('administration.development_actions.import.info_msg'))
    })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleDevelopmentActionTranslationsImport = (data:FormData, projectId: number, successCallback:()=>void, failureCallback:(error)=>void) => {
    const action = projectId ? `development_actions/import_translations?project_id=${projectId}` : 'development_actions/import_global_translations'

    resource.uploadFileAction(action, data).then(() => {
      successCallback()
      message.info(I18n.t('administration.development_actions.import.info_msg'))
    })
      .catch((error) => {
        message.error(I18n.t('administration.development_actions.import.failure_msg'))
        failureCallback(error)
      })
  }

  const handleDevelopmentActionExport = (projectId: number) => {
    resource.collectionAction({
      action: `export?project_id=${projectId}`,
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('administration.development_actions.export.success_msg'))
    })
      .catch(() => {
        message.error(I18n.t('administration.development_actions.export.failure_msg'))
      })
  }

  const handleDevelopmentActionTranslationExport = (projectId: number) => {
    resource.collectionAction({
      action: `export_translations?project_id=${projectId}`,
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('administration.development_actions.export.success_msg'))
    }).catch(() => {
      message.error(I18n.t('administration.development_actions.export.failure_msg'))
    })
  }

  const handleToolAction = (action: string) => {
    if (action === 'import_development_actions') {
      openModal('DevelopmentActionsImportModal', {
        handleImport: handleDevelopmentActionImport,
        csvData: CSVDevelopmentAction,
        title: I18n.t('administration.development_actions.import_action.development_actions_title'),
        allowGlobalImport: resource.meta.permissions?.importGlobal,
      })
    }

    if (action === 'import_translations') {
      openModal('DevelopmentActionsImportModal', {
        handleImport: handleDevelopmentActionTranslationsImport,
        csvData: CSVDevelopmentActionTranslations,
        title: I18n.t('administration.development_actions.import_action.development_actions_translations_title'),
        allowGlobalImport: resource.meta.permissions?.importGlobalTranslations,
      })
    }


    if (action === 'export_development_action') {
      openModal('DevelopmentActionsExportModal', {
        handleExport: handleDevelopmentActionExport,
        title: I18n.t('administration.development_actions.export_actions.development_actions_title'),
      })
    }

    if (action === 'export_development_action_translations') {
      openModal('DevelopmentActionsExportModal', {
        handleExport: handleDevelopmentActionTranslationExport,
        title: I18n.t('administration.development_actions.export_actions.development_action_translations_title'),
      })
    }

    if (action === 'export_global_development_actions') {
      resource.collectionAction({
        action: 'export_global',
        method: 'post',
        body: {},
        responseType: t.literal('ok'),
      }).then(() => {
        message.info(I18n.t('administration.development_actions.export.success_msg'))
      })
        .catch(() => {
          message.error(I18n.t('administration.development_actions.export.failure_msg'))
        })
    }

    if (action === 'export_global_development_actions_translations') {
      resource.collectionAction({
        action: 'export_global_translations',
        method: 'post',
        body: {},
        responseType: t.literal('ok'),
      }).then(() => {
        message.info(I18n.t('administration.development_actions.export.success_msg'))
      })
        .catch(() => {
          message.error(I18n.t('administration.development_actions.export.failure_msg'))
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
      <Button type="primary" disabled={tableLoading} onClick={handleCreateDevelopmentActionModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
