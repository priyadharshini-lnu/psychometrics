import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { Layout as AdminLayout } from '~/modules/admin/Layout'
import store, { history } from '~/modules/admin/store'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
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
        <DndProvider backend={HTML5Backend}>
          <Router>
            <ConnectedRouter history={history}>
              <PortalMenu />
              <AdminLayout />
              <IncorrectResponseErrorModal />
            </ConnectedRouter>
          </Router>
        </DndProvider>
      </ApiProvider>
    </Provider>
  </div>
)

export default App
