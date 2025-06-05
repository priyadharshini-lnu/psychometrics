import React from 'react'
import { useParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { IdpTR } from '~/modules/admin/modules/client/core/idp'
import IdpTable from './IdpTable'

const IdpList: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }

  const baseApiConfig = {
    basePath: `projects/${projectId}`,
    trackUrl: true,
    responseType: IdpTR,
    apiConfig: {
      fields: { skills: ['id', 'name', 'skill_type', 'project_id'] },
      include: ['skills', 'report'],
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
