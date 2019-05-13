import _ from 'lodash'

const SET_SELECTED_TAB = 'threeSixty/SET_SELECTED_TAB'

export const get = state => _.get(state, ['threeSixtyCampaign', 'selectedParticipantTab'])

export const set = selectedTab => ({
  type: SET_SELECTED_TAB,
  payload: { selectedTab },
})

export const reloadCurrentTab = () => ({
})

const defaultState = null
export default function reducer (state = defaultState, { type, payload }) {
  switch (type) {
    case SET_SELECTED_TAB:
      return payload.selectedTab
    default:
      return state
  }
}
