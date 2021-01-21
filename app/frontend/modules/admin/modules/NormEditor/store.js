import { createStore, applyMiddleware, compose } from 'redux'
import logger from 'redux-logger'
import api from 'middleware/api'

let composeEnhancers = compose

/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'Norm Editor' })
  }
}

const store = createStore(
  () => ({}),
  {},
  composeEnhancers(applyMiddleware(api, logger)),
)

export default store
