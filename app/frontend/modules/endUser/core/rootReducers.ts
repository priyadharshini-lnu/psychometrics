import { combineReducers } from 'redux'
import preview from '~/modules/survey/core/preview'
import reportBuilder from '~/modules/reports/core/builder'
import currentUser from '~/core/currentUser'
import connection from '~/core/connection'
import request from '~/core/request'
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
import idp from '../modules/campaigns/core/idp/developmentAction'
import anonym from '../modules/campaigns/core/anonym'
import workshop from '~/modules/endUser/modules/campaigns/core/workshops'
import config from './config'
import flash from '~/core/flash'

const rootReducer = () => combineReducers({
  campaigns: combineReducers({
    campaign,
    nomination,
    evaluation,
    report,
    idp,
    campaigns,
    assign,
    project,
    userAssessment,
    workshop,
  }),
  ui: combineReducers({
    autocomplete,
  }),
  request,
  anonym,
  project,
  currentUser,
  flash,
  config,
  preview,
  report: combineReducers({ builder: reportBuilder }),
  checkingWizard,
  connection,
})

export type RootState = ReturnType<ReturnType<typeof rootReducer>>

export default rootReducer
