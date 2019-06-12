import React from 'react'
import {
  BrowserRouter as Router, Route,
} from 'react-router-dom'
import store from 'user/store'
import { Provider } from 'react-redux'
import routes from '../routes'
import PageLayout from './PageLayout'

export default function App () {
  return (
    <Provider store={store}>
      <Router>
        <PageLayout>
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
