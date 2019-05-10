import {
  takeLatest, takeEvery, put, select, delay,
} from 'redux-saga/effects'
import { get as getCurrentCampaignId } from '../currentThreeSixtyCampaignId'
import { get as getDatasheetField } from '../../project/datasheetFields'

import {
  syncWithServer,
  addDatasheetCriteria,
  UPDATE_PARTICIPANT_OPTIONS,
  ADD_DATASHEET_CRITERIA,
  REMOVE_DATASHEET_CRITERIA,
  UPDATE_DATASHEET_CRITERIA,
  ADD_DATASHEET_CRITERIA_WITH_DEFAULT_VALUE,
} from './actions'
import { getParticipantOption } from './selectors'

function* genSyncWithServer () {
  yield delay(1000)
  const participantOption = yield select(getParticipantOption)
  const campaignId = yield select(getCurrentCampaignId)
  yield put(syncWithServer(campaignId, participantOption))
}

function* genAddDatasheetCriteriaWithValue ({ payload: { key } }) {
  const datasheetFields = yield select(getDatasheetField)
  yield put(addDatasheetCriteria(key, datasheetFields[0]))
}

const watchers = [
  takeLatest(
    [UPDATE_PARTICIPANT_OPTIONS, ADD_DATASHEET_CRITERIA, REMOVE_DATASHEET_CRITERIA, UPDATE_DATASHEET_CRITERIA],
    genSyncWithServer,
  ),
  takeEvery(ADD_DATASHEET_CRITERIA_WITH_DEFAULT_VALUE, genAddDatasheetCriteriaWithValue),
]

export default watchers
