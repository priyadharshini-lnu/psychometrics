import React from 'react'
import { App, Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { ToolsDropdown } from './ToolsDropdown'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const MappingsFilters: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  const { message } = App.useApp()

  const handleTaxonomyImport = (data:FormData,
    projectId: number, successCallback:()=>void, failureCallback:(error)=>void) => {
    let action = 'skills_rater_assessments/import_taxonomies'
    if (projectId) {
      action += `?project_id=${projectId}`
    }
    resource.uploadFileAction(action, data)
      .then(() => {
        successCallback()
        message.info(I18n.t('administration.taxonomy.import.success_msg'))
      })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleToolAction = (action: string) => {
    if (action === 'import_taxonomy') {
      openModal('TaxonomyImportModal', {
        handleImport: handleTaxonomyImport,
        title: I18n.t('administration.taxonomy.import_action.taxonomy'),
        allowGlobalImport: resource.meta.permissions?.importGlobal,
      })
    }
  }

  const handleCreateMappingModal = () => {
    openModal('MappingModal')
  }

  return (
    <Resource.Filter
      name="skill_name_or_job_role_name_cont"
    >
      <ToolsDropdown onClick={handleToolAction} />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateMappingModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
