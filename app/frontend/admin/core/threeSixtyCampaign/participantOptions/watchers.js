import {
  takeLatest, takeEvery, put, select, delay,
} from 'redux-saga/effects'
import { getId as getCurrentCampaignId } from '../currentThreeSixtyCampaignId'
import { set as setDatasheetFields, get as getDatasheetField } from '../../project/datasheetFields'

import {
  syncParticipantOptionsWithServer,
  getParticipantOption,
  addDatasheetCriteria,
  FETCH_PARTICIPANT_OPTIONS,
  UPDATE_PARTICIPANT_OPTIONS,
  ADD_DATASHEET_CRITERIA,
  REMOVE_DATASHEET_CRITERIA,
  UPDATE_DATASHEET_CRITERIA,
  ADD_DATASHEET_CRITERIA_WITH_DEFAULT_VALUE,
} from './actions'

function* genSyncParticipantOptionsWithServer () {
  yield delay(1000)
  const participantOption = yield select(getParticipantOption)
  const campaignId = yield select(getCurrentCampaignId)
  yield put(syncParticipantOptionsWithServer(campaignId, participantOption))
}

function* genAddDatasheetCriteriaWithValue ({ payload: { key } }) {
  const datasheetFields = yield select(getDatasheetField)
  yield put(addDatasheetCriteria(key, datasheetFields[0]))
}

const watchers = [
  takeLatest(
    [UPDATE_PARTICIPANT_OPTIONS, ADD_DATASHEET_CRITERIA, REMOVE_DATASHEET_CRITERIA, UPDATE_DATASHEET_CRITERIA],
    genSyncParticipantOptionsWithServer,
  ),
  takeLatest(FETCH_PARTICIPANT_OPTIONS, setDatasheetFields),
  takeEvery(ADD_DATASHEET_CRITERIA_WITH_DEFAULT_VALUE, genAddDatasheetCriteriaWithValue),
]

export default watchers
