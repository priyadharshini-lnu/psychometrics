import {
  createStore, applyMiddleware, compose, combineReducers,
} from 'redux'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import api from '~/middleware/api'
import preview from '~/modules/survey/core/preview'
import flowMiddleware from '~/modules/survey/core/preview/FlowProcessor/middleware'
import rootSagas from '~/modules/endUser/core/rootSagas'
import connection from '~/core/connection'
import evaluation from '../modules/AssessorApp/core/evaluation'

let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
const __INITIAL_STATE__ = window.__INITIAL_STATE__ || {}

if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
}

const rootReducers = combineReducers({
  assessors: combineReducers({ evaluation }),
  preview,
  connection,
})

export type RootState = ReturnType<typeof rootReducers>

export default (): ReturnType<typeof createStore> => {
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(
    rootReducers,
    __INITIAL_STATE__,
    composeEnhancers(applyMiddleware(api, sagaMiddleware, flowMiddleware, thunk)),
  )
  sagaMiddleware.run(rootSagas)
  return store
}
