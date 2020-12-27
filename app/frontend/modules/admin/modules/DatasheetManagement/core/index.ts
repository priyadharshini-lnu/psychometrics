import { combineReducers } from 'redux'
import list from './list'
import total from './total'
import parentResource from './parentResource'

export default combineReducers({
  list,
  total,
  parentResource,
})
