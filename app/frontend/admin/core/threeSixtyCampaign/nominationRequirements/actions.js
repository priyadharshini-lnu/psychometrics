export const FETCH = 'threeSixty/nominationRequirement/FETCH'
export const ADD = 'threeSixty/nominationRequirement/ADD'
export const REMOVE = 'threeSixty/nominationRequirement/REMOVE'
export const MOVE_UP = 'threeSixty/nominationRequirement/MOVE_UP'
export const MOVE_DOWN = 'threeSixty/nominationRequirement/MOVE_DOWN'
export const CHANGE_SELECTED_INDEX = 'threeSixty/nominationRequirement/CHANGE_SELECTED_INDEX'
export const RENAME_SELECTED_NOMINATION = 'threeSixty/nominationRequirement/RENAME'
export const COPY_SELECTED_NOMINATION = 'threeSixty/nominationRequirement/COPY'
export const SYNC_WITH_SERVER = 'threeSixty/nominationRequirement/SYNC_WITH_SERVER'

export const fetch = campaignId => ({
  type: FETCH,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/nomination_requirements`,
  },
})

export const add = payload => ({
  type: ADD,
  payload,
})

export const remove = index => ({
  type: REMOVE,
  payload: { index },
})

export const moveUp = index => ({
  type: MOVE_UP,
  payload: { index },
})

export const moveDown = index => ({
  type: MOVE_DOWN,
  payload: { index },
})

export const changeSelectedIndex = index => ({
  type: CHANGE_SELECTED_INDEX,
  payload: { index },
})

export const rename = name => ({
  type: RENAME_SELECTED_NOMINATION,
  payload: { name },
})

export const copy = () => ({
  type: COPY_SELECTED_NOMINATION,
})

export const syncWithServer = (campaignId, nominationRequirements) => ({
  type: SYNC_WITH_SERVER,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/nomination_requirements/update_or_create`,
    method: 'put',
    body: { nominationRequirements },
  },
})
