import React from 'react'
import { Resource } from '~/modules/admin/components/Resource'
import { NormTR } from '~/modules/admin/modules/client/core/norms'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import NormTable from './NormTable'

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
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('admin.dashboard'),
          },
          {
            label: () => I18n.t('admin.norms'),
          },
        ]}
      />

      <Resource config={baseApiConfig} name="norms">
        <NormTable />
      </Resource>
    </>
  )
}

export default NormsList
