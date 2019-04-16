import { combineReducers } from 'redux'
import subjects from './core/threeSixtyCampaign/subjects'
import evaluators from './core/threeSixtyCampaign/evaluators'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    subjects,
    evaluators,
  }),
})
