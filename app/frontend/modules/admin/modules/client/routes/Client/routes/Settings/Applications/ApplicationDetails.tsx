import { useParams } from 'react-router-dom'
import settings from '~/modules/admin/modules/client/settings'
import { ApplicationDetails as SharedApplicationDetails } from '~/components/Applications'
import { AdminTypes } from '~/modules/admin/modules/Admins/constants'

export const ApplicationDetails = () => {
  const { clientId, applicationId } = useParams() as {
    clientId: string
    applicationId: string
  }

  const baseUrl = `${settings.urlPrefix}/clients/${clientId}/settings/applications/${applicationId}`

  return (
    <SharedApplicationDetails
      applicationId={applicationId}
      baseUrl={baseUrl}
      permissionsConfig={{
        role: AdminTypes.ClientAdmin,
        scopeFilter: { client_id_eq: clientId },
      }}
    />
  )
}
