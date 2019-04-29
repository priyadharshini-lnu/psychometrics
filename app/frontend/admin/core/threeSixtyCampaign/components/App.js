import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import store from 'admin/store'
import { Provider } from 'react-redux'
import RouteList from 'components/RouteList'
import routes from '../routes'
import Menu from './Menu'
import settings from '../settings'
import Spinner from './Spinner'
import { getSpinnerState } from '../../temp/spinner'

export default function App () {
  return (
    <div className="ms" style={{ background: 'white' }}>
      <Provider store={store}>
        <Router>
          <Menu routes={routes} />
          <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
          <Spinner active={getSpinnerState(store.getState())} />
        </Router>
      </Provider>
    </div>
  )
}
