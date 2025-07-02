import React from 'react'
import { App } from 'antd'
import { User } from '~/modules/admin/modules/client/core/users'
import { ToolsDropdown } from './ToolsDropdown'

import styles from './styles.less'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const SettingsHeader: React.FC<Props> = ({
  openModal,
}) => {
  const { message } = App.useApp()

  const { meta, uploadFileAction } = useResources<User>('skills_rater_assessments/import_taxonomies')

  const handleTaxonomyImport = (data:FormData,
    projectId: number, successCallback:()=>void, failureCallback:(error)=>void) => {
    let action = 'skills_rater_assessments/import_taxonomies'
    if (projectId) {
      action += `?project_id=${projectId}`
    }
    uploadFileAction(action, data)
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
        allowGlobalImport: meta.permissions?.importGlobal,
      })
    }
  }

  return (
    <div className={styles.header}>
      <ToolsDropdown onClick={handleToolAction} />
    </div>
  )
}
