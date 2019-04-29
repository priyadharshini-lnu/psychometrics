import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import api from 'middleware/api'
import createSagaMiddleware from 'redux-saga'
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

const store = createStore(
  rootReducers,
  initState,
  composeEnhancers(applyMiddleware(api, sagaMiddleware, thunk, logger)),
)

sagaMiddleware.run(rootSagas)

export default store
