import { combineReducers } from 'redux'
import modals from './modals'
import builder from './builder'
import temp from './temp'
import preview from './preview'

export default combineReducers({
  survey: combineReducers({
    modals,
    builder: combineReducers(builder),
    temp: combineReducers(temp),
  }),
  preview,
})
