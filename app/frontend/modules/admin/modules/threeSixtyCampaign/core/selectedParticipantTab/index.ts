import _ from 'lodash'
import { createReducer } from '~/utils/redux'

const SET_SELECTED_TAB = 'threeSixty/SET_SELECTED_TAB'

export const get = state => _.get(state, ['threeSixtyCampaign', 'selectedParticipantTab'])

export const set = (selectedTab: string) => ({
  type: SET_SELECTED_TAB,
  payload: { selectedTab },
})

const defaultState = null

type SetSelectedTabAction = ReturnType<typeof set>

const HANDLERS = {
  [SET_SELECTED_TAB]: (_, { payload }: SetSelectedTabAction) => payload.selectedTab,
}

export default createReducer(HANDLERS, defaultState)
