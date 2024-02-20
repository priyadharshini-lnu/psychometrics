import { combineReducers } from 'redux'
import campaigns from './campaigns'
import users from './users'
import userAssessments from './userAssessments'
import userReports from './userReports'
import evaluation from './evaluation'
import scoreModerate from './scoreModerate'

export default combineReducers({
  campaigns,
  users,
  userAssessments,
  userReports,
  evaluation,
  scoreModerate,
})
