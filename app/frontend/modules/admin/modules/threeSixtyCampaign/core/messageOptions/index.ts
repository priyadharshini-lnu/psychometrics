import {
  takeLatest, put, select, delay,
} from 'redux-saga/effects'
import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { createReducer } from '~/utils/redux'
import { getCampaignId } from '../campaignDetails'

export const FETCH = 'threeSixty/messageOptions/messageFETCH'
export const UPDATE = 'threeSixty/messageOptions/UPDATE'
export const SYNC_WITH_SERVER = 'threeSixty/messageOptions/SYNC_WITH_SERVER'

type MessageOptions = {[key: string]: string}

export const getMessageOption = state => _.get(state, ['threeSixtyCampaign', 'messageOptions'])

export const fetch = (campaignId: number) => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/options/message_options`,
    loader: true,
  },
})

export const update = (key: string, value: string) => ({
  type: UPDATE,
  payload: { key, value },
})

export const syncWithServer = (campaignId: number, options: MessageOptions) => ({
  type: SYNC_WITH_SERVER,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { messages: options },
  },
})


type FetchType = ApiActionResponse<MessageOptions>
type UpdateType = ReturnType<typeof update>

const HANDLERS = {
  [FETCH]: (_, { response }: FetchType) => response,
  [UPDATE]: (state, { payload: { key, value } }: UpdateType) => ({ ...state, [key]: value }),
}

const defaultState = {}

export default createReducer(HANDLERS, defaultState)


function* genSyncWithServer () {
  yield delay(1000)
  const messageOptions = yield select(getMessageOption)
  const campaignId = yield select(getCampaignId)
  yield put(syncWithServer(campaignId, messageOptions))
}

export const watchers = [
  takeLatest(UPDATE, genSyncWithServer),
]
