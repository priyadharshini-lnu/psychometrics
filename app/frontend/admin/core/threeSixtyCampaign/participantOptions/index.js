import _ from 'lodash'
import {
  takeLatest, put, select, delay,
} from 'redux-saga/effects'
import { genShowSpinner, genHideSpinner } from '../../temp/spinner'

export const FETCH_PARTICIPATION_OPTIONS = 'threeSixty/option/participations/FETCH_PARTICIPATION_OPTIONS'
export const UPDATE_PARTICIPATION_OPTIONS = 'threeSixty/option/participations/UPDATE_PARTICIPATION_OPTIONS'
export const SYNC_PARTICIPATION_OPTIONS = 'threeSixty/option/participations/SYNC_PARTICIPATION_OPTIONS'
export const ADD_DATASHEET_CRITERIA = 'threeSixty/option/participations/ADD_DATASHEET_CRITERIA'
export const REMOVE_DATASHEET_CRITERIA = 'threeSixty/option/participations/REMOVE_DATASHEET_CRITERIA'
export const UPDATE_DATASHEET_CRITERIA = 'threeSixty/option/participations/UPDATE_DATASHEET_CRITERIA'

export const getParticipantOption = state => _.get(state, ['threeSixtyCampaign', 'participantOptions'])

export const fetchParticipationOptions = campaignId => ({
  type: FETCH_PARTICIPATION_OPTIONS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/options/participation_options`,
  },
})

const syncParticipationOptionsWithServer = (campaignId, options) => ({
  type: SYNC_PARTICIPATION_OPTIONS,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { participants: options },
  },
})

export const updateParticipationOptions = (campaignId, key, value) => ({
  type: UPDATE_PARTICIPATION_OPTIONS,
  payload: { campaignId, key, value },
})

export const addDatasheetCriteria = (campaignId, key) => ({
  type: ADD_DATASHEET_CRITERIA,
  payload: { campaignId, key },
})

export const removeDatasheetCriteria = (campaignId, key, index) => ({
  type: REMOVE_DATASHEET_CRITERIA,
  payload: { campaignId, key, index },
})

export const updateDatasheetCriteria = (campaignId, key, index, name, value) => ({
  type: UPDATE_DATASHEET_CRITERIA,
  payload: {
    campaignId,
    key,
    index,
    name,
    value,
  },
})

function* genSyncParticipationOptionsWithServer ({ payload: { campaignId } }) {
  yield delay(1000)
  const participantOption = yield select(getParticipantOption)
  yield put(syncParticipationOptionsWithServer(campaignId, participantOption.options))
}

export const watchers = [
  takeLatest(
    [UPDATE_PARTICIPATION_OPTIONS, ADD_DATASHEET_CRITERIA, REMOVE_DATASHEET_CRITERIA, UPDATE_DATASHEET_CRITERIA],
    genSyncParticipationOptionsWithServer,
  ),
  takeLatest(`${FETCH_PARTICIPATION_OPTIONS}_REQUEST`, genShowSpinner),
  takeLatest([`${FETCH_PARTICIPATION_OPTIONS}`], genHideSpinner),
]

function updateParticipationOptionToState (state, { key, value }) {
  return { ...state, options: { ...state.options, [key]: value } }
}

function addDataSheetCriteriaToState (state, { key }) {
  const { options, datasheetFields } = state
  const criterias = (options[key] || []).concat([{ operator: 'is_same_as_subject', field: datasheetFields[0] }])
  return updateParticipationOptionToState(state, { key, value: criterias })
}

function removeDataSheetCriteriaToState (state, { key, index }) {
  const { options } = state
  const criterias = [...options[key]]
  criterias.splice(index, 1)
  return updateParticipationOptionToState(state, { key, value: criterias })
}

function updateDataSheetCriteriaToState (state, {
  key, index, name, value,
}) {
  const { options } = state
  const criterias = options[key].map((criteria, i) => {
    if (i !== index) {
      return criteria
    }
    return { ...criteria, [name]: value }
  })
  return updateParticipationOptionToState(state, { key, value: criterias })
}

export const defaultState = { options: {}, datasheet_fields: [] }
export default function reducer (state = defaultState, { type, payload, response }) {
  switch (type) {
    case FETCH_PARTICIPATION_OPTIONS:
      return response
    case UPDATE_PARTICIPATION_OPTIONS:
      return updateParticipationOptionToState(state, payload)
    case ADD_DATASHEET_CRITERIA:
      return addDataSheetCriteriaToState(state, payload)
    case REMOVE_DATASHEET_CRITERIA:
      return removeDataSheetCriteriaToState(state, payload)
    case UPDATE_DATASHEET_CRITERIA:
      return updateDataSheetCriteriaToState(state, payload)
    default:
      return state
  }
}
