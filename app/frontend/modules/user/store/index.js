import { createStore, applyMiddleware, compose } from 'redux'
import logger from 'redux-logger'
import api from 'middleware/api'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import createSagaMiddleware from 'redux-saga'
import flowMiddleware from 'modules/survey/core/preview/FlowProcessor/middleware'
import rootReducers from '../core/rootReducers'
import rootSagas from '../core/rootSagas'

export const history = createBrowserHistory()
const sagaMiddleware = createSagaMiddleware()

let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}
const middleware = [api, sagaMiddleware, flowMiddleware, thunk, routerMiddleware(history)]

if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
  if (!__DISABLE_LOGGER_) {
    middleware.push(logger)
  }
}

const store = createStore(
  rootReducers(history),
  __INITIAL_STATE__,
  composeEnhancers(applyMiddleware(...middleware)),
)

sagaMiddleware.run(rootSagas)

export default store
