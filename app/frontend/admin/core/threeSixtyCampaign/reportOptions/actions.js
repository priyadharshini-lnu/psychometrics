export const FETCH_REPORT_OPTIONS = 'threeSixty/option/FETCH_REPORT_OPTIONS'
export const UPDATE_REPORT_OPTIONS = 'threeSixty/option/UPDATE_REPORT_OPTIONS'
export const SYNC_REPORT_OPTIONS = 'threeSixty/option/SYNC_REPORT_OPTIONS'
export const ADD_AVAILABILITY_CONDITION = 'threeSixty/option/ADD_AVAILABILITY_CONDITION'
export const ADD_NEW_LOGIC_SET_CONDITION = 'threeSixty/option/ADD_NEW_LOGIC_SET_CONDITION'
export const MOVE_CONDITION_TO_NEW_LOGIC_SET = 'threeSixty/option/MOVE_CONDITION_TO_NEW_LOGIC_SET'
export const REMOVE_AVAILABILITY_CONDITION = 'threeSixty/option/REMOVE_AVAILABILITY_CONDITION'
export const UPDATE_AVAILABILITY_CONDITION = 'threeSixty/option/UPDATE_AVAILABILITY_CONDITION'

export const fetch = campaignId => ({
  type: FETCH_REPORT_OPTIONS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/options/report_options`,
    loader: true,
  },
})

export const syncWithServer = (campaignId, options) => ({
  type: SYNC_REPORT_OPTIONS,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { reports: options },
  },
})

export const update = (key, value) => ({
  type: UPDATE_REPORT_OPTIONS,
  payload: { key, value },
})

export const addAvailiblityCondition = index => ({
  type: ADD_AVAILABILITY_CONDITION,
  payload: { index },
})

export const addNewLogicSetCondition = (operator = 'if') => ({
  type: ADD_NEW_LOGIC_SET_CONDITION,
  payload: { operator },
})

export const moveConditionToNextLogicSet = (parentIndex, childIndex) => ({
  type: MOVE_CONDITION_TO_NEW_LOGIC_SET,
  payload: { parentIndex, childIndex },
})

export const removeAvailiblityCondition = (parentIndex, childIndex) => ({
  type: REMOVE_AVAILABILITY_CONDITION,
  payload: { parentIndex, childIndex },
})

export const updateAvailiblityCondition = (parentIndex, childIndex, field, value) => ({
  type: UPDATE_AVAILABILITY_CONDITION,
  payload: {
    parentIndex,
    childIndex,
    field,
    value,
  },
})
