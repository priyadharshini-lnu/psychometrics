import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import store, { history } from 'modules/admin/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import RouteList from 'components/RouteList'
import routes from './routes'
import settings from './settings'

const App: React.FC<void> = () => (
  <div className="ms" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <Router>
        <ConnectedRouter history={history}>
          <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
        </ConnectedRouter>
      </Router>
    </Provider>
  </div>
)

export default App
