import { combineReducers } from 'redux'

import list from './list'
import total from './total'
import columnDefinitions from './columnDefinitions'
import current from './current'
import parentResource from './parentResource'

export default combineReducers({
  list,
  total,
  columnDefinitions,
  current,
  parentResource,
})
