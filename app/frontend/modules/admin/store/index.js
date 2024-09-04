import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import { createBrowserHistory } from 'history'
import socket from '~/middleware/socket'
import api from '~/middleware/api'
import flowMiddleware from '~/modules/survey/core/preview/FlowProcessor/middleware'
import rootSagas from '../core/rootSagas'
import rootReducers from '../core/rootReducers'

export const history = createBrowserHistory()

const sagaMiddleware = createSagaMiddleware()
let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: `Admin#${location.pathname}` })
  }
}

const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}

const store = createStore(
  rootReducers(),
  __INITIAL_STATE__,
  composeEnhancers(applyMiddleware(api, socket, sagaMiddleware, flowMiddleware, thunk)),
)

sagaMiddleware.run(rootSagas)

export default store
