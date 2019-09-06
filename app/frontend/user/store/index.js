import { createStore, applyMiddleware, compose } from 'redux'
import logger from 'redux-logger'
import api from 'middleware/api'
import createSagaMiddleware from 'redux-saga'
import rootReducers from '../rootReducers'
import rootSagas from '../rootSagas'

const sagaMiddleware = createSagaMiddleware()

let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}

if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
}

const store = createStore(
  rootReducers,
  __INITIAL_STATE__,
  composeEnhancers(applyMiddleware(api, sagaMiddleware, logger)),
)

sagaMiddleware.run(rootSagas)

export default store
