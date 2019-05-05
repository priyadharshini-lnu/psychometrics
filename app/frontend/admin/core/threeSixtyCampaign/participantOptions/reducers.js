import _ from 'lodash'
import {
  FETCH_PARTICIPANT_OPTIONS,
  UPDATE_PARTICIPANT_OPTIONS,
  ADD_DATASHEET_CRITERIA,
  REMOVE_DATASHEET_CRITERIA,
  UPDATE_DATASHEET_CRITERIA,
} from './actions'

function updateParticipantOptionToState (state, { key: [parentKey, childKey], value }) {
  let childValue = state[parentKey]
  childValue = { ...childValue, [childKey]: value }
  return { ...state, [parentKey]: childValue }
}

function addDataSheetCriteriaToState (state, { key, value }) {
  const criteria = (_.get(state, key) || []).concat([{ field: value, operator: 'is_same_as_subject' }])
  return updateParticipantOptionToState(state, { key, value: criteria })
}

function removeDataSheetCriteriaToState (state, { key, index }) {
  const criteria = _.filter(_.get(state, key), (_, i) => index !== i)
  return updateParticipantOptionToState(state, { key, value: criteria })
}

function updateDataSheetCriteriaToState (state, {
  key, index, name, value,
}) {
  const criteria = _.get(state, key).map((criteria, i) => {
    if (i !== index) {
      return criteria
    }
    return { ...criteria, [name]: value }
  })
  return updateParticipantOptionToState(state, { key, value: criteria })
}

const defaultState = { subject: {}, manager: {}, evaluator: {} }

export default function reducer (state = defaultState, { type, payload, response }) {
  switch (type) {
    case FETCH_PARTICIPANT_OPTIONS:
      return response.options
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
