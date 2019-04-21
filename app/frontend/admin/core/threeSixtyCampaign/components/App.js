import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import store from 'admin/store'
import { Provider } from 'react-redux'
import RouteList from 'components/RouteList'
import routes from '../routes'
import Menu from './Menu'
import settings from '../settings'

export default function App () {
  return (
    <div>
      <Provider store={store}>
        <Router>
          <Menu routes={routes} />
          <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
        </Router>
      </Provider>
    </div>
  )
}
