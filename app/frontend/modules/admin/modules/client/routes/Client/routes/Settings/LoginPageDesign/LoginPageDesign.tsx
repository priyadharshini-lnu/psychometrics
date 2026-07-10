import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { uploadFiles } from '~/modules/admin/modules/client/core/designSettings'
import { RootState } from '~/modules/admin/core/rootReducers'
import { DesignSettingsForm } from '~/modules/admin/components/DesignSettingsForm/DesignSettingsForm'

const connecter = connect(
  (state: RootState) => ({
    clientName: state.ui.breadcrumbs.client.name || '',
  }),
  {
    uploadFiles,
  },
)

type Props = ConnectedProps<typeof connecter>

export const LoginPageDesignComponent: React.FC<Props> = ({ uploadFiles, clientName }) => {
  const { clientId } = useParams() as { clientId: string }

  return (
    <DesignSettingsForm entityId={clientId} entityName={clientName} entityType="client" uploadFiles={uploadFiles} />
  )
}

export const LoginPageDesign = connecter(LoginPageDesignComponent)
