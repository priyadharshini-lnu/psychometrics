import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import store, { history } from 'admin/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import RouteList from 'components/RouteList'
import routes from '../routes'
import settings from '../settings'

const App: React.FC<void> = () => (
  <div className="ms" style={{ background: 'white' }}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Router>
          <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
        </Router>
      </ConnectedRouter>
    </Provider>
  </div>
)

export default App
