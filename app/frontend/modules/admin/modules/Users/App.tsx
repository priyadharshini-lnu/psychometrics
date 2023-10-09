import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import store, { history } from '~/modules/admin/store'
import { Layout as UserLayout } from './Layout'
import { Schema } from '~/libs/jsonApi/schema'
import { PortalMenu } from '~/components/MainMenu'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

const App: React.FC<void> = () => (
  <div style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <ApiProvider client={client}>
        <Router>
          <ConnectedRouter history={history}>
            <PortalMenu />
            <UserLayout />
          </ConnectedRouter>
        </Router>
        <IncorrectResponseErrorModal />
      </ApiProvider>
    </Provider>
  </div>
)

export default App
