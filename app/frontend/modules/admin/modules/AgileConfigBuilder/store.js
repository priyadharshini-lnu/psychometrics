import {
  createStore, applyMiddleware, compose, combineReducers,
} from 'redux'
import api from '~/middleware/api'
import modals from '~/modules/admin/core/ui/modals'
import extra from './actions'


let composeEnhancers = compose
/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'Agile Config Builder' })
  }
}

const rootReducer = combineReducers({
  ui: combineReducers({
    modals,
  }),
  settings: extra,
})

const store = createStore(
  rootReducer,
  {},
  composeEnhancers(applyMiddleware(api)),
)


export default store
