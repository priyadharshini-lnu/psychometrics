import {
  createStore, combineReducers, applyMiddleware, compose,
} from 'redux'
import { all } from 'redux-saga/effects'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import { createBrowserHistory } from 'history'
import filterAndPaginationWatcher from '~/modules/admin/core/filterAndPagination/watchers'

import api from '~/middleware/api'
import tables from '~/modules/admin/core/filterAndPagination/reducers'
import menu from '~/modules/admin/core/ui/menu'

import currentUser from '~/core/currentUser'
import auditLogs from '../../modules/AuditLog/core'

export const history = createBrowserHistory()

const sagaMiddleware = createSagaMiddleware()
let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'Admin store' })
  }
}

const createRootReducer = history => combineReducers({
  router: connectRouter(history),
  tables,
  auditLogs,
  currentUser,
  ui: combineReducers({ menu }),
})

const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}

const store = createStore(
  createRootReducer(history),
  __INITIAL_STATE__,
  composeEnhancers(applyMiddleware(api, sagaMiddleware, routerMiddleware(history), thunk)),
)


sagaMiddleware.run(
  function* () {
    yield all([
      ...filterAndPaginationWatcher,
    ])
  },
)

export default store
