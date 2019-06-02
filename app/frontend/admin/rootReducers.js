import { combineReducers } from 'redux'
import subjects from './core/threeSixtyCampaign/subjects'
import evaluators from './core/threeSixtyCampaign/evaluators'
import managers from './core/threeSixtyCampaign/managers'
import participantOptions from './core/threeSixtyCampaign/participantOptions/reducers'
import reportOptions from './core/threeSixtyCampaign/reportOptions/reducers'
import modals from './core/temp/modals'
import autocomplete from './core/temp/autocomplete'
import request from './core/temp/request'
import currentThreeSixtyCampaignId from './core/threeSixtyCampaign/currentThreeSixtyCampaignId'
import datasheetFields from './core/project/datasheetFields'
import participants from './core/threeSixtyCampaign/participants'
import relationships from './core/threeSixtyCampaign/relationships'
import selectedParticipantTab from './core/threeSixtyCampaign/selectedParticipantTab'
import nominationRequirements from './core/threeSixtyCampaign/nominationRequirements/reducers'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    subjects,
    evaluators,
    managers,
    participantOptions,
    reportOptions,
    participants,
    id: currentThreeSixtyCampaignId,
    selectedParticipantTab,
    nominationRequirements,
  }),
  project: combineReducers({
    datasheetFields,
    relationships,
  }),
  temp: combineReducers({
    modals,
    autocomplete,
    request,
  }),
})
