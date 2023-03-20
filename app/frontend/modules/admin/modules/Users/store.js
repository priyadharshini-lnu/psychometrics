import {
  createStore, combineReducers, applyMiddleware, compose,
} from 'redux'
import { all } from 'redux-saga/effects'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import { createBrowserHistory } from 'history'
import filterAndPaginationWatcher from '~/modules/admin/core/filterAndPagination/watchers'
import currentUser from '~/core/currentUser'

import api from '~/middleware/api'
import tables from '~/modules/admin/core/filterAndPagination/reducers'
import breadcrumbs from '~/modules/admin/core/ui/breadcrumbs'
import modals from '~/modules/admin/core/ui/modals'

export const history = createBrowserHistory()

const sagaMiddleware = createSagaMiddleware()
let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'Users CRUD' })
  }
}

const createRootReducer = history => combineReducers({
  router: connectRouter(history),
  tables,
  currentUser,
  ui: combineReducers({ breadcrumbs, modals }),
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
