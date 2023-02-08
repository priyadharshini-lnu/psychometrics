import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '~/modules/admin/store'
import RouteList from '~/components/RouteList'
import routes from './routes'
import { TopMenu } from './components/TopMenu'
import settings from './settings'

export default function App () {
  return (
    <div className="ms" style={{ background: 'white' }}>
      <Provider store={store}>
        <Router>
          <TopMenu />
          <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
        </Router>
      </Provider>
    </div>
  )
}
