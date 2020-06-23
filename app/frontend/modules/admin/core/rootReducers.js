import { combineReducers } from 'redux'
import currentUser from 'core/temp/currentUser'
import { connectRouter } from 'connected-react-router'
import campaignReducers from 'modules/admin/campaigns/core'
import tables from 'modules/admin/filterAndPagination/reducers'
import subjects from '../modules/threeSixtyCampaign/core/subjects'
import evaluators from '../modules/threeSixtyCampaign/core/evaluators'
import managers from '../modules/threeSixtyCampaign/core/managers'
import participantOptions from '../modules/threeSixtyCampaign/core/participantOptions/reducers'
import reportOptions from '../modules/threeSixtyCampaign/core/reportOptions/reducers'
import modals from './temp/modals'
import autocomplete from './temp/autocomplete'
import request from './temp/request'
import datasheetFields from './project/datasheetFields'
import participants from '../modules/threeSixtyCampaign/core/participants'
import relationships from '../modules/threeSixtyCampaign/core/relationships'
import selectedParticipantTab from '../modules/threeSixtyCampaign/core/selectedParticipantTab'
import nominationRequirements from '../modules/threeSixtyCampaign/core/nominationRequirements/reducers'
import messageOptions from '../modules/threeSixtyCampaign/core/messageOptions'
import emailTemplates from '../modules/threeSixtyCampaign/core/emailTemplates'
import emailSchedules from '../modules/threeSixtyCampaign/core/emailSchedules'
import instructionTemplates from '../modules/threeSixtyCampaign/core/instructionTemplates'
import campaignDetails from '../modules/threeSixtyCampaign/core/campaignDetails'
import mailHistories from '../modules/threeSixtyCampaign/core/mailHistories'
import users from '../modules/threeSixtyCampaign/core/users'

const createRootReducer = history => combineReducers({
  router: connectRouter(history),
  threeSixtyCampaign: combineReducers({
    subjects,
    evaluators,
    managers,
    participantOptions,
    reportOptions,
    participants,
    campaignDetails,
    selectedParticipantTab,
    nominationRequirements,
    messageOptions,
    emailTemplates,
    emailSchedules,
    instructionTemplates,
    mailHistories,
    users,
  }),
  project: combineReducers({
    datasheetFields,
    relationships,
  }),
  temp: combineReducers({
    modals,
    autocomplete,
    request,
    currentUser,
  }),
  tables,
  campaigns: campaignReducers,
})

export default createRootReducer
