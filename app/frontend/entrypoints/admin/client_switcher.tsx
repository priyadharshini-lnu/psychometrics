import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '~/modules/admin/store'
import { DefaultAntThemeWrapper } from '~/glint'
import { ClientSwitcher } from '~/components/ClientSwitcher'

const mountSwitcher = () => {
  const container = document.getElementById('client-switcher-portal')
  if (!container) return

  const { clientContextData, switchableClients, recentClientIds } = window.PsyGlobalState || {}
  if (!clientContextData) return

  const root = createRoot(container)
  root.render(
    <Provider store={store}>
      <DefaultAntThemeWrapper>
        <ClientSwitcher
          currentClient={clientContextData}
          switchableClients={switchableClients || []}
          recentClientIds={recentClientIds || []}
        />
      </DefaultAntThemeWrapper>
    </Provider>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountSwitcher)
} else {
  mountSwitcher()
}
