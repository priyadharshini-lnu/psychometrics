import { combineReducers } from 'redux'

import current from '~/modules/admin/modules/campaigns/core/current'
import tables from '~/modules/admin/core/filterAndPagination/reducers'
import preview from '~/modules/survey/core/preview'
import { reducer as projectAssessorsReducers } from '~/modules/admin/modules/client/core/assessors'
import { reducer as projectParticipantsReducer } from '~/modules/admin/modules/client/core/participants'
import { reducer as individualDashboardReducer } from '~/modules/admin/modules/IndividualDashboard/core'
import { reducer as projectReducer } from '~/modules/admin/modules/client/core/projects'
import connection from '~/core/connection'
import config from '~/core/config'
import currentUser from '~/core/currentUser'
import request from '~/core/request'
import socket from '~/core/socket'
import campaignReducers from '../modules/campaigns/core'
import { reducer as smtpSettingReducer } from '../modules/client/core/smtpSetting'
import { reducer as samlSettingReducer } from '../modules/client/core/samlSetting'
import { reducer as securitySettingReducer } from '../modules/client/core/securitySetting'
import { reducer as designSettingsReducer } from '../modules/client/core/designSettings'
import { reducer as assessmentsReducer } from '../modules/client/core/assessments'
import subjects from '../modules/threeSixtyCampaign/core/subjects'
import evaluators from '../modules/threeSixtyCampaign/core/evaluators'
import managers from '../modules/threeSixtyCampaign/core/managers'
import participantOptions from '../modules/threeSixtyCampaign/core/participantOptions/reducers'
import reportOptions from '../modules/threeSixtyCampaign/core/reportOptions/reducers'
import modals from './ui/modals'
import menu from './ui/menu'
import autocomplete from './ui/autocomplete'
import breadcrumbs from './ui/breadcrumbs'
import temp from './ui/temp'
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
import campaignAssessments from '../modules/threeSixtyCampaign/core/campaignAssessments'
import assessorsReducers from '../modules/AssessorApp/core'
import sheetReducers from '../modules/SheetManagement/core'
import { reducer as integrationsReducer } from '../modules/client/core/integrations'
import auditLogs from '../modules/AuditLog/core'
import errors from '~/core/errors'

const createRootReducer = () => combineReducers({
  socket,
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
    campaignAssessments,
  }),
  project: combineReducers({
    datasheetFields,
    relationships,
    smtpSetting: smtpSettingReducer,
    samlSetting: samlSettingReducer,
    securitySetting: securitySettingReducer,
    designSettings: designSettingsReducer,
    assessments: assessmentsReducer,
    assessors: projectAssessorsReducers,
    participants: projectParticipantsReducer,
    integrations: integrationsReducer,
    clientId: projectReducer,
  }),
  ui: combineReducers({
    modals,
    autocomplete,
    breadcrumbs,
    menu,
    temp,
  }),
  currentUser,
  current,
  config,
  request,
  errors,
  tables,
  campaigns: campaignReducers,
  assessors: assessorsReducers,
  sheet: sheetReducers,
  preview,
  connection,
  auditLogs,
  individualDashboard: individualDashboardReducer,
  liveChat: () => ({}),
  flash: () => ({}),
})

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>

export default createRootReducer
