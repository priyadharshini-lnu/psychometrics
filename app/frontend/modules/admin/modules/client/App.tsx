import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import store, { history } from 'modules/admin/store'
import { ApiClient, ApiProvider } from 'jsonapi-react'
import { RecoilRoot } from 'recoil'
import RouteList from 'components/RouteList'

import { routes } from './routes'
import settings from './settings'

const client = new ApiClient({
  url: 'https://ttedev.me:3030/api/v2/administration',
  schema: {
    clients: {
      type: 'clients',
      fields: {
        name: 'string',
      },
      relationships: {
        account_manager: {
          type: 'users',
        },
        project_manager: {
          type: 'users',
        }
      }
    },
    users: {
      type: 'users',
      fields: {
        name: 'string',
      }
    },
  }
})

const App: React.FC<void> = () => (
  <div className="ms-2" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <ConnectedRouter history={history}>
            <RecoilRoot>
              <ApiProvider client={client}>
                  <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
              </ApiProvider>
            </RecoilRoot>
            {/* <Client /> */}
          </ConnectedRouter>
        </Router>
      </DndProvider>
    </Provider>
  </div>
)

export default App
