import { combineReducers } from 'redux'
import builder from './builder'
import temp from './temp'
import preview from './preview'

export default combineReducers({
  survey: combineReducers({
    builder: combineReducers(builder),
    temp: combineReducers(temp),
  }),
  preview,
})
