import { createStore, applyMiddleware, compose } from 'redux'
import logger from 'redux-logger'
import api from 'middleware/api'
import createSagaMiddleware from 'redux-saga'
import _ from 'lodash'
import rootSagas from '../rootSagas'
import rootReducers from '../rootReducers'
import initState from './initState'

const sagaMiddleware = createSagaMiddleware()
let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
}

const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}

const store = createStore(rootReducers, _.merge(
  initState, __INITIAL_STATE__,
), composeEnhancers(applyMiddleware(api, sagaMiddleware, logger)))

sagaMiddleware.run(rootSagas)

export default store
