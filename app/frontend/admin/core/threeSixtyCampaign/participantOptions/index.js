import _ from 'lodash'
import {
  takeLatest, put, select, delay,
} from 'redux-saga/effects'
import { genShowSpinner, genHideSpinner } from '../../temp/spinner'
import { getId as getCurrentCampaignId } from '../currentThreeSixtyCampaignId'

export const FETCH_PARTICIPANT_OPTIONS = 'threeSixty/option/participants/FETCH_PARTICIPANT_OPTIONS'
export const UPDATE_PARTICIPANT_OPTIONS = 'threeSixty/option/participants/UPDATE_PARTICIPANT_OPTIONS'
export const SYNC_PARTICIPANT_OPTIONS = 'threeSixty/option/participants/SYNC_PARTICIPANT_OPTIONS'
export const ADD_DATASHEET_CRITERIA = 'threeSixty/option/participants/ADD_DATASHEET_CRITERIA'
export const REMOVE_DATASHEET_CRITERIA = 'threeSixty/option/participants/REMOVE_DATASHEET_CRITERIA'
export const UPDATE_DATASHEET_CRITERIA = 'threeSixty/option/participants/UPDATE_DATASHEET_CRITERIA'

export const getParticipantOption = state => _.get(state, ['threeSixtyCampaign', 'participantOptions'])
export const getSubjectOption = state => _.get(getParticipantOption(state), ['subject'])
export const getManagerOption = state => _.get(getParticipantOption(state), ['manager'])
export const getEvaluatorOption = state => _.get(getParticipantOption(state), ['evaluator'])

export const fetchParticipantOptions = campaignId => ({
  type: FETCH_PARTICIPANT_OPTIONS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/options/participant_options`,
  },
})

const syncParticipantOptionsWithServer = (campaignId, options) => ({
  type: SYNC_PARTICIPANT_OPTIONS,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { participants: options },
  },
})

export const updateParticipantOptions = (key, value) => ({
  type: UPDATE_PARTICIPANT_OPTIONS,
  payload: { key, value },
})

export const addDatasheetCriteria = key => ({
  type: ADD_DATASHEET_CRITERIA,
  payload: { key },
})

export const removeDatasheetCriteria = (key, index) => ({
  type: REMOVE_DATASHEET_CRITERIA,
  payload: { key, index },
})

export const updateDatasheetCriteria = (key, index, name, value) => ({
  type: UPDATE_DATASHEET_CRITERIA,
  payload: {
    key,
    index,
    name,
    value,
  },
})

function* genSyncParticipantOptionsWithServer () {
  yield delay(1000)
  const participantOption = yield select(getParticipantOption)
  const campaignId = yield select(getCurrentCampaignId)
  yield put(syncParticipantOptionsWithServer(campaignId, participantOption.options))
}

export const watchers = [
  takeLatest(
    [UPDATE_PARTICIPANT_OPTIONS, ADD_DATASHEET_CRITERIA, REMOVE_DATASHEET_CRITERIA, UPDATE_DATASHEET_CRITERIA],
    genSyncParticipantOptionsWithServer,
  ),
  takeLatest(`${FETCH_PARTICIPANT_OPTIONS}_REQUEST`, genShowSpinner),
  takeLatest([`${FETCH_PARTICIPANT_OPTIONS}`], genHideSpinner),
  takeLatest(`${FETCH_PARTICIPANT_OPTIONS}`, genShowSpinner),
]

function updateParticipantOptionToState (state, { key, value }) {
  return { ...state, options: { ...state.options, [key]: value } }
}

function addDataSheetCriteriaToState (state, { key }) {
  const { options, datasheetFields } = state
  const criteria = (options[key] || []).concat([{ operator: 'is_same_as_subject', field: datasheetFields[0] }])
  return updateParticipantOptionToState(state, { key, value: criteria })
}

function removeDataSheetCriteriaToState (state, { key, index }) {
  const { options } = state
  const criteria = options[key].map((_, i) => index === i)
  return updateParticipantOptionToState(state, { key, value: criteria })
}

function updateDataSheetCriteriaToState (state, {
  key, index, name, value,
}) {
  const { options } = state
  const criteria = options[key].map((criteria, i) => {
    if (i !== index) {
      return criteria
    }
    return { ...criteria, [name]: value }
  })
  return updateParticipantOptionToState(state, { key, value: criteria })
}

export const defaultState = { options: {}, datasheetFields: [] }
export default function reducer (state = defaultState, { type, payload, response }) {
  switch (type) {
    case FETCH_PARTICIPANT_OPTIONS:
      return response
    case UPDATE_PARTICIPANT_OPTIONS:
      return updateParticipantOptionToState(state, payload)
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
