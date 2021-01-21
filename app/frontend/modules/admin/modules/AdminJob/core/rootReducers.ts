import { combineReducers } from 'redux'
import adminJobs from './adminJobs'

const rootReducer = combineReducers({
  adminJobs,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
