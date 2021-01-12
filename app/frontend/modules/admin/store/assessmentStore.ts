/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createStore, applyMiddleware, compose, combineReducers,
} from 'redux'
import logger from 'redux-logger'
import api from 'middleware/api'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import preview from 'modules/survey/core/preview'
import flowMiddleware from 'modules/survey/core/preview/FlowProcessor/middleware'
import rootSagas from 'modules/user/core/rootSagas'
import connection from 'core/connection'
import evaluation from '../modules/AssessorApp/core/evaluation'

const sagaMiddleware = createSagaMiddleware()

let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}
const { __DEV__, __DISABLE_LOGGER_ } = window
const middleware = [api, sagaMiddleware, flowMiddleware, thunk]

if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
  if (!__DISABLE_LOGGER_) {
    middleware.push(logger)
  }
}

const rootReducers = combineReducers({
  assessors: combineReducers({ evaluation }),
  preview,
  connection,
})

export type RootState = ReturnType<typeof rootReducers>

export default (): ReturnType<typeof createStore> => {
  const store = createStore(
    rootReducers,
    __INITIAL_STATE__,
    composeEnhancers(applyMiddleware(...middleware)),
  )
  sagaMiddleware.run(rootSagas)
  return store
}
