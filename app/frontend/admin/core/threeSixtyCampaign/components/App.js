import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import store from 'admin/store'
import { Provider } from 'react-redux'
import RouteList from 'components/RouteList'
import routes from '../routes'
import Menu from './Menu'
import settings from '../settings'

export default function App ({ initState }) {
  return (
    <div className="ms" style={{ background: 'white' }}>
      <Provider store={store(initState)}>
        <Router>
          <Menu routes={routes} />
          <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
        </Router>
      </Provider>
    </div>
  )
}
