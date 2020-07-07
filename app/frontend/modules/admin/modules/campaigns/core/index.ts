import { combineReducers } from 'redux'
import list from './list'
import total from './total'
import current from './current'

export default combineReducers({
  list,
  total,
  current,
})
