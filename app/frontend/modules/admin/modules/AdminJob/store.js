import { createStore, applyMiddleware, compose } from 'redux'
import api from '~/middleware/api'
import rootReducers from './core/rootReducers'

let composeEnhancers = compose

/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'Admin Jobs' })
  }
}

const store = createStore(
  rootReducers,
  {},
  composeEnhancers(applyMiddleware(api)),
)

export default store
