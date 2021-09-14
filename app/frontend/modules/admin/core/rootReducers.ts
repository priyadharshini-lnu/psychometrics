import { combineReducers } from 'redux'
import currentUser from 'core/currentUser'
import config from 'core/config'
import { connectRouter } from 'connected-react-router'
import tables from 'modules/admin/core/filterAndPagination/reducers'
import preview from 'modules/survey/core/preview'
import connection from 'core/connection'
import campaignReducers from '../modules/campaigns/core'
import { reducer as smtpSettingReducer } from '../modules/projects/core/smtpSetting'
import subjects from '../modules/threeSixtyCampaign/core/subjects'
import evaluators from '../modules/threeSixtyCampaign/core/evaluators'
import managers from '../modules/threeSixtyCampaign/core/managers'
import participantOptions from '../modules/threeSixtyCampaign/core/participantOptions/reducers'
import reportOptions from '../modules/threeSixtyCampaign/core/reportOptions/reducers'
import modals from './ui/modals'
import autocomplete from './ui/autocomplete'
import breadcrumbs from './ui/breadcrumbs'
import request from './request'
import datasheetFields from '../modules/threeSixtyCampaign/core/datasheetFields'
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
import assessorsReducers from '../modules/AssessorApp/core'
import datasheetReducers from '../modules/DatasheetManagement/core'

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
    smtpSetting: smtpSettingReducer,
  }),
  ui: combineReducers({
    modals,
    autocomplete,
    breadcrumbs,
  }),
  currentUser,
  config,
  request,
  tables,
  campaigns: campaignReducers,
  assessors: assessorsReducers,
  datasheet: datasheetReducers,
  preview,
  connection,
})

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>

export default createRootReducer
