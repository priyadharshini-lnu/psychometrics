import React from 'react'
import {
  BrowserRouter as Router, Route,
} from 'react-router-dom'
import store from 'modules/user/store'
import { Provider } from 'react-redux'
import ConnectionCheck from 'components/ConnectionCheck'
import { connected, disconnected } from 'core/connection'
import routes from './routes'
import PageLayout from './components/PageLayout'

export default function App () {
  return (
    <Provider store={store}>
      <Router>
        <PageLayout>
          <ConnectionCheck
            onConnected={() => store.dispatch(connected())}
            onDisconnected={() => store.dispatch(disconnected())}
          />
          {routes.map((route, i) => (
            <Route
              key={i}
              path={route.path}
              exact={route.exact}
              component={route.main}
            />
          ))}
        </PageLayout>
      </Router>
    </Provider>
  )
}
