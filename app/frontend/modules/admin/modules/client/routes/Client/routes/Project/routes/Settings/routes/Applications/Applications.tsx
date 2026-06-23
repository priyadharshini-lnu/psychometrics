import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { Resource } from '~/modules/admin/components/Resource'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getClientId } from '~/modules/admin/modules/client/core/projects'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { Application, ApplicationTR } from '~/modules/admin/modules/client/core/applications'
import {
  ApplicationsFilter,
  ApplicationsTable,
  ApplicationFormModal,
} from '~/components/Applications'

const connecter = connect(
  (state: RootState) => ({
    clientId: getClientId(state),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const ApplicationsComponent: React.FC<Props> = ({ clientId }) => {
  const { projectId } = useParams() as { projectId: string }
  const [isModalOpen, setIsModalOpen] = useState(false)

  const config = {
    responseType: ApplicationTR,
    apiConfig: { query: { project_id: projectId, tenant_id: clientId } },
  }

  return (
    <Resource<Application, BaseMeta> config={config} name="applications">
      <ApplicationsFilter openAddModal={() => setIsModalOpen(true)} />
      <ApplicationsTable />
      {isModalOpen && <ApplicationFormModal close={() => setIsModalOpen(false)} />}
    </Resource>
  )
}

export const Applications = connecter(ApplicationsComponent)
