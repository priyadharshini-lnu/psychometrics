export const FETCH_PARTICIPANT_OPTIONS = 'threeSixty/option/FETCH_PARTICIPANT_OPTIONS'
export const UPDATE_PARTICIPANT_OPTIONS = 'threeSixty/option/UPDATE_PARTICIPANT_OPTIONS'
export const SYNC_PARTICIPANT_OPTIONS = 'threeSixty/option/SYNC_PARTICIPANT_OPTIONS'
export const ADD_DATASHEET_CRITERIA = 'threeSixty/option/ADD_DATASHEET_CRITERIA'
export const ADD_DATASHEET_CRITERIA_WITH_DEFAULT_VALUE = 'threeSixty/option/ADD_DATASHEET_CRITERIA_WITH_DEFAULT_VALUE'
export const REMOVE_DATASHEET_CRITERIA = 'threeSixty/option/participants/REMOVE_DATASHEET_CRITERIA'
export const UPDATE_DATASHEET_CRITERIA = 'threeSixty/option/participants/UPDATE_DATASHEET_CRITERIA'
export const UPDATE_RELATIONSHIP = 'threeSixty/option/participants/UPDATE_RELATIONSHIP'

export const fetch = campaignId => ({
  type: FETCH_PARTICIPANT_OPTIONS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/options/participant_options`,
    loader: true,
  },
})

export const syncWithServer = (campaignId, options) => ({
  type: SYNC_PARTICIPANT_OPTIONS,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { participants: options },
  },
})

export const update = (key, value) => ({
  type: UPDATE_PARTICIPANT_OPTIONS,
  payload: { key, value },
})

export const addDatasheetCriteriaWithDefaultValue = key => ({
  type: ADD_DATASHEET_CRITERIA_WITH_DEFAULT_VALUE,
  payload: { key },
})

export const addDatasheetCriteria = (key, value) => ({
  type: ADD_DATASHEET_CRITERIA,
  payload: { key, value },
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

export const updateRelationship = (key, { id }, value) => ({
  type: UPDATE_RELATIONSHIP,
  payload: {
    key,
    id,
    value,
  },
})
