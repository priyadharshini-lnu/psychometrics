import { combineReducers } from 'redux'
import list from './list'
import total from './total'
import users from './users'
import current from './current'

export default combineReducers({
  list,
  total,
  users,
  current,
})
