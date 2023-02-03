import _ from 'lodash'
import { createReducer } from '~/utils/redux'

const CONNECTED = 'connection/CONNECTED'
const DISCONNECTED = 'connection/DISCONNECTED'

export const isConnected = state => _.get(state, ['connection', 'connected'])

export const defaultState = { connected: true }

export const connected = () => ({ type: CONNECTED })
export const disconnected = () => ({ type: DISCONNECTED })

const HANDLERS = {
  [CONNECTED]: () => ({ connected: true }),
  [DISCONNECTED]: () => ({ connected: false }),
}

export default createReducer(HANDLERS, defaultState)
