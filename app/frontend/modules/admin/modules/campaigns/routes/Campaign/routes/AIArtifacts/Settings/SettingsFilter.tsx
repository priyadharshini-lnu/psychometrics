import React from 'react'
import { Button, message } from 'antd'
import * as t from 'io-ts'
import { useDispatch } from 'react-redux'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { ToolsDropdown } from './ToolsDropdown'

const { I18n } = window


type Props = {
  onCreateAIArtifact: () => void
}
export const SettingsFilter: React.FC<Props> = ({
  onCreateAIArtifact,
}) => {
  const { resource } = useResourceContext<User>()
  const dispatch = useDispatch()
  const permissions = resource.meta.permissions || {}

  const tableLoading = resource.isLoading('fetch')

  const handleExportAiArtifacts = () => {
    resource.collectionAction({
      action: 'export',
      method: 'post',
      responseType: t.literal('ok'),
    })
      .then(() => {
        message.info(I18n.t('admin.export_success_msg'))
      })
      .catch(() => {
        message.error(I18n.t('admin.export_failure_msg'))
      })
  }

  const handleAIArtifactsImport = (data: FormData,
    successCallback: () => void, failureCallback: (error) => void) => {
    const action = 'ai_artifacts/import'

    resource.uploadFileAction(action, data)
      .then(() => {
        successCallback()
        message.info(I18n.t('admin.import_info_msg'))
      })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleToolAction = (action: string) => {
    if (action === 'import_ai_artifacts') {
      dispatch(openModal('AIArtifactsImportModal', {
        handleImport: handleAIArtifactsImport,
        csvFilePath: '/example_csv/ai-artifacts-sample.csv',
        title: I18n.t('admin.import_action_title'),
      }))
    }

    if (action === 'export_ai_artifacts') {
      handleExportAiArtifacts()
    }
  }

  return (
    <Resource.Filter
      name="filterable_fields"
    >
      <ToolsDropdown
        onClick={handleToolAction}
        permissions={permissions}
      />
      {permissions.create ? (
        <Button type="primary" disabled={tableLoading} onClick={() => onCreateAIArtifact()}>
          <PlusOutlined />
          {I18n.t('shared.create')}
        </Button>
      ) : null}
    </Resource.Filter>
  )
}
