import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import store, { history } from 'modules/admin/store'
// import { Client } from './routes/Client'

import RouteList from 'components/RouteList'

import { routes } from './routes'
import settings from './settings'

const App: React.FC<void> = () => (
  <div className="ms-2" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <ConnectedRouter history={history}>
            <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
            {/* <Client /> */}
          </ConnectedRouter>
        </Router>
      </DndProvider>
    </Provider>
  </div>
)

export default App
