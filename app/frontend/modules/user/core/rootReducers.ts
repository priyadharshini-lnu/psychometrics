import { combineReducers } from 'redux'
import preview from 'modules/survey/core/preview'
import reportBuilder from 'modules/reports/core/builder'
import currentUser from 'core/currentUser'
import campaign from '../modules/campaigns/core/campaign'
import campaigns from '../modules/campaigns/core/campaigns'
import nomination from '../modules/campaigns/core/nomination'
import evaluation from '../modules/campaigns/core/evaluation'
import assign from '../modules/campaigns/core/assign'
import userAssessment from '../modules/campaigns/core/userAssessment'
import report from '../modules/campaigns/core/report'
import checkingWizard from '../modules/campaigns/core/checkingWizard'
import autocomplete from './ui/autocomplete'
import project from '../modules/campaigns/core/project'
import config from './config'

const rootReducer = combineReducers({
  campaigns: combineReducers({
    campaign,
    nomination,
    evaluation,
    report,
    campaigns,
    assign,
    project,
    userAssessment,
  }),
  ui: combineReducers({
    autocomplete,
  }),
  currentUser,
  config,
  preview,
  report: combineReducers({ builder: reportBuilder }),
  checkingWizard,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
