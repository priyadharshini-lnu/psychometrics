import React from 'react'
import { useParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { IdpListItemTR } from '~/modules/admin/modules/client/core/idp'
import IdpTable from './IdpTable'

const { I18n } = window

const IdpList: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }

  const baseApiConfig = {
    basePath: `projects/${projectId}`,
    trackUrl: true,
    responseType: IdpListItemTR,
    apiConfig: {
      fields: {
        idp_templates: ['id', 'name', 'description', 'report', 'status', 'allow_edit'],
      },
      reports: ['name'],
      include: ['report'],
      include_meta: ['permissions'],
      include_resource_meta: ['permissions'],
    },
  }

  return (
    <>
      <Resource
        title={I18n.t('admin.idp_tab_templates')}
        config={baseApiConfig}
        name="idp_templates"
        settingsKey={TABLE_SETTINGS_KEYS.projectIdpTemplates}
      >
        <IdpTable />
      </Resource>
    </>
  )
}

export default IdpList
