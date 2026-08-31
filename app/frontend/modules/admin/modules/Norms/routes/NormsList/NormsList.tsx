import React from 'react'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { NormTR } from '~/modules/admin/modules/client/core/norms'
import NormTable from './NormTable'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

const NormsList: React.FC = () => {
  const baseApiConfig = {
    trackUrl: true,
    responseType: NormTR,
    apiConfig: {
      include: ['dimension', 'updated_by', 'owner'],
      include_meta: ['permissions'],
      fields: { dimensions: ['name'], users: ['name'] },
      include_resource_meta: ['permissions'],
    },
  }

  return (
    <>
      <DocumentTitle text={I18n.t('admin.norms')} />
      <Resource
        title={I18n.t('admin.norms')}
        config={baseApiConfig}
        name="norms"
        settingsKey={TABLE_SETTINGS_KEYS.adminNorms}
      >
        <NormTable />
      </Resource>
    </>
  )
}

export default NormsList
