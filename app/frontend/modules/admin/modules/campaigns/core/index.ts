import { combineReducers } from 'redux'
import list from './list'
import total from './total'
import registrationCodes from './registrationCodes'
import users from './users'
import assessors from './assessors'
import current from './current'
import reports from './reports'
import assessments from './assessments'
import userReports from './userReports'
import userAssessments from './userAssessments'
import assessmentGroups from './assessmentGroups'
import campaignOptions from './campaignOptions'

export default combineReducers({
  list,
  total,
  registrationCodes,
  users,
  assessors,
  current,
  reports,
  assessments,
  userReports,
  userAssessments,
  assessmentGroups,
  campaignOptions,
})
