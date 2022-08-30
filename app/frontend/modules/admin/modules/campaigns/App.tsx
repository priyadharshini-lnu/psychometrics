import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import store, { history } from 'modules/admin/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import RouteList from 'components/RouteList'
import IncorrectResponseErrorModal from 'components/IncorrectResponseErrorModal'
import humps from 'humps'
import { Schema } from 'libs/jsonApi/schema'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import settings from './settings'
import routes from './routes'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})


const App: React.FC<void> = () => (
  <div className="ms" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <ApiProvider client={client}>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <ConnectedRouter history={history}>
              <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
            </ConnectedRouter>
          </Router>
        </DndProvider>
        <IncorrectResponseErrorModal />
      </ApiProvider>
    </Provider>
  </div>
)

export default App
