import { combineReducers } from 'redux'
import list from './list'
import total from './total'
import registrationCodes from './registrationCodes'
import users from './users'
import current from './current'
import reports from './reports'
import assessments from './assessments'

export default combineReducers({
  list,
  total,
  registrationCodes,
  users,
  current,
  reports,
  assessments,
})
