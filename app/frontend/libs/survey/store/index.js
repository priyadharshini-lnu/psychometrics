import { createStore, applyMiddleware, compose } from 'redux'
import logger from 'redux-logger'
import api from 'middleware/api'
import createSagaMiddleware from 'redux-saga'
import socket from '../middleware/Socket'
import flow from '../core/preview/FlowProcessor/middleware'
import rootReducers from '../core/rootReducers'
import rootSagas from '../core/rootSagas'

const sagaMiddleware = createSagaMiddleware()

let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}

const middleware = [api, socket, sagaMiddleware, flow]

if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
  if (!__DISABLE_LOGGER_) {
    middleware.push(logger)
  }
}

const store = createStore(
  rootReducers,
  __INITIAL_STATE__,
  composeEnhancers(applyMiddleware(...middleware)),
)

sagaMiddleware.run(rootSagas)

export default store
