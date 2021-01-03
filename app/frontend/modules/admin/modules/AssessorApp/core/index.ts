import { combineReducers } from 'redux'
import campaigns from './campaigns'
import users from './users'
import userAssessments from './userAssessments'

export default combineReducers({
  campaigns,
  users,
  userAssessments,
})
