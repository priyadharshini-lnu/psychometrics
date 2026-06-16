import { useParams } from 'react-router-dom'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import { ApplicationDetails as SharedApplicationDetails } from '~/components/Applications'
import { AdminTypes } from '~/modules/admin/modules/Admins/constants'

export const ApplicationDetails = () => {
  const { projectId, applicationId } = useParams() as {
    projectId: string
    applicationId: string
  }

  const baseUrl = `${settings.urlPrefix}/${projectId}/settings/applications/${applicationId}`

  return (
    <SharedApplicationDetails
      applicationId={applicationId}
      baseUrl={baseUrl}
      permissionsConfig={{
        role: AdminTypes.ProjectAdmin,
        scopeFilter: { project_id_eq: projectId },
      }}
    />
  )
}
