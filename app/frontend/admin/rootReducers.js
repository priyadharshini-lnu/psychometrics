import { combineReducers } from 'redux'
import subjects from './core/threeSixtyCampaign/subjects'
import evaluators from './core/threeSixtyCampaign/evaluators'
import managers from './core/threeSixtyCampaign/managers'
import participantOptions from './core/threeSixtyCampaign/participantOptions/reducers'
import modals from './core/temp/modals'
import autocomplete from './core/temp/autocomplete'
import request from './core/temp/request'
import currentThreeSixtyCampaignId from './core/threeSixtyCampaign/currentThreeSixtyCampaignId'
import datasheetFields from './core/project/datasheetFields'
import participants from './core/threeSixtyCampaign/participants'
import relationships from './core/threeSixtyCampaign/relationships'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    subjects,
    evaluators,
    managers,
    participantOptions,
    id: currentThreeSixtyCampaignId,
  }),
  project: combineReducers({
    datasheetFields,
    relationships,
    participants,
  }),
  temp: combineReducers({
    modals,
    autocomplete,
    request,
  }),
})
