import { combineReducers } from 'redux'

import list from './list'
import total from './total'
import permissions from './permissions'
import registrationCodes from './registrationCodes'
import users from './users'
import assessors from './assessors'
import current from './current'
import reports from './reports'
import assessments from './assessments'
import userReports from './userReports'
import userAssessments from './userAssessments'
import campaignOptions from './campaignOptions'
import assessorAssessments from './assessorAssessments'
import campaignAssessorAssessments from './campaignAssessorAssessments'
import stats from './stats'
import { reducer as smsInvites } from './smsInvites'

import { reducer as proctoringSessions } from './proctoringSessions'

export default combineReducers({
  list,
  total,
  permissions,
  registrationCodes,
  users,
  assessors,
  current,
  reports,
  assessments,
  userReports,
  userAssessments,
  campaignOptions,
  assessorAssessments,
  campaignAssessorAssessments,
  smsInvites,
  proctoringSessions,
  stats,
  project: () => ({}),
})
