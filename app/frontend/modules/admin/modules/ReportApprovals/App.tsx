import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { Provider } from 'react-redux'
import { DefaultAntThemeWrapper } from '~/glint'
import store, { history } from '~/modules/admin/store'
import RouteList from '~/components/RouteList'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { Schema } from '~/libs/jsonApi/schema'
import { routes } from './routes'
import { settings } from './settings'
import { PortalMenu } from '~/components/MainMenu'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

export const App: React.FC = () => (
  <DefaultAntThemeWrapper>
    <div style={{ background: 'white' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Provider store={store as any}>
        <ApiProvider client={client}>
          <Router>
            <ConnectedRouter history={history}>
              <PortalMenu />
              <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
              <IncorrectResponseErrorModal />
            </ConnectedRouter>
          </Router>
        </ApiProvider>
      </Provider>
    </div>
  </DefaultAntThemeWrapper>
)
