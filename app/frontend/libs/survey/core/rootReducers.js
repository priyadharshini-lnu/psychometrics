import { combineReducers } from 'redux'
import modals from './modals'
import builder from './builder'

export default combineReducers({
  survey: combineReducers({
    modals,
    builder: combineReducers(builder),
  }),
})
