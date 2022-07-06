import { combineReducers } from 'redux'

import list from './list'
import total from './total'
import columnDefinitions from './columnDefinitions'
import permissions from './permissions'
import current from './current'

export default combineReducers({
  list,
  total,
  permissions,
  columnDefinitions,
  current,
})
