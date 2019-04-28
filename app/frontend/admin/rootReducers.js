import { combineReducers } from 'redux'
import subjects from './core/threeSixtyCampaign/subjects'
import evaluators from './core/threeSixtyCampaign/evaluators'
import managers from './core/threeSixtyCampaign/managers'
import modals from './core/temp/modals'
import autocomplete from './core/temp/autocomplete'
import relationships from './core/threeSixtyCampaign/relationships'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    subjects,
    evaluators,
    managers,
    relationships,
  }),
  temp: combineReducers({
    modals,
    autocomplete,
  }),
})
