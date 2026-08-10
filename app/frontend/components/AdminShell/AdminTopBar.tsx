import { FC } from 'react'
import { Provider } from 'react-redux'
import AdminJobList from '~/modules/admin/modules/AdminJob/AdminJobList'
import adminJobStore from '~/modules/admin/modules/AdminJob/store'
import { ClientSwitcher } from '~/components/ClientSwitcher'

// AdminJobList keeps its own store; no Router/ApiProvider here, the SPA supplies both.
export const AdminTopBarEnd: FC = () => (
  <Provider store={adminJobStore}>
    <AdminJobList />
  </Provider>
)

export const AdminTopBarStart: FC = () => {
  const { clientContextData, switchableClients, recentClientIds } = window.PsyGlobalState || {}
  if (!clientContextData) return null

  return (
    <ClientSwitcher
      currentClient={clientContextData}
      switchableClients={switchableClients || []}
      recentClientIds={recentClientIds || []}
    />
  )
}
