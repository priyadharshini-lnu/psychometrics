import { combineReducers } from 'redux'
import subjects from './core/threeSixtyCampaign/subjects'
import evaluators from './core/threeSixtyCampaign/evaluators'
import managers from './core/threeSixtyCampaign/managers'
import modals from './core/modals'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    subjects,
    evaluators,
    managers,
  }),
  temp: combineReducers({
    modals,
  }),
})
