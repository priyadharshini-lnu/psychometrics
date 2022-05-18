import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import store, { history } from 'modules/admin/store'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import { RecoilRoot } from 'recoil'
import RouteList from 'components/RouteList'
import IncorrectResponseErrorModal from 'components/IncorrectResponseErrorModal'

import { routes } from './routes'
import settings from './settings'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: {
    clients: {
      type: 'clients',
      relationships: {
        account_manager: {
          type: 'users',
        }
      }
    }
  },
})

const App: React.FC<void> = () => (
  <div className="ms-2" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <RecoilRoot>
        <ApiProvider client={client}>
          <DndProvider backend={HTML5Backend}>
            <Router>
              <ConnectedRouter history={history}>
                <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
                <IncorrectResponseErrorModal />
              </ConnectedRouter>
            </Router>
          </DndProvider>
        </ApiProvider>
      </RecoilRoot>
    </Provider>
  </div>
)

export default App
