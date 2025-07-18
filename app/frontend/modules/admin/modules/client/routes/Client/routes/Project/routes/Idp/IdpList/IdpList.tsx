import React from 'react'
import { useParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { IdpListItemTR } from '~/modules/admin/modules/client/core/idp'
import IdpTable from './IdpTable'

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
    },
  }

  return (
    <>
      <Resource config={baseApiConfig} name="idp_templates">
        <IdpTable />
      </Resource>
    </>
  )
}

export default IdpList
