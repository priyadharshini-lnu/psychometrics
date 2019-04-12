import { combineReducers } from 'redux'
import subjects from './core/threeSixtyCampaign/subjects'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    subjects,
  }),
})
