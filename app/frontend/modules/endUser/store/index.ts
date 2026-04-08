import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { createBrowserHistory } from 'history'
import createSagaMiddleware from 'redux-saga'
import api from '~/middleware/api'
import flowMiddleware from '~/modules/survey/core/preview/FlowProcessor/middleware'
import { idpApi } from '../modules/campaigns/core/idp/api'
import { systemChecksAPI } from '../modules/campaigns/core/systemChecks/api'
import rootReducers from '../core/rootReducers'
import rootSagas from '../core/rootSagas'

export const history = createBrowserHistory()
const sagaMiddleware = createSagaMiddleware()

let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}
const middleware = [api, sagaMiddleware, flowMiddleware, thunk, idpApi.middleware, systemChecksAPI.middleware]

if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'User store' })
  }
}

const store = createStore(
  rootReducers(),
  __INITIAL_STATE__,
  composeEnhancers(applyMiddleware(...middleware)),
)

sagaMiddleware.run(rootSagas)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
