import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import api from 'middleware/api'
import 'styles/ant.less'
import { createBrowserHistory } from 'history'
import App from 'modules/auth/App'
import reducers from 'modules/auth/core/reducers'

let composeEnhancers = compose
export const history = createBrowserHistory()

/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'User#Login' })
  }
}

const store = createStore(
  reducers(history),
  window.__INITIAL_STATE__ || {},
  composeEnhancers(applyMiddleware(api)),
)

const element = document.getElementById('devise')

if (element) {
  ReactDOM.render(
    <Provider store={store}>
      <App history={history} />
    </Provider>, element,
  )
}

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
