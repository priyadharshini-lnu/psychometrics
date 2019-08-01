import {
  takeLatest, put, select, delay,
} from 'redux-saga/effects'
import { getCurrentCampaignId } from '../campaignDetails'

import {
  syncWithServer,
  UPDATE,
} from './actions'

import {
  ADD as ADD_AVAILABILITY_CONDITION,
  REMOVE as REMOVE_AVAILABILITY_CONDITION,
  UPDATE as UPDATE_AVAILABILITY_CONDITION,
  ADD_NEW_LOGIC_SET_CONDITION,
  MOVE_CONDITION_TO_NEW_LOGIC_SET,
} from './availabilityConditions'

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
      UPDATE,
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
