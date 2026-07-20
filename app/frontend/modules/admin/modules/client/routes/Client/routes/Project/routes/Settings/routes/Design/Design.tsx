import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { uploadFiles } from '~/modules/admin/modules/client/core/designSettings'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getProject as getCurrentProject } from '~/modules/admin/core/ui/breadcrumbs'
import { DesignSettingsForm } from '~/modules/admin/components/DesignSettingsForm/DesignSettingsForm'

const connecter = connect(
  (state: RootState) => ({
    projectName: getCurrentProject(state).name || '',
  }),
  {
    uploadFiles,
  },
)

type Props = ConnectedProps<typeof connecter>

export const DesignComponent: React.FC<Props> = ({ uploadFiles, projectName }) => {
  const { projectId } = useParams() as { projectId: string }

  return (
    <DesignSettingsForm entityId={projectId} entityName={projectName} entityType="project" uploadFiles={uploadFiles} />
  )
}

export const Design = connecter(DesignComponent)
