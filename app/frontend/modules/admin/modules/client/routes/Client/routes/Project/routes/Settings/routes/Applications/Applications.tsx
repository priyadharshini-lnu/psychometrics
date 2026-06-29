import React from 'react'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getClientId } from '~/modules/admin/modules/client/core/projects'
import {
  ApplicationsList,
} from '~/components/Applications'

const connecter = connect(
  (state: RootState) => ({
    clientId: String(getClientId(state)),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const ApplicationsComponent: React.FC<Props> = ({ clientId }) => {
  const { projectId } = useParams() as { projectId: string }

  return (
    <ApplicationsList query={{ project_id: projectId, tenant_id: clientId }} />
  )
}

export const Applications = connecter(ApplicationsComponent)
