import { createStore, applyMiddleware, compose } from 'redux'
import multi from 'redux-multi'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import api from 'middleware/api'
import rootReducers from '../rootReducers'
import initState from './initState'

let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
}

export default createStore(rootReducers, initState, composeEnhancers(applyMiddleware(api, logger, multi, thunk)))
