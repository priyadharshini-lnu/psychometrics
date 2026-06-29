import React, { useState } from 'react'
import { Resource } from '~/modules/admin/components/Resource'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { Application, ApplicationTR } from '~/modules/admin/modules/client/core/applications'
import { ApplicationsFilter } from './ApplicationsFilter'
import { ApplicationsTable } from './ApplicationsTable'
import { ApplicationFormModal } from './ApplicationFormModal'

type Props = {
  query: Record<string, string>
}

export const ApplicationsList: React.FC<Props> = ({ query }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const config = {
    responseType: ApplicationTR,
    apiConfig: { query },
  }

  return (
    <Resource<Application, BaseMeta> config={config} name="applications">
      <div className="pl">
        <ApplicationsFilter openAddModal={() => setIsModalOpen(true)} />
        <ApplicationsTable />
        {isModalOpen && <ApplicationFormModal close={() => setIsModalOpen(false)} />}
      </div>
    </Resource>
  )
}
