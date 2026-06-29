import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { Application, ApplicationTR } from '~/modules/admin/modules/client/core/applications'
import {
  ApplicationsFilter,
  ApplicationsTable,
  ApplicationFormModal,
} from '~/components/Applications'

export const Applications: React.FC = () => {
  const { clientId } = useParams() as { clientId: string }
  const [isModalOpen, setIsModalOpen] = useState(false)

  const config = {
    responseType: ApplicationTR,
    apiConfig: { query: { tenant_id: clientId } },
  }

  return (
    <Resource<Application, BaseMeta> config={config} name="applications">
      <ApplicationsFilter openAddModal={() => setIsModalOpen(true)} />
      <ApplicationsTable />
      {isModalOpen && <ApplicationFormModal close={() => setIsModalOpen(false)} />}
    </Resource>
  )
}
