import { combineReducers } from 'redux'
import campaigns from './campaigns'
import users from './users'

export default combineReducers({
  campaigns,
  users,
})
