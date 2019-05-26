import {
  takeLatest, put, select, delay,
} from 'redux-saga/effects'
import { get as getCurrentCampaignId } from '../currentThreeSixtyCampaignId'

import {
  syncWithServer,
  UPDATE_REPORT_OPTIONS,
  ADD_AVAILABILITY_CONDITION,
  ADD_NEW_LOGIC_SET_CONDITION,
  MOVE_CONDITION_TO_NEW_LOGIC_SET,
  REMOVE_AVAILABILITY_CONDITION,
  UPDATE_AVAILABILITY_CONDITION,
} from './actions'

import { getReportOption } from './selectors'

function* genSyncWithServer () {
  yield delay(1000)
  const reportOption = yield select(getReportOption)
  const campaignId = yield select(getCurrentCampaignId)
  yield put(syncWithServer(campaignId, reportOption))
}

const watchers = [
  takeLatest(
    [
      UPDATE_REPORT_OPTIONS,
      ADD_AVAILABILITY_CONDITION,
      ADD_NEW_LOGIC_SET_CONDITION,
      MOVE_CONDITION_TO_NEW_LOGIC_SET,
      REMOVE_AVAILABILITY_CONDITION,
      UPDATE_AVAILABILITY_CONDITION,
    ],
    genSyncWithServer,
  ),
]

export default watchers
