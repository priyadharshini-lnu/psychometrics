import {
  takeLatest, put, select, delay,
} from 'redux-saga/effects'
import _ from 'lodash'
import { get as getCurrentCampaignId } from '../currentThreeSixtyCampaignId'

export const FETCH = 'threeSixty/messageOptions/messageFETCH'
export const UPDATE = 'threeSixty/messageOptions/UPDATE'
export const SYNC_WITH_SERVER = 'threeSixty/messageOptions/SYNC_WITH_SERVER'

export const getMessageOption = state => _.get(state, ['threeSixtyCampaign', 'messageOptions'])

export const fetch = campaignId => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/options/message_options`,
  },
})

export const update = (key, value) => ({
  type: UPDATE,
  payload: { key, value },
})

export const syncWithServer = (campaignId, options) => ({
  type: SYNC_WITH_SERVER,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { messages: options },
  },
})

const HANDLERS = {
  [FETCH]: (_, { response }) => response,
  [UPDATE]: (state, { payload: { key, value } }) => ({ ...state, [key]: value }),
}

const defaultState = {}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

function* genSyncWithServer () {
  yield delay(1000)
  const messageOptions = yield select(getMessageOption)
  const campaignId = yield select(getCurrentCampaignId)
  yield put(syncWithServer(campaignId, messageOptions))
}

export const watchers = [
  takeLatest(UPDATE, genSyncWithServer),
]
